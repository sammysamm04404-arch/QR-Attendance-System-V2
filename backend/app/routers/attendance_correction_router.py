from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.session import get_db
from app.dependencies.auth import get_current_user

from app.models.notification import Notification
from app.models.attendance_correction import AttendanceCorrection
from app.schemas.attendance_correction_schema import AttendanceCorrectionRequest

router = APIRouter(
    prefix="/attendance-corrections",
    tags=["Attendance Corrections"]
)


@router.post("/request")
def create_correction_request(
    correction: AttendanceCorrectionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == correction.notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    # Prevent using an already closed or processed notification
    if getattr(notification, "is_closed", False):
        raise HTTPException(
            status_code=400,
            detail="A request has already been submitted for this notification."
        )

    if not hasattr(notification, "attendance_date") or notification.attendance_date is None:
        raise HTTPException(
            status_code=400,
            detail="Attendance date was not stored with this notification."
        )

    # Standardize to date object for DB queries and storage
    attendance_date = notification.attendance_date.date() if isinstance(notification.attendance_date, datetime) else notification.attendance_date

    checkout_time = datetime.strptime(
        correction.checkout_time,
        "%H:%M"
    ).time()

    checkout_datetime = datetime.combine(
        attendance_date,
        checkout_time
    )

    # Check using the extracted date object, not the full datetime
    existing = (
        db.query(AttendanceCorrection)
        .filter(
            AttendanceCorrection.user_id == current_user.id,
            AttendanceCorrection.attendance_date == attendance_date,
            AttendanceCorrection.status == "Pending"
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Correction request already submitted."
        )

    request = AttendanceCorrection(
        user_id=current_user.id,
        attendance_date=attendance_date,  # Save clean date object
        requested_checkout=checkout_datetime,
        reason=correction.reason,
        notes=correction.notes,
        status="Pending"
    )

    db.add(request)

    notification.is_read = True
    notification.is_closed = True

    db.commit()
    db.refresh(request)

    return {
        "message": "Attendance correction request submitted successfully."
    }