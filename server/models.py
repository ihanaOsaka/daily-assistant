"""Pydantic models for request/response validation."""
from pydantic import BaseModel
from typing import Optional


class TaskCreate(BaseModel):
    command: str
    category: str = "general"
    priority: int = 0


class TaskResult(BaseModel):
    status: str  # completed | failed
    result: Optional[str] = None
    error: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    status: str
    command: str
    category: str
    priority: int
    result: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class LoginRequest(BaseModel):
    password: str
