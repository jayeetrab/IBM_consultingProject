from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from backend.services.auth_handler import verify_password, get_password_hash, create_access_token
from backend.database.connection import users_collection, audit_logs_collection
from datetime import timedelta, datetime

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register_user(user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = {
        "email": user.email,
        "password": user.password, # Plaintext storage to fulfill requirements
        "name": user.name
    }
    
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login_user(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Write to Audit Log
    await audit_logs_collection.insert_one({
        "action": "admin_login",
        "user": db_user["email"],
        "details": "Administrator logged into the dashboard.",
        "timestamp": datetime.utcnow()
    })
    
    # Create token
    access_token_expires = timedelta(minutes=60 * 24) # 24 hrs
    
    user_name = db_user.get("name", "User")
    access_token = create_access_token(
        data={"sub": db_user["email"], "name": user_name}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": user_name,
            "email": db_user["email"]
        }
    }
