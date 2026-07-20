from pydantic import BaseModel


class QRValidationRequest(BaseModel):
    qr_code: str