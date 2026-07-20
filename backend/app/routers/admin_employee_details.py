from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.attendance import Attendance

router = APIRouter(
    prefix="/admin",
    tags=["Admin Employee Details"]
)


def format_duration(duration):

    if not duration:
        return "00h 00m"

    seconds = int(duration.total_seconds())
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60

    return f"{hours:02d}h {minutes:02d}m"


@router.get("/employees/{employee_id}")
def employee_details(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    employee = (
        db.query(User)
        .filter(User.id == employee_id)
        .first()
    )

    if not employee:

        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    records = (

        db.query(Attendance)

        .filter(
            Attendance.user_id == employee_id
        )

        .order_by(
            Attendance.scan_time.desc()
        )
        .all()
    )

    today = datetime.now().date()

    today_records = [
        r
        for r in records
        if r.scan_time.date() == today
    ]

    check_in = next(
        (
            r
            for r in today_records
            if r.action == "Check In"
        ),
        None
    )

    check_out = next(
        (
            r
            for r in reversed(today_records)
            if r.action == "Check Out"
        ),
        None
    )

    working_hours = "00h 00m"

    if check_in and check_out:

        working_hours = format_duration(
            check_out.scan_time -
            check_in.scan_time
        )

    grouped = {}
    present_days = 0
    late_days = 0
    total_seconds = 0
    completed_days = 0
    history = []

    for record in records:

        grouped.setdefault(
            record.scan_time.date(),
            []
        ).append(record)

    for day, day_records in grouped.items():

        present_days += 1
        day_records.sort(
            key=lambda x: x.scan_time
        )

        cin = next(
            (
                r
                for r in day_records
                if r.action == "Check In"
            ),
            None
        )

        cout = next(
            (
                r
                for r in reversed(day_records)
                if r.action == "Check Out"
            ),
            None
        )

        if cin:

            if cin.scan_time.hour > 9 or (
                cin.scan_time.hour == 9
                and cin.scan_time.minute > 30
            ):
                late_days += 1

        hours = "00h 00m"

        if cin and cout:
            duration = cout.scan_time - cin.scan_time
            hours = format_duration(duration)
            total_seconds += duration.total_seconds()
            completed_days += 1

        history.append({
            "date": str(day),
            "check_in": cin.scan_time.strftime("%I:%M %p") if cin else "--",
            "check_out": cout.scan_time.strftime("%I:%M %p") if cout else "--",
            "working_hours": hours
        })

    average_hours = "00h 00m"

    if completed_days:

        average = timedelta(
            seconds=total_seconds / completed_days
        )

        average_hours = format_duration(average)

    return {

        "employee": {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "status": employee.status,
            "role": employee.role
        },

        "today": {
            "check_in": check_in.scan_time.strftime("%I:%M %p") if check_in else "--",
            "check_out": check_out.scan_time.strftime("%I:%M %p") if check_out else "--",
            "working_hours": working_hours
        },

        "summary": {
            "present_days": present_days,
            "late_days": late_days,
            "average_hours": average_hours
        },

        "history": history

    }