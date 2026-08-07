import io
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
import pandas as pd
from sqlalchemy import func
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
    if seconds <= 0:
        return "--"

    h = seconds // 3600
    m = (seconds % 3600) // 60

    return f"{h:02d}h {m:02d}m"


def calculate_break_hours(day_records) -> str:
    """Calculates cumulative total break duration across single or multiple breaks in a day."""
    if not day_records:
        return "--"

    total_seconds = 0
    current_break_start = None

    # Ensure records are sorted chronologically
    sorted_records = sorted(day_records, key=lambda x: x.scan_time)

    for r in sorted_records:
        action = r.action.strip().lower() if r.action else ""

        # Matches 'Break In' or 'Break Start'
        if action in ("break in", "break start"):
            current_break_start = r.scan_time

        # Matches 'Break Out' or 'Break End' and pairs with the open break start
        elif action in ("break out", "break end") and current_break_start:
            if r.scan_time > current_break_start:
                total_seconds += int((r.scan_time - current_break_start).total_seconds())
            current_break_start = None

    if total_seconds <= 0:
        return "--"

    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    return f"{h:02d}h {m:02d}m"


def build_attendance_rows(
    db: Session,
    search: str = "",
    status: str = "All",
    single_date: date | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
):
    """Helper function to build attendance rows based on active filters."""
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

    users = db.query(User).all()
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
                        cin.scan_time.hour == 10
                        and cin.scan_time.minute > 10
                    ):
                        attendance_status = "Late"
                else:
                    attendance_status = "Absent"

            attendance_row = {
                "user_id": user.id,
                "employee": user.name,
                "email": user.email,
                "role": user.role,
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
                "break_hours": calculate_break_hours(day_records),
                "status": attendance_status,
            }

            rows.append(attendance_row)

    if status != "All":
        rows = [row for row in rows if row["status"] == status]

    rows.sort(key=lambda x: x["date"], reverse=True)
    return rows


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
    rows = build_attendance_rows(
        db=db,
        search=search,
        status=status,
        single_date=single_date,
        from_date=from_date,
        to_date=to_date,
    )

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


@router.get("/attendance/export")
def export_attendance_excel(
    search: str = "",
    status: str = "All",
    single_date: date | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = build_attendance_rows(
        db=db,
        search=search,
        status=status,
        single_date=single_date,
        from_date=from_date,
        to_date=to_date,
    )

    export_data = []
    for r in rows:
        export_data.append({
            "Employee": r["employee"],
            "Email": r["email"],
            "Role": r["role"],
            "Date": r["date"],
            "Status": r["status"],
            "Check In": r["check_in"],
            "Check Out": r["check_out"],
            "Working Hours": r["working_hours"],
            "Break Hours": r["break_hours"],
        })

    df = pd.DataFrame(export_data)
    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Attendance Report")

    output.seek(0)

    filename = f"Attendance_Report_{date.today()}.xlsx"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }

    return StreamingResponse(
        output,
        headers=headers,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/attendance/{user_id}/{attendance_date}")
def get_attendance_details(
    user_id: int,
    attendance_date: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found.")

    try:
        parsed_date = datetime.strptime(attendance_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid date format. Use YYYY-MM-DD."
        )

    records = (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id)
        .all()
    )

    day_records = [r for r in records if r.scan_time.date() == parsed_date]
    day_records.sort(key=lambda x: x.scan_time)

    check_in = next(
        (r for r in day_records if r.action == "Check In"), None
    )
    check_out = next(
        (r for r in reversed(day_records) if r.action == "Check Out"), None
    )

    return {
        "employee": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
        },
        "attendance": {
            "date": str(parsed_date),
            "check_in": check_in.scan_time if check_in else None,
            "check_out": check_out.scan_time if check_out else None,
            "working_hours": working_hours(
                check_in.scan_time if check_in else None,
                check_out.scan_time if check_out else None,
            ),
            "break_hours": calculate_break_hours(day_records),
        },
    }