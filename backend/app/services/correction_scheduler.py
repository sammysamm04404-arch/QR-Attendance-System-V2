import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.attendance_correction import AttendanceCorrection

def get_local_now():
    return (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).replace(tzinfo=None)

def run_cleanup():
    """Synchronous database cleanup function."""
    db: Session = SessionLocal()
    try:
        cutoff_time = get_local_now() - timedelta(hours=24)

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
        print("[Cleanup Scheduler Error]:", e)

    finally:
        db.close()


async def correction_scheduler():
    while True:
        await asyncio.to_thread(run_cleanup)
        
        await asyncio.sleep(100)