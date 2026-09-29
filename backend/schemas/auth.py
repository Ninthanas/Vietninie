from pydantic import BaseModel
from typing import Optional

class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user_id: str
    username: str
    display_name: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    username: str
    display_name: Optional[str] = None
    created_at: str
