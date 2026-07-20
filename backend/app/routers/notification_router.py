from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Delete closed notifications older than 24 hours
    expiry = datetime.now(timezone.utc) - timedelta(hours=24)

    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_closed == True,
        Notification.created_at < expiry
    ).delete()

    db.commit()

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return notifications


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "count": count
    }


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if notification:

        notification.is_read = True
        db.commit()

    return {
        "message": "Notification marked as read."
    }


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read."
    }