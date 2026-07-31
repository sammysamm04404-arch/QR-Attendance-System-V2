from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken


class PasswordResetRepository:

    @staticmethod
    def create(db, token):

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
    def get_active_token(
        db: Session,
        user_id: int
    ):

        return (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.used == False,
                PasswordResetToken.expires_at > datetime.now(timezone.utc)
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
            PasswordResetToken.expires_at < datetime.now(timezone.utc)
        ).delete()

        db.commit()