import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine
from app.models.attendance import Attendance
from app.models.attendance_correction import AttendanceCorrection
from app.models.email_verification_token import EmailVerificationToken
from app.models.notification import Notification
from app.models.password_reset_token import PasswordResetToken

# Models Import
from app.models.user import User

# Routers Import
from app.routers.admin import router as admin
from app.routers.admin_corrections import router as admin_corrections
from app.routers.admin_employee import router as admin_employee
from app.routers.admin_employee_details import router as admin_employee_details
from app.routers.attendance_admin import router as attendance_admin
from app.routers.attendance_correction_router import router as attendance_correction_router
from app.routers.attendance_router import router as attendance_router
from app.routers.auth_router import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.notification_router import router as notification_router
from app.routers.profile_router import router as profile_router
from app.routers.qr_router import router as qr_router
from app.routers.user_router import router as user_router
from app.services.notification_scheduler import notification_scheduler
from app.services.correction_scheduler import correction_scheduler

# Create Database Tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(notification_scheduler())
    asyncio.create_task(correction_scheduler())
    yield


app = FastAPI(
    lifespan=lifespan,
    title="QR Attendance API"
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://qr-attendance-system-v2.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
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
app.include_router(profile_router)


@app.get("/")
def root():
    return {
        "message": "QR Attendance API Running"
    }