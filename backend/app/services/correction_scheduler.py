import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.attendance_correction import AttendanceCorrection


async def correction_scheduler():
    while True:
        db: Session = SessionLocal()
        try:
            # 24 hours threshold
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)

            # Delete Approved/Rejected requests older than 24 hours after review
            deleted_count = (
                db.query(AttendanceCorrection)
                .filter(
                    AttendanceCorrection.status.in_(["Approved", "Rejected"]),
                    AttendanceCorrection.reviewed_at.isnot(None),
                    AttendanceCorrection.reviewed_at <= cutoff_time,
                )
                .delete(synchronize_session=False)
            )

            db.commit()

            if deleted_count > 0:
                print(f"[Cleanup Scheduler] Deleted {deleted_count} old correction request(s).")

        except Exception as e:
            db.rollback()
            print("Correction Cleanup Scheduler Error:", e)

        finally:
            db.close()

        # Check every 1 hour (3600 seconds)
        await asyncio.sleep(100)