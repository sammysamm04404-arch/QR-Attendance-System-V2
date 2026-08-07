from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.models.email_verification_token import (
    EmailVerificationToken
)

def get_local_now():
    return (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).replace(tzinfo=None)

class EmailVerificationRepository:

    @staticmethod
    def create(
        db: Session,
        token: EmailVerificationToken
    ):
        if not getattr(token, "created_at", None):
            token.created_at = get_local_now()

        db.add(token)
        db.commit()
        db.refresh(token)

        return token

    @staticmethod
    def get_by_hash(
        db: Session,
        token_hash: str
    ):
        return (
            db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.token_hash == token_hash
            )
            .first()
        )

    @staticmethod
    def get_active_token(
        db: Session,
        user_id: int
    ):
        return (
            db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.user_id == user_id,
                EmailVerificationToken.used == False,
                EmailVerificationToken.expires_at > get_local_now()
            )
            .first()
        )

    @staticmethod
    def mark_used(
        db: Session,
        token: EmailVerificationToken
    ):
        token.used = True
        db.commit()

    @staticmethod
    def delete_expired_tokens(
        db: Session
    ):
        (
            db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.expires_at < get_local_now()
            )
            .delete()
        )

        db.commit()

    @staticmethod
    def save(
        db: Session,
        token: EmailVerificationToken
    ):
        if not getattr(token, "created_at", None):
            token.created_at = get_local_now()
            
        db.add(token)
        db.commit()
        db.refresh(token)

        return token