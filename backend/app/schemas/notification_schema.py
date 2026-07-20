from pydantic import BaseModel
from datetime import datetime


class NotificationResponse(BaseModel):

    id: int
    title: str
    message: str
    type: str
    related_date: str | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True