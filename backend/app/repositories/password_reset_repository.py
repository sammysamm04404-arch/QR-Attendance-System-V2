from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.password_reset_token import PasswordResetToken


def get_local_now():
    return (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).replace(tzinfo=None)


class PasswordResetRepository:

    @staticmethod
    def create(db: Session, token):
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
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.token_hash == token_hash
            )
            .first()
        )

    @staticmethod
    def delete_user_tokens(db: Session, user_id: int):
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user_id
        ).delete()
        db.commit()

    @staticmethod
    def get_active_token(
        db: Session,
        user_id: int
    ):
        return (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.used == False,
                PasswordResetToken.expires_at > get_local_now()
            )
            .first()
        )

    @staticmethod
    def mark_used(
        db: Session,
        token
    ):
        token.used = True
        db.commit()

    @staticmethod
    def delete_expired_tokens(
        db: Session
    ):
        db.query(
            PasswordResetToken
        ).filter(
            PasswordResetToken.expires_at < get_local_now()
        ).delete()

        db.commit()