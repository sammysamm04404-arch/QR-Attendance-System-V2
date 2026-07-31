from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ChangePasswordRequest(BaseModel):
    current_password: str

    new_password: str = Field(
        min_length=8,
        max_length=100
    )

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):

    token: str

    new_password: str = Field(
        min_length=8,
        max_length=100
    )

class VerifyEmailRequest(BaseModel):
    token: str