from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.user import User
from fastapi import HTTPException
from app.schemas.attendance_schema import (
    AttendanceScanRequest
)
from app.schemas.allowed_actions_schema import AllowedActionsResponse
from app.services.attendance_service import get_allowed_actions
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.post("/scan")
def scan_attendance(
    attendance_data: AttendanceScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    allowed_actions = get_allowed_actions(
        db,
        current_user
    )

    if attendance_data.action not in allowed_actions:

        raise HTTPException(
            status_code=400,
            detail="Invalid attendance action."
        )
    today = datetime.now(timezone.utc).date()

    today_records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id
        )
        .all()
    )

    today_records = [
        record
        for record in today_records
        if record.scan_time.date() == today
    ]

    last_attendance = (
        today_records[-1]
        if today_records
        else None
    )

    if (
        last_attendance
        and
        last_attendance.action == attendance_data.action
    ):
        raise HTTPException(
            status_code=400,
            detail=f"User already {attendance_data.action}"
        )

    attendance = Attendance(
        user_id=current_user.id,
        action=attendance_data.action,
        location_name=attendance_data.location_name,
        scan_time=datetime.now(timezone.utc)
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "Attendance recorded successfully",
        "attendance_id": attendance.id,
        "user_id": current_user.id,
        "action": attendance.action,
        "location_name": attendance.location_name,
        "scan_time": attendance.scan_time
    }

@router.get("/my-history")
def get_my_attendance_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id
        )
        .order_by(
            Attendance.scan_time.desc()
        )
        .all()
    )

    return attendance_records

@router.get("/all")
def get_all_attendance(
    db: Session = Depends(get_db)
):

    attendance_records = (
        db.query(Attendance)
        .order_by(
            Attendance.scan_time.desc()
        )
        .all()
    )

    return attendance_records

@router.get("/today")
def get_today_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    today = datetime.now(timezone.utc).date()
    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == current_user.id
        )
        .all()
    )

    today_records = [
        record
        for record in attendance_records
        if record.scan_time.date() == today
    ]

    if not today_records:
        return {
            "message": "No attendance records found for today"
        }
    
    #if not today_records:
    #        return {
    #           "message": "No attendance records found for today"
    #        }

    check_in_record = next(
        (
            record
            for record in today_records
            if record.action == "Check In"
        ),
        None
    )

    check_out_record = next(
        (
            record
            for record in reversed(today_records)
            if record.action == "Check Out"
        ),
        None
    )

    working_hours = None

    if check_in_record and check_out_record:
        working_hours = (
            check_out_record.scan_time -
            check_in_record.scan_time
        )

    return {
        "total_records": len(today_records),

        "check_in": (
            str(check_in_record.scan_time)
            if check_in_record
            else None
        ),

        "check_out": (
            str(check_out_record.scan_time)
            if check_out_record
            else None
        ),

        "working_hours": (
            str(working_hours)
            if working_hours
            else None
        ),

        "today_history": [
            {
                "action": record.action,
                "location_name": record.location_name,
                "scan_time": str(record.scan_time)
            }
            for record in today_records
        ]
    }

@router.get(
    "/allowed-actions",
    response_model=AllowedActionsResponse
)
def allowed_actions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    actions = get_allowed_actions(
        db,
        current_user
    )

    return {
        "allowed_actions": actions
    }