"""Pydantic request / response models for authentication endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ─── Requests ──────────────────────────────────────────────────────────


class SignupRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(
        ...,
        min_length=12,
        max_length=256,
        description="At least 12 characters. Length is the single most important factor.",
    )


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=256)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=16, max_length=512)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., min_length=16, max_length=512)


# ─── Responses ─────────────────────────────────────────────────────────


class TokenPair(BaseModel):
    """Returned on signup, login, and refresh."""

    access_token: str
    refresh_token: str
    token_type: str = Field(default="bearer")
    access_expires_at: datetime
    refresh_expires_at: datetime


class UserPublic(BaseModel):
    """Minimal user representation returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime


class MessageResponse(BaseModel):
    message: str
