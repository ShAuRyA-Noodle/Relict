"""WebSocket endpoint that relays per-job events to the browser.

Flow:
    1. Client opens ``/ws/jobs/{job_id}?token=<access_token>``.
    2. We authenticate the token, check the caller owns the job.
    3. We subscribe to Redis channel ``job.{job_id}.events``.
    4. Any message published by the worker is forwarded as-is.

Authentication over WebSocket uses a query-string token because browser
``WebSocket`` APIs cannot set custom headers. The token is short-lived
(15 min) so exposing it in a URL is an acceptable trade-off for dev;
production deployments should terminate TLS before a reverse proxy.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from typing import TYPE_CHECKING

import jwt
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from app.core.logging import get_logger
from app.core.security import decode_access_token
from app.db.models import Job, User
from app.db.session import async_session_factory
from app.services.queue import channel_for_job, get_redis

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

log = get_logger(__name__)
router = APIRouter(tags=["ws"])


@router.websocket("/ws/jobs/{job_id}")
async def job_events(
    websocket: WebSocket,
    job_id: uuid.UUID,
    token: str = Query(..., description="Short-lived access JWT"),
) -> None:
    # ─── Authenticate ──────────────────────────────────────────────────
    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # ─── Authorize (caller must own the job) ───────────────────────────
    session: AsyncSession
    async with async_session_factory() as session:
        user = await session.get(User, user_id)
        if user is None or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        job = await session.get(Job, job_id)
        if job is None or job.user_id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    # ─── Accept & subscribe ────────────────────────────────────────────
    await websocket.accept()
    redis = get_redis()
    channel = channel_for_job(job_id)

    # A snapshot event so the client immediately knows the server is
    # listening even before the first progress event arrives.
    await websocket.send_text(
        json.dumps(
            {
                "kind": "ws.connected",
                "job_id": str(job_id),
                "message": "Subscribed to job event stream",
            }
        )
    )

    pubsub = redis.pubsub()
    try:
        await pubsub.subscribe(channel)

        # Keep pulling messages until the client disconnects.
        while True:
            try:
                message = await asyncio.wait_for(
                    pubsub.get_message(ignore_subscribe_messages=True),
                    timeout=30.0,
                )
            except TimeoutError:
                # Send a heartbeat to keep proxies from closing the socket.
                try:
                    await websocket.send_text(json.dumps({"kind": "ws.heartbeat"}))
                except WebSocketDisconnect:
                    break
                continue

            if message is None:
                continue

            data = message.get("data")
            if isinstance(data, bytes):
                payload_str = data.decode("utf-8", errors="replace")
            elif isinstance(data, str):
                payload_str = data
            else:
                continue

            try:
                await websocket.send_text(payload_str)
            except WebSocketDisconnect:
                break
    finally:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
        except Exception as exc:  # noqa: BLE001
            log.warning("ws.pubsub_cleanup_failed", error=str(exc))
        log.info("ws.closed", job_id=str(job_id), user_id=str(user_id))
