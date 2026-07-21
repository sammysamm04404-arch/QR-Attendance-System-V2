import asyncio

from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.user import User
from app.services.notification_service import (
    create_incomplete_attendance_notification,
)


async def notification_scheduler():

    while True:

        db: Session = SessionLocal()

        try:

            users = (
                db.query(User)
                .filter(User.status == "Active")
                .all()
            )

            for user in users:

                create_incomplete_attendance_notification(
                    db=db,
                    user=user
                )

        except Exception as e:

            print("Notification Scheduler Error:", e)

        finally:

            db.close()

        await asyncio.sleep(30)