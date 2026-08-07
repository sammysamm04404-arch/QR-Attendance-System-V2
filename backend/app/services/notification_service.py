from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.notification import Notification
from app.models.user import User
from app.models.attendance_correction import AttendanceCorrection

def get_local_now():
    return (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).replace(tzinfo=None)

def create_incomplete_attendance_notification(
    db: Session,
    user: User
):

    yesterday = datetime.now().date() - timedelta(days=1)
    attendance_date = datetime.combine(
        yesterday,
        datetime.min.time(),
    )

    records = (
    db.query(Attendance)
    .filter(
            Attendance.user_id == user.id,
            Attendance.scan_time >= datetime.combine(yesterday, datetime.min.time()),
            Attendance.scan_time < datetime.combine(yesterday + timedelta(days=1), datetime.min.time())
        )
        .all()
    )

    
    check_in = next(

        (
            record
            for record in records
            if record.action == "Check In"
        ),

        None

    )

    check_out = next(

        (
            record
            for record in records
            if record.action == "Check Out"
        ),

        None

    )

    if not check_in or check_out:
        return

    pending_correction = (
        db.query(AttendanceCorrection)
        .filter(
            AttendanceCorrection.user_id == user.id,
            AttendanceCorrection.attendance_date == attendance_date,
            AttendanceCorrection.status == "Pending",
        )
        .first()
    )

    if pending_correction:
        return

    existing = (

        db.query(Notification)
        .filter(

            Notification.user_id == user.id,
            Notification.type == "attendance",
            Notification.attendance_date == attendance_date,
            
        )
        .first()
    )

    if existing:
        return

    notification = Notification(

        user_id=user.id,
        title="Attendance Incomplete",
        message=f"Your attendance for {yesterday.strftime('%d %b %Y')} is incomplete. Please resolve it.",
        type="attendance",
        attendance_date=attendance_date,
        created_at = get_local_now()

    )

    db.add(notification)

    try:
        
        db.commit()

    except Exception as e:
        
        db.rollback()
        print("Notification Error:", e)
        raise