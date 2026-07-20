from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class EmployeeCreateRequest(BaseModel):

    name: str
    email: EmailStr
    password: str
    status: str

class EmployeeUpdateRequest(BaseModel):

    name: str
    email: EmailStr
    status: str