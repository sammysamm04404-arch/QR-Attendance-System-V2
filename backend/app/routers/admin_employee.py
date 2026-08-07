from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user_schema import EmployeeUpdateRequest

router = APIRouter(
    prefix="/admin",
    tags=["Admin Employees"]
)


@router.get("/employees")
def get_all_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total = db.query(User).count()
    offset = (page - 1) * limit

    employees = (
        db.query(User)
        .order_by(User.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    employee_list = []
    for employee in employees:
        employee_list.append({
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "role": "Admin" if employee.role == "Admin" else "Employee",
            "status": employee.status,
            "email_verified": getattr(employee, "email_verified", False)
        })

    return {
        "employees": employee_list,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit
    }


@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    employee = db.query(User).filter(User.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Check if the email address is being updated
    if employee_data.email and employee_data.email.strip().lower() != employee.email.lower():
        # Prevent assigning an email that belongs to another user
        existing_email_owner = (
            db.query(User)
            .filter(User.email == employee_data.email, User.id != employee_id)
            .first()
        )
        if existing_email_owner:
            raise HTTPException(
                status_code=400,
                detail="This email address is already in use by another user."
            )

        employee.email = employee_data.email
        employee.email_verified = False  # Reset email verification flag

    employee.name = employee_data.name
    employee.status = employee_data.status

    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee updated successfully"
    }


@router.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    employee = db.query(User).filter(User.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully."
    }