from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone, time

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.attendance import Attendance

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def format_duration(duration):

    if not duration:
        return "00h 00m"

    total_seconds = int(duration.total_seconds())

    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60

    return f"{hours:02d}h {minutes:02d}m"


@router.get("")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    now = datetime.now()

    today = now.date()

    today_start = datetime.combine(today, time.min)
    today_end = datetime.combine(today, time.max)

    records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id
        )
        .order_by(
            Attendance.scan_time.asc()
        )
        .all()
    )

    # -------------------------------
    # Today's Attendance
    # -------------------------------

    today_records = [

        record

        for record in records

        if today_start <= record.scan_time <= today_end

    ]

    check_in = next(

        (
            record
            for record in today_records
            if record.action == "Check In"
        ),

        None

    )

    check_out = next(

        (
            record
            for record in reversed(today_records)
            if record.action == "Check Out"
        ),

        None

    )

    working_duration = None

    status = "Not Checked In"

    last_action = None

    if today_records:
        last_action = today_records[-1].action

    if check_in:

        if last_action == "Break":

            working_duration = now - check_in.scan_time
            status = "Out For Break"

        elif last_action == "Check Out":

            working_duration = check_out.scan_time - check_in.scan_time
            status = "Completed"

        else:

            working_duration = now - check_in.scan_time
            status = "Working"

    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())

    weekly_chart = []

    for i in range(7):

        day = monday + timedelta(days=i)

        day_start = datetime.combine(
            day,
            time.min
        )

        day_end = datetime.combine(
            day,
            time.max
        )

        day_records = [
            r
            for r in records
            if day_start <= r.scan_time <= day_end
        ]

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

        hours = 0

        if cin and cout:
            hours = round(
                (cout.scan_time - cin.scan_time).total_seconds() / 3600,
                2
            )

        weekly_chart.append({
            "day": day.strftime("%a"),
            "hours": hours
        })

    today = datetime.now().date()
    current_month = today.month
    current_year = today.year
    grouped = {}

    for record in records:

        if (
            record.scan_time.year != current_year
            or
            record.scan_time.month != current_month
        ):
            continue

        grouped.setdefault(
            record.scan_time.date(),
            []
        ).append(record)
        
    present_days = 0
    late_entries = 0
    completed_days = 0

    total_work_seconds = 0

    LATE_ENTRY_TIME = time(10, 10)

    for day_records in grouped.values():

        day_records.sort(key=lambda x: x.scan_time)

        cin = next(
            (r for r in day_records if r.action == "Check In"),
            None
        )

        cout = next(
            (r for r in reversed(day_records) if r.action == "Check Out"),
            None
        )

        if cin:

            present_days += 1

            if cin.scan_time.time() > LATE_ENTRY_TIME:

                late_entries += 1

        if cin and cout:

            completed_days += 1

            total_work_seconds += (
                cout.scan_time - cin.scan_time
            ).total_seconds()


    average_hours = "00h 00m"

    if completed_days > 0:

        average = timedelta(
            seconds=total_work_seconds / completed_days
        )

        average_hours = format_duration(average)


    days_elapsed = datetime.now().day
    attendance_percentage = round(

        (present_days / days_elapsed) * 100,
        1
    )

    return {

        "user": {

            "name": current_user.name,

            "email": current_user.email

        },

        "today": {

            "check_in": check_in.scan_time if check_in else None,

            "check_out": check_out.scan_time if check_out else None,

            "working_hours": format_duration(working_duration),

            "status": status

        },

        "weekly_chart": weekly_chart,

        "attendance_summary": {

            "present_days": present_days,

            "attendance_percentage": attendance_percentage,

            "average_hours": average_hours,

            "late_entries": late_entries

        }

    }