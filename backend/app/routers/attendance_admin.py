from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.attendance import Attendance
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Attendance Management"])


def working_hours(cin, cout):
    if not cin or not cout:
        return "--"

    seconds = int((cout - cin).total_seconds())
    h = seconds // 3600
    m = (seconds % 3600) // 60

    return f"{h:02d}h {m:02d}m"


@router.get("/attendance")
def get_attendance(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: str = "",
    status: str = "All",
    single_date: date | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1. Determine target dates without wiping out history
    if single_date:
        target_dates = [single_date]
    elif from_date and to_date:
        delta = (to_date - from_date).days
        target_dates = [from_date + timedelta(days=i) for i in range(delta + 1)]
    else:
        all_scans = db.query(Attendance.scan_time).all()
        if all_scans:
            target_dates = sorted(
                list({s[0].date() for s in all_scans}), reverse=True
            )
        else:
            target_dates = [date.today()]

    # 2. EXCLUDE ADMIN USERS HERE
    # Note: If your User model uses `role` (e.g., User.role != "admin"), use:
    users = db.query(User).filter(User.role != "admin").all()

    # (Or if your User model uses a boolean flag like `is_admin`, use instead):
    # users = db.query(User).filter(User.is_admin == False).all()

    rows = []

    for user in users:
        if search:
            if (
                search.lower() not in user.name.lower()
                and search.lower() not in user.email.lower()
            ):
                continue

        records = (
            db.query(Attendance)
            .filter(Attendance.user_id == user.id)
            .order_by(Attendance.scan_time.asc())
            .all()
        )

        grouped = {}
        for r in records:
            grouped.setdefault(r.scan_time.date(), []).append(r)

        for day in target_dates:
            day_records = grouped.get(day, [])

            if not day_records:
                attendance_status = "Absent"
                cin = None
                cout = None
            else:
                cin = next(
                    (x for x in day_records if x.action == "Check In"), None
                )
                cout = next(
                    (
                        x
                        for x in reversed(day_records)
                        if x.action == "Check Out"
                    ),
                    None,
                )

                if cin:
                    attendance_status = "Present"
                    if cin.scan_time.hour > 10 or (
                        cin.scan_time.hour == 10 and cin.scan_time.minute > 30
                    ):
                        attendance_status = "Late"
                else:
                    attendance_status = "Absent"

            attendance_row = {
                "user_id": user.id,
                "employee": user.name,
                "email": user.email,
                "date": str(day),
                "check_in": (
                    cin.scan_time.strftime("%I:%M %p") if cin else "--"
                ),
                "check_out": (
                    cout.scan_time.strftime("%I:%M %p") if cout else "--"
                ),
                "working_hours": working_hours(
                    cin.scan_time if cin else None,
                    cout.scan_time if cout else None,
                ),
                "status": attendance_status,
            }

            rows.append(attendance_row)

    if status != "All":
        rows = [row for row in rows if row["status"] == status]

    rows.sort(key=lambda x: x["date"], reverse=True)

    total = len(rows)
    start = (page - 1) * limit
    end = start + limit

    summary = {
        "total_records": total,
        "present": len([r for r in rows if r["status"] == "Present"]),
        "late": len([r for r in rows if r["status"] == "Late"]),
        "absent": len([r for r in rows if r["status"] == "Absent"]),
    }

    return {
        "attendance": rows[start:end],
        "summary": summary,
        "page": page,
        "total_pages": (total + limit - 1) // limit if limit else 1,
        "total": total,
    }