from datetime import datetime, timezone
from app.models.attendance import Attendance


def get_allowed_actions(db, current_user):

    today = datetime.now(timezone.utc).date()

    today_records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id
        )
        .order_by(
            Attendance.scan_time.asc()
        )
        .all()
    )

    today_records = [
        r
        for r in today_records
        if r.scan_time.date() == today
    ]

    if not today_records:
        return ["Check In"]

    last_action = today_records[-1].action

    if last_action == "Check In":
        return ["Break", "Check Out"]

    elif last_action == "Break":
        return ["Break Over"]

    elif last_action == "Break Over":
        return ["Break", "Check Out"]

    elif last_action == "Check Out":
        return []

    return []