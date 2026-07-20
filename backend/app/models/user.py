from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    role = Column(String(50), nullable=False, default="Employee")

    status = Column(String(20), nullable=False, default="Active")