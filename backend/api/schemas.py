"""Pydantic models for API request/response validation."""

from typing import Any

from pydantic import BaseModel


class SuccessResponse(BaseModel):
    data: Any
    status: str = "success"


class LoginRequest(BaseModel):
    username: str
    password: str
