"""
SQLAlchemy models for users and analyses.
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(512), nullable=False)
    text = Column(Text, nullable=True)  # first 5k chars for preview
    metadata_ = Column("metadata", JSON, nullable=True)  # court, date, judge etc
    summary = Column(Text, nullable=True)
    risk_score = Column(Integer, default=0)
    risks = Column(JSON, nullable=True)  # list of {severity, title, description, impact}
    created_at = Column(DateTime, default=datetime.utcnow)
