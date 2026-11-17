from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float
from database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    company = Column(String(150), nullable=True)
    level = Column(String(30), nullable=False, default="Junior")
    question_count = Column(Integer, nullable=False, default=10)
    status = Column(String(30), nullable=False, default="scheduled")
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
