from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.models.email_verification_token import EmailVerificationToken

from app.repositories.user_repository import UserRepository
from app.repositories.password_reset_repository import (
    PasswordResetRepository
)
from app.repositories.email_verification_repository import (
    EmailVerificationRepository
)

from app.services.email_service import EmailService

from app.core.security import (
    verify_password,
    get_password_hash,
    generate_secure_token,
    hash_token
)


def get_local_now():
    """Returns current local time (+5:30 offset) as a naive datetime object."""
    return (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).replace(tzinfo=None)


class AuthService:

    # Common Helper Methods

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str
    ):

        user = UserRepository.get_by_email(
            db,
            email
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        return user

    @staticmethod
    def generate_password_reset_token(
        db: Session,
        user: User
    ):

        # 1. Delete previous tokens for this user so old links don't conflict
        PasswordResetRepository.delete_user_tokens(db, user.id)

        plain_token = generate_secure_token()
        local_now = get_local_now()

        token = PasswordResetToken(

            user_id=user.id,

            token_hash=hash_token(
                plain_token
            ),

            created_at=local_now,

            expires_at=local_now + timedelta(
                minutes=15
            ),

            used=False

        )

        PasswordResetRepository.create(
            db,
            token
        )

        return plain_token

    @staticmethod
    def generate_email_verification_token(
        db: Session,
        user: User
    ):

        EmailVerificationRepository.delete_expired_tokens(
            db
        )

        existing_token = (
            EmailVerificationRepository.get_active_token(
                db,
                user.id
            )
        )

        if existing_token:

            return None

        plain_token = generate_secure_token()
        local_now = get_local_now()

        token = EmailVerificationToken(

            user_id=user.id,

            token_hash=hash_token(
                plain_token
            ),

            created_at=local_now,

            expires_at=local_now + timedelta(
                hours=24
            ),

            used=False

        )

        EmailVerificationRepository.create(
            db,
            token
        )

        return plain_token

    @staticmethod
    def validate_password(
        current_password: str,
        user: User
    ):

        if not verify_password(
            current_password,
            user.password_hash
        ):

            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect."
            )

    @staticmethod
    def update_password(
        db: Session,
        user: User,
        new_password: str
    ):

        user.password_hash = get_password_hash(
            new_password
        )

        UserRepository.save(
            db,
            user
        )

        return {
            "message":
            "Password updated successfully."
        }

    # Change Password

    @staticmethod
    def change_password(
        db: Session,
        current_user: User,
        current_password: str,
        new_password: str
    ):
        AuthService.validate_password(
            current_password,
            current_user
        )

        if verify_password(
            new_password,
            current_user.password_hash
        ):
            raise HTTPException(
                status_code=400,
                detail="New password cannot be the same as the current password."
            )

        return AuthService.update_password(
            db,
            current_user,
            new_password
        )

    # Forgot Password

    @staticmethod
    def forgot_password(
        db: Session,
        email: str
    ):

        user = UserRepository.get_by_email(
            db,
            email
        )

        if not user:
            return {
                "message": "If an account with that email exists, a password reset link has been sent."
            }

        twenty_four_hours_ago = get_local_now() - timedelta(hours=24)

        recent_requests_count = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.created_at >= twenty_four_hours_ago
            )
            .count()
        )

        if recent_requests_count >= 2:
            raise HTTPException(
                status_code=429,
                detail="You have reached the limit of password reset requests per day. Please try again tomorrow."
            )

        token = AuthService.generate_password_reset_token(
            db,
            user
        )

        if token is None:
            return {
                "message": "A password reset link has already been sent. Please check your email."
            }

        EmailService.send_reset_password_email(
            user=user,
            token=token
        )

        return {
            "message": "Password reset email sent successfully."
        }

    # Validate Reset Token

    @staticmethod
    def validate_reset_token(
        db: Session,
        token: str
    ):

        token_hash = hash_token(token)

        reset_token = PasswordResetRepository.get_by_hash(
            db,
            token_hash
        )

        if not reset_token:
            raise HTTPException(
                status_code=400,
                detail="Invalid reset link."
            )

        if reset_token.used:
            raise HTTPException(
                status_code=400,
                detail="This reset link has already been used."
            )

        # Checked against local IST naive time
        if reset_token.expires_at < get_local_now():
            raise HTTPException(
                status_code=400,
                detail="Reset link has expired."
            )

        user = UserRepository.get_by_id(
            db,
            reset_token.user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        return {
            "valid": True,
            "email": user.email
        }

    # Reset Password

    @staticmethod
    def reset_password(
        db: Session,
        token: str,
        new_password: str
    ):

        token_hash = hash_token(token)

        reset_token = PasswordResetRepository.get_by_hash(
            db,
            token_hash
        )

        if not reset_token:
            raise HTTPException(
                status_code=400,
                detail="Invalid reset token."
            )

        if reset_token.used:
            raise HTTPException(
                status_code=400,
                detail="This reset link has already been used."
            )

        # Checked against local IST naive time
        if reset_token.expires_at < get_local_now():
            raise HTTPException(
                status_code=400,
                detail="Reset link has expired."
            )

        user = UserRepository.get_by_id(
            db,
            reset_token.user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        if verify_password(
            new_password,
            user.password_hash
        ):
            raise HTTPException(
                status_code=400,
                detail="New password cannot be the same as the current password."
            )

        user.password_hash = get_password_hash(
            new_password
        )

        UserRepository.save(
            db,
            user
        )

        PasswordResetRepository.mark_used(
            db,
            reset_token
        )

        return {
            "message": "Password has been reset successfully."
        }

    # Send Verification Email

    @staticmethod
    def send_verification_email(
        db: Session,
        current_user: User
    ):

        if current_user.email_verified:
            return {
                "message": "Your email is already verified."
            }

        token = AuthService.generate_email_verification_token(
            db,
            current_user
        )

        if token is None:
            return {
                "message": "A verification email has already been sent. Please check your inbox."
            }

        EmailService.send_verification_email(
            user=current_user,
            token=token
        )

        return {
            "message": "Verification email sent successfully."
        }

    # Verify Email

    @staticmethod
    def verify_email(
        db: Session,
        token: str
    ):

        token_hash = hash_token(token)

        verification_token = (
            EmailVerificationRepository.get_by_hash(
                db,
                token_hash
            )
        )

        if not verification_token:
            raise HTTPException(
                status_code=400,
                detail="Invalid verification link."
            )

        if verification_token.used:
            raise HTTPException(
                status_code=400,
                detail="This verification link has already been used."
            )

        # Checked against local IST naive time
        if verification_token.expires_at < get_local_now():
            raise HTTPException(
                status_code=400,
                detail="Verification link has expired."
            )

        user = UserRepository.get_by_id(
            db,
            verification_token.user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        user.email_verified = True

        UserRepository.save(
            db,
            user
        )

        EmailVerificationRepository.mark_used(
            db,
            verification_token
        )

        return {
            "message": "Email verified successfully."
        }