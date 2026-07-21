from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.notification import Notification
from app.models.user import User


def create_incomplete_attendance_notification(
    db: Session,
    user: User
):

    yesterday = datetime.now().date() - timedelta(days=1)

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

    existing = (

        db.query(Notification)
        .filter(

            Notification.user_id == user.id,
            Notification.type == "attendance",
            Notification.attendance_date == datetime.combine(yesterday, datetime.min.time()),
            Notification.is_closed == False
            
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

        attendance_date=datetime.combine(
            yesterday,
            datetime.min.time(),
        )

    )

    db.add(notification)

    try:
        
        db.commit()

    except Exception as e:
        
        db.rollback()
        print("Notification Error:", e)
        raise