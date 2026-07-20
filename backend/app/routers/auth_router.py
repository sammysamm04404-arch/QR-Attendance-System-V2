from app.services.notification_service import (
    create_incomplete_attendance_notification
)

from app.schemas.auth_schema import LoginRequest
from app.core.security import (
    verify_password,
    create_access_token
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
#from passlib.context import CryptContext

from app.database.session import get_db
from app.models.user import User
from app.schemas.user_schema import UserRegister    
from app.core.security import get_password_hash

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role="Employee",
        status="Active"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    create_incomplete_attendance_notification(
        db,
        user
    )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": user.role
    }