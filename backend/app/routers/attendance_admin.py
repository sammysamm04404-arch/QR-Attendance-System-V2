from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.attendance import Attendance
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Attendance Management"]
)


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
    current_user=Depends(get_current_user)

):
    users = db.query(User).all()
    rows = []

    for user in users:

        if search:

            if (

                search.lower() not in user.name.lower()
                and
                search.lower() not in user.email.lower()

            ):

                continue

        records = (

            db.query(Attendance)

            .filter(
                Attendance.user_id == user.id
            )

            .order_by(
                Attendance.scan_time.desc()
            )

            .all()

        )

        grouped = {}

        for r in records:

            grouped.setdefault(
                r.scan_time.date(),
                []
            ).append(r)

        for day, day_records in grouped.items():

            day_records.sort(
                key=lambda x: x.scan_time
            )

            cin = next(

                (
                    x
                    for x in day_records
                    if x.action == "Check In"
                ),

                None

            )

            cout = next(

                (
                    x
                    for x in reversed(day_records)
                    if x.action == "Check Out"
                ),

                None

            )

            attendance_status = "Absent"

            if cin:

                attendance_status = "Present"

                if (

                    cin.scan_time.hour > 10
                    or
                    (
                        cin.scan_time.hour == 10
                        and cin.scan_time.minute > 30
                    )

                ):

                    attendance_status = "Late"

            attendance_row = {

                "user_id": user.id,
                "employee": user.name,
                "email": user.email,
                "date": str(day),

                "check_in":

                    cin.scan_time.strftime("%I:%M %p")
                    if cin
                    else "--",

                "check_out":

                    cout.scan_time.strftime("%I:%M %p")
                    if cout
                    else "--",

                "working_hours":

                    working_hours(
                        cin.scan_time if cin else None,
                        cout.scan_time if cout else None
                    ),

                "status": attendance_status
            }

            rows.append(attendance_row)

    if status != "All":

        rows = [
            row
            for row in rows
            if row["status"] == status
        ]

    if single_date:

        rows = [
            row
            for row in rows
            if row["date"] == str(single_date)
        ]

    if from_date and to_date:

        rows = [
            row
            for row in rows
            if from_date <= datetime.strptime(
                row["date"],
                "%Y-%m-%d"
            ).date() <= to_date
        ]

    rows.sort(
        key=lambda x: x["date"],
        reverse=True
    )

    total = len(rows)
    start = (page - 1) * limit
    end = start + limit

    summary = {
        "total_records": total,
        "present": len(
            [
                r
                for r in rows
                if r["status"] == "Present"
            ]
        ),

        "late": len(
            [
                r
                for r in rows
                if r["status"] == "Late"
            ]
        ),

        "absent": len(
            [
                r
                for r in rows
                if r["status"] == "Absent"
            ]
        )
    }

    return {
        "attendance": rows[start:end],
        "summary": summary,
        "page": page,
        "total_pages": (total + limit - 1) // limit,
        "total": total
    }

@router.get("/attendance/{user_id}/{attendance_date}")
def get_attendance_details(

    user_id: int,
    attendance_date: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)

):

    user = (

        db.query(User)
        .filter(User.id == user_id)
        .first()

    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    attendance_date = datetime.strptime(
        attendance_date,
        "%Y-%m-%d"
    ).date()

    records = (

        db.query(Attendance)
        .filter(
            Attendance.user_id == user_id
        )
        .all()

    )

    day_records = [
        r
        for r in records
        if r.scan_time.date() == attendance_date
    ]

    if not day_records:

        raise HTTPException(
            status_code=404,
            detail="Attendance not found."
        )

    day_records.sort(
        key=lambda x: x.scan_time
    )

    check_in = next(

        (
            r
            for r in day_records
            if r.action == "Check In"
        ),

        None

    )

    check_out = next(

        (
            r
            for r in reversed(day_records)
            if r.action == "Check Out"
        ),

        None

    )

    return {

        "employee":{

            "id":user.id,
            "name":user.name,
            "email":user.email,
            "status":user.status

        },

        "attendance":{

            "date":attendance_date,

            "check_in":

                check_in.scan_time
                if check_in
                else None,

            "check_out":

                check_out.scan_time
                if check_out
                else None,

            "working_hours":

                working_hours(
                    check_in.scan_time if check_in else None,
                    check_out.scan_time if check_out else None
                )

        }

    }