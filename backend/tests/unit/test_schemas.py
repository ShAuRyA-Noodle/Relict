"""Unit tests for Pydantic request / response schemas."""
from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.auth import LoginRequest, SignupRequest


class TestSignupRequest:
    def test_valid_input_parses(self) -> None:
        req = SignupRequest(email="user@example.org", password="a-very-long-password")
        assert req.email == "user@example.org"

    def test_short_password_rejected(self) -> None:
        with pytest.raises(ValidationError):
            SignupRequest(email="user@example.org", password="short")

    def test_bad_email_rejected(self) -> None:
        with pytest.raises(ValidationError):
            SignupRequest(email="not-an-email", password="a-very-long-password")

    def test_email_is_stripped(self) -> None:
        req = SignupRequest(email="  user@example.org  ", password="a-very-long-password")
        assert req.email == "user@example.org"


class TestLoginRequest:
    def test_valid(self) -> None:
        req = LoginRequest(email="user@example.org", password="hunter2")
        assert req.password == "hunter2"

    def test_empty_password_rejected(self) -> None:
        with pytest.raises(ValidationError):
            LoginRequest(email="user@example.org", password="")
