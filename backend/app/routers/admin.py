from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.attendance import Attendance
from app.schemas.user_schema import EmployeeCreateRequest
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    today = datetime.now().date()
    week_start = today - timedelta(days=6)

    employees = (
        db.query(User)
        .filter(User.role != "Admin")
        .all()
    )

    employee_ids = [user.id for user in employees]

    total_employees = len(employees)

    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id.in_(employee_ids),
            Attendance.scan_time >= datetime.combine(
                week_start,
                time.min
            )
        )
        .order_by(Attendance.scan_time.desc())
        .all()
    )

    present_users = set()
    late_today = 0
    recent_activity = []

    for record in attendance_records:

        if record.scan_time.date() != today:
            continue

        user = next(
            (u for u in employees if u.id == record.user_id),
            None
        )

        if not user:
            continue

        present_users.add(user.id)

        if (
            record.action == "Check In"
            and (
                record.scan_time.hour > 10
                or (
                    record.scan_time.hour == 10
                    and record.scan_time.minute > 10
                )
            )
        ):
            late_today += 1

        recent_activity.append(
            {
                "employee": user.name,
                "action": record.action,
                "time": record.scan_time.strftime("%I:%M %p")
            }
        )

    present_today = len(present_users)
    absent_today = total_employees - present_today

    weekly_chart = []

    for i in range(6, -1, -1):

        day = today - timedelta(days=i)

        users_present = {
            record.user_id
            for record in attendance_records
            if record.scan_time.date() == day
        }

        weekly_chart.append(
            {
                "day": day.strftime("%a"),
                "present": len(users_present)
            }
        )

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "late_today": late_today,
        "weekly_chart": weekly_chart,
        "recent_activity": recent_activity[:10]
    }

@router.post("/employees")
def create_employee(

    employee: EmployeeCreateRequest,
    db: Session = Depends(get_db)

):

    existing = (
        db.query(User)
        .filter(User.email == employee.email)
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    hashed_password = pwd_context.hash(
        employee.password
    )

    new_employee = User(
        name=employee.name,
        email=employee.email,
        password_hash=hashed_password,
        status=employee.status
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "message":"Employee created successfully."
    }