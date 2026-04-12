"""Integration tests for the auth service against a real Postgres."""
from __future__ import annotations

import pytest
from app.services import auth as auth_service

pytestmark = pytest.mark.integration


class TestSignup:
    async def test_creates_user_and_returns_tokens(self, db_session) -> None:  # type: ignore[no-untyped-def]
        user, tokens = await auth_service.signup(
            db_session,
            email="first@example.org",
            password="correct horse battery staple",
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        await db_session.commit()

        assert user.email == "first@example.org"
        assert user.password_hash != "correct horse battery staple"
        assert tokens.access_token
        assert tokens.refresh_token
        assert tokens.token_type == "bearer"

    async def test_duplicate_email_rejected(self, db_session) -> None:  # type: ignore[no-untyped-def]
        await auth_service.signup(
            db_session,
            email="dup@example.org",
            password="correct horse battery staple",
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        await db_session.commit()

        with pytest.raises(auth_service.EmailAlreadyRegistered):
            await auth_service.signup(
                db_session,
                email="dup@example.org",
                password="correct horse battery staple",
                user_agent="pytest",
                ip_address="127.0.0.1",
            )


class TestLogin:
    async def test_login_with_correct_password(self, db_session) -> None:  # type: ignore[no-untyped-def]
        await auth_service.signup(
            db_session,
            email="login@example.org",
            password="correct horse battery staple",
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        await db_session.commit()

        user, tokens = await auth_service.login(
            db_session,
            email="login@example.org",
            password="correct horse battery staple",
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        assert user.email == "login@example.org"
        assert tokens.access_token

    async def test_login_with_wrong_password_raises(self, db_session) -> None:  # type: ignore[no-untyped-def]
        await auth_service.signup(
            db_session,
            email="wrong@example.org",
            password="correct horse battery staple",
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        await db_session.commit()

        with pytest.raises(auth_service.InvalidCredentials):
            await auth_service.login(
                db_session,
                email="wrong@example.org",
                password="wrong-password",
                user_agent="pytest",
                ip_address="127.0.0.1",
            )

    async def test_login_with_unknown_email_raises(self, db_session) -> None:  # type: ignore[no-untyped-def]
        with pytest.raises(auth_service.InvalidCredentials):
            await auth_service.login(
                db_session,
                email="ghost@example.org",
                password="anything",
                user_agent="pytest",
                ip_address="127.0.0.1",
            )


class TestRefresh:
    async def test_refresh_rotates_token(self, db_session) -> None:  # type: ignore[no-untyped-def]
        _user, tokens = await auth_service.signup(
            db_session,
            email="rotate@example.org",
            password="correct horse battery staple",
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        await db_session.commit()

        new_tokens = await auth_service.refresh(
            db_session,
            refresh_token=tokens.refresh_token,
            user_agent="pytest",
            ip_address="127.0.0.1",
        )
        assert new_tokens.refresh_token != tokens.refresh_token

        # Old refresh token is now revoked — second refresh with it must fail.
        with pytest.raises(auth_service.InvalidRefreshToken):
            await auth_service.refresh(
                db_session,
                refresh_token=tokens.refresh_token,
                user_agent="pytest",
                ip_address="127.0.0.1",
            )
