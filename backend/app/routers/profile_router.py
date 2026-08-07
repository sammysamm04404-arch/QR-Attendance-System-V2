from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.profile_schema import (
    ProfileResponse,
    ProfileUpdate
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get(
    "",
    response_model=ProfileResponse
)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put(
    "",
    response_model=ProfileResponse
)
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == profile.email,
            User.id != current_user.id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered."
        )

    if current_user.email != profile.email:
        current_user.email = profile.email
        current_user.email_verified = False

    current_user.name = profile.name

    db.commit()
    db.refresh(current_user)

    return current_user