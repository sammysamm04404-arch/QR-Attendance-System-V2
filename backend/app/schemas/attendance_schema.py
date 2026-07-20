from pydantic import BaseModel
from datetime import datetime


class AttendanceScanRequest(BaseModel):
    action: str
    location_name: str


class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    action: str
    location_name: str
    scan_time: datetime

    class Config:
        from_attributes = True