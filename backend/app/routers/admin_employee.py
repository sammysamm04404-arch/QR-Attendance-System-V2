from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from fastapi import HTTPException
from app.schemas.user_schema import EmployeeUpdateRequest

router = APIRouter(
    prefix="/admin",
    tags=["Admin Employees"]
)


@router.get("/employees")
def get_all_employees(

    page:int=Query(1,ge=1),
    limit:int=Query(10,ge=1),
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user)
):

    total=db.query(User).count()

    offset=(page-1)*limit

    employees=(
        db.query(User)
        .order_by(User.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    employee_list=[]

    for employee in employees:

        employee_list.append({
            "id":employee.id,
            "name":employee.name,
            "email":employee.email,
            "role":"Admin" if employee.role=="Admin" else "Employee",
            "status":employee.status
        })

    return{

        "employees":employee_list,
        "page":page,
        "limit":limit,
        "total":total,
        "total_pages":(total+limit-1)//limit
    }

@router.put("/employees/{employee_id}")
def update_employee(

    employee_id: int,
    employee_data: EmployeeUpdateRequest,
    db: Session = Depends(get_db)

):

    employee = (

        db.query(User)

        .filter(User.id == employee_id)

        .first()

    )

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    employee.name = employee_data.name
    employee.email = employee_data.email
    employee.status = employee_data.status

    db.commit()
    db.refresh(employee)

    return {

        "message": "Employee updated successfully"

    }

@router.delete("/employees/{employee_id}")
def delete_employee(

    employee_id: int,
    db: Session = Depends(get_db)

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

    db.delete(employee)

    db.commit()

    return {

        "message":"Employee deleted successfully."

    }