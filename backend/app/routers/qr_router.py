from fastapi import APIRouter

from app.schemas.qr_schema import QRValidationRequest

router = APIRouter(
    prefix="/qr",
    tags=["QR"]
)


@router.post("/validate")
def validate_qr(
    qr_data: QRValidationRequest
):

    OFFICE_QR = "OFFICE_MAIN_QR"

    if qr_data.qr_code != OFFICE_QR:
        return {
            "valid": False,
            "message": "Invalid QR Code"
        }

    return {
        "valid": True,
        "message": "QR Code Verified"
    }