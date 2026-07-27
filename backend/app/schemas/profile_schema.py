from pydantic import BaseModel, EmailStr
from datetime import datetime


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr