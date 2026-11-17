from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class InterviewCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    company: Optional[str] = Field(default=None, max_length=150)
    level: str = Field(default="Junior", max_length=30)
    question_count: int = Field(default=10, ge=3, le=20)


class InterviewUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=150)
    company: Optional[str] = Field(default=None, max_length=150)
    level: Optional[str] = Field(default=None, max_length=30)
    question_count: Optional[int] = Field(default=None, ge=3, le=20)
    status: Optional[str] = Field(default=None, max_length=30)
    score: Optional[float] = Field(default=None, ge=0, le=100)


class InterviewResponse(BaseModel):
    id: int
    title: str
    company: Optional[str]
    level: str
    question_count: int
    status: str
    score: Optional[float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
