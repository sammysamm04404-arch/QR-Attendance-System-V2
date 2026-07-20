from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone

from app.database.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    location_name = Column(
        String,
        nullable=True
    )

    scan_time = Column(
        DateTime,
        default=datetime.now(timezone.utc)
    )

    created_at = Column(
        DateTime,
        default=datetime.now(timezone.utc)
    )