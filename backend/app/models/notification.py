from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    type = Column(
        String,
        default="system"
    )

    # Actual attendance date for which this notification was generated
    attendance_date = Column(
        DateTime(timezone=True),
        nullable=True
    )

    related_date = Column(
        String,
        nullable=True
    )

    is_read = Column(
        Boolean,
        default=False
    )

    is_closed = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User")