from fastapi import FastAPI
from app.models.user import User
from app.models.attendance import Attendance
from app.models.notification import Notification
from app.models.attendance_correction import AttendanceCorrection
from app.database.database import Base, engine
Base.metadata.create_all(bind=engine)

from app.routers.auth_router import router as auth_router
from app.routers.attendance_router import router as attendance_router
from app.routers.user_router import router as user_router
from app.routers.qr_router import router as qr_router
from app.routers.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers.admin import router as admin
from app.routers.admin_employee import router as admin_employee
from app.routers.admin_employee_details import router as admin_employee_details
from app.routers.attendance_admin  import router as attendance_admin
from app.routers.notification_router import router as notification_router
from app.routers.attendance_correction_router import router as attendance_correction_router
from app.routers.admin_corrections import router as admin_corrections
import asyncio
from contextlib import asynccontextmanager
from app.services.notification_scheduler import (notification_scheduler,)

@asynccontextmanager
async def lifespan(app: FastAPI):

    asyncio.create_task(
        notification_scheduler()
    )

    yield


app = FastAPI(
    lifespan=lifespan
    title="QR Attendance API"
)

app.include_router(dashboard_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://qr-attendance-system-v2.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(attendance_router)
app.include_router(qr_router)
app.include_router(admin)
app.include_router(admin_employee)
app.include_router(admin_employee_details)
app.include_router(attendance_admin)
app.include_router(notification_router)
app.include_router(attendance_correction_router)
app.include_router(admin_corrections)

@app.get("/")
def root():
    return {
        "message": "QR Attendance API Running"
    }