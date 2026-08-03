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
from app.dependencies.auth import get_current_user
from app.schemas.auth_schema import ChangePasswordRequest
from app.services.auth_service import AuthService
from app.schemas.auth_schema import ForgotPasswordRequest
from app.schemas.auth_schema import ResetPasswordRequest
from app.schemas.auth_schema import VerifyEmailRequest
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

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return AuthService.change_password(
        db=db,
        current_user=current_user,
        current_password=request.current_password,
        new_password=request.new_password
    )

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    return AuthService.forgot_password(
        db=db,
        email=request.email
    )

@router.get("/validate-reset-token/{token}")
def validate_reset_token(
    token: str,
    db: Session = Depends(get_db)
):

    return AuthService.validate_reset_token(
        db=db,
        token=token
    )

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    return AuthService.reset_password(
        db=db,
        token=request.token,
        new_password=request.new_password
    )

@router.post("/send-verification-email")
def send_verification_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return AuthService.send_verification_email(
        db=db,
        current_user=current_user
    )

@router.post("/verify-email")
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):

    return AuthService.verify_email(
        db=db,
        token=request.token
    )