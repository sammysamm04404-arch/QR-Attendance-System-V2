from pydantic import BaseModel


class AttendanceCorrectionRequest(BaseModel):

    notification_id: int

    reason: str

    checkout_time: str

    notes: str