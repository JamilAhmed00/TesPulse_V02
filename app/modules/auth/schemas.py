"""
Authentication Schemas

Pydantic models for authentication API requests and responses.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserSignup(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=200)
    full_name: str = Field(..., min_length=1, max_length=200)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    role: Optional[str] = Field("student", description="Role: 'admin' or 'student'")
    
    @validator('role')
    def validate_role(cls, v):
        if v and v not in ['admin', 'student']:
            raise ValueError('Role must be either "admin" or "student"')
        return v or 'student'


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    """Schema for user response."""
    id: UUID
    email: str
    username: Optional[str] = None
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class PasswordChange(BaseModel):
    """Schema for password change."""
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=200)

