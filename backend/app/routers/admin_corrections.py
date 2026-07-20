from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user

from app.models.user import User
from app.models.attendance import Attendance
from app.models.notification import Notification
from app.models.attendance_correction import AttendanceCorrection

router = APIRouter(
    prefix="/admin/corrections",
    tags=["Admin Corrections"]
)

# Get All Requests

@router.get("")
def get_requests(

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)

):

    if current_user.role != "Admin":

        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    requests = (

        db.query(AttendanceCorrection)

        .order_by(
            AttendanceCorrection.created_at.desc()
        )

        .all()

    )

    result = []

    for request in requests:

        employee = (

            db.query(User)

            .filter(
                User.id == request.user_id
            )
            .first()

        )

        result.append({
            "id":request.id,
            "employee_name":employee.name,
            "employee_email":employee.email,
            "attendance_date":request.attendance_date,
            "requested_checkout":request.requested_checkout,
            "status":request.status
        })

    return result

@router.get("/pending-count")
def pending_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    count = (
        db.query(AttendanceCorrection)
        .filter(
            AttendanceCorrection.status == "Pending"
        )
        .count()
    )

    return {
        "count": count
    }

# Get Single Request

@router.get("/{request_id}")
def request_details(

    request_id:int,

    db:Session=Depends(get_db),

    current_user=Depends(get_current_user)

):

    correction = (

        db.query(AttendanceCorrection)

        .filter(
            AttendanceCorrection.id == request_id
        )

        .first()

    )

    if not correction:

        raise HTTPException(
            status_code=404,
            detail="Correction not found."
        )

    employee = (

        db.query(User)

        .filter(
            User.id == correction.user_id
        )

        .first()

    )

    attendance = (

        db.query(Attendance)

        .filter(
            Attendance.user_id == correction.user_id
        )

        .all()

    )

    records = [

        record

        for record in attendance

        if record.scan_time.date()

        ==

        correction.attendance_date.date()

    ]

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
            for record in reversed(records)
            if record.action == "Check Out"
        ),
        None

    )

    return{

        "employee":{
            "name":employee.name,
            "email":employee.email
        },

        "attendance":{
            "date":correction.attendance_date,

            "check_in":

                check_in.scan_time
                if check_in
                else None,

            "check_out":

                check_out.scan_time
                if check_out
                else None

        },

        "requested_checkout":correction.requested_checkout,
        "reason":correction.reason,
        "notes":correction.notes,
        "status":correction.status

    }

# Approve Request

@router.put("/{request_id}/approve")
def approve_request(

    request_id:int,
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user)

):

    correction = (

        db.query(AttendanceCorrection)

        .filter(
            AttendanceCorrection.id == request_id
        )

        .first()

    )

    if not correction:

        raise HTTPException(
            status_code=404,
            detail="Correction not found."
        )

    existing_checkout = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == correction.user_id,
            Attendance.action == "Check Out"
        )
        .all()
    )

    for record in existing_checkout:

        if record.scan_time.date() == correction.attendance_date.date():

            raise HTTPException(
                status_code=400,
                detail="Employee already has a Check Out for this date."
            )

    new_checkout = Attendance(
        user_id=correction.user_id,
        action="Check Out",
        location_name=record.location_name,
        scan_time=correction.requested_checkout
    )

    db.add(new_checkout)

    correction.status="Approved"

    notification = (
        db.query(Notification)
        .filter(
            Notification.user_id == correction.user_id,
            Notification.is_closed == False,
            Notification.title == "Attendance Incomplete"
        )
        .first()
    )

    if notification:
        notification.is_closed = True
        notification.is_read = True

    notification = Notification(

        user_id=correction.user_id,
        title="Attendance Correction Approved",
        message=f"Your attendance correction for {correction.attendance_date.strftime('%d %b %y')} request has been approved.",
        type="attendance",
        attendance_date = correction.attendance_date
    )

    db.add(notification)

    db.commit()

    return{
        "message":"Attendance updated successfully."
    }

# Reject Request

@router.put("/{request_id}/reject")
def reject_request(

    request_id:int,
    remarks:str,
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user)

):

    correction=(

        db.query(AttendanceCorrection)

        .filter(
            AttendanceCorrection.id==request_id
        )

        .first()
    )

    if not correction:

        raise HTTPException(
            status_code=404,
            detail="Correction not found."
        )

    correction.status="Rejected"

    old_notification = (
        db.query(Notification)
        .filter(
            Notification.user_id == correction.user_id,
            Notification.is_closed == False,
            Notification.title == "Attendance Incomplete"
        )
        .first()
    )

    if old_notification:
        old_notification.is_closed = True
        old_notification.is_read = True

    notification=Notification(

        user_id=correction.user_id,
        title="Attendance Correction Rejected",
        message=f"Your attendance correction for {correction.attendance_date.strftime('%d %b %Y')} was rejected.\nReason: {remarks}",
        type="attendance",
        attendance_date= correction.attendance_date

    )

    db.add(notification)

    db.commit()

    return{
        "message":"Correction rejected."
    }