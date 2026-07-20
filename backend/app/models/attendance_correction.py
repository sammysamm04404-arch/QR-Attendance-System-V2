from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text
)

from datetime import datetime, timezone

from app.database.database import Base


class AttendanceCorrection(Base):

    __tablename__ = "attendance_corrections"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    attendance_date = Column(
        DateTime,
        nullable=False
    )

    requested_checkout = Column(
        DateTime,
        nullable=False
    )

    reason = Column(
        String(100),
        nullable=False
    )

    notes = Column(
        Text
    )

    status = Column(
        String(30),
        default="Pending"
    )

    admin_remark = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.now(timezone.utc)
    )

    reviewed_at = Column(
        DateTime
    )