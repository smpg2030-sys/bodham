from fastapi import APIRouter, HTTPException, BackgroundTasks
from bson import ObjectId
from database import get_db
from models import UserResponse, ProductCreate, ProductResponse
from pydantic import BaseModel, EmailStr
import random
import string
import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from datetime import datetime, timedelta

router = APIRouter(prefix="/sellers", tags=["sellers"])

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("EMAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("EMAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@mindrise.com"),
    MAIL_PORT=int(os.getenv("EMAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("EMAIL_HOST", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class SellerRegister(BaseModel):
    email: EmailStr
    full_name: str
    business_name: str | None = None
    phone_number: str | None = None

class SellerOTPVerify(BaseModel):
    email: EmailStr
    otp: str

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

@router.post("/register")
async def register_seller(data: SellerRegister, background_tasks: BackgroundTasks):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Store/Update registration intent
    db.seller_registrations.update_one(
        {"email": data.email},
        {"$set": {
            "otp": otp,
            "expires_at": expires_at,
            "attempts": 0,
            "data": data.dict()
        }},
        upsert=True
    )
    
    # Send OTP
    message = MessageSchema(
        subject="Seller Registration OTP - Bodham",
        recipients=[data.email],
        body=f"Your verification code is: {otp}. It expires in 5 minutes.",
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)
    
    return {"message": "OTP sent to email."}

@router.post("/verify-otp")
async def verify_seller_otp(data: SellerOTPVerify):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    reg_record = db.seller_registrations.find_one({"email": data.email})
    if not reg_record:
        raise HTTPException(status_code=400, detail="Registration session not found or expired")
    
    if reg_record.get("attempts", 0) >= 3:
        raise HTTPException(status_code=400, detail="Maximum OTP attempts reached. Please register again.")
    
    if datetime.utcnow() > reg_record["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    if reg_record["otp"] != data.otp:
        db.seller_registrations.update_one({"email": data.email}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Success - Upgrade or Create user
    seller_data = reg_record["data"]
    user = db.users.find_one({"email": data.email})
    
    # Preserve admin/host role if present, otherwise set to seller
    new_role = "seller"
    if user and user.get("role") in ["admin", "host"]:
        new_role = user.get("role")

    update_doc = {
        "role": new_role,
        "seller_status": "pending",
        "business_name": seller_data.get("business_name"),
        "full_name": seller_data.get("full_name"),
        "phone_number": seller_data.get("phone_number"),
        "is_verified": True
    }
    
    if user:
        db.users.update_one({"_id": user["_id"]}, {"$set": update_doc})
    else:
        # Create new user if not exists
        update_doc["email"] = data.email
        update_doc["created_at"] = datetime.utcnow().isoformat()
        db.users.insert_one(update_doc)
    
    db.seller_registrations.delete_one({"email": data.email})
    return {"message": "Seller registration successful. Please wait for admin approval."}

# Product Management
@router.post("/products", response_model=ProductResponse)
async def add_product(data: ProductCreate, seller_id: str):
    db = get_db()
    try:
        oid = ObjectId(seller_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Seller ID")

    user = db.users.find_one({"_id": oid})
    is_seller = user.get("role") == "seller" or user.get("role") in ["admin", "host"]
    is_approved = user.get("seller_status") == "approved"

    if not user or not is_seller or not is_approved:
        raise HTTPException(status_code=403, detail="Only approved sellers can post products")
    
    product_doc = data.dict()
    product_doc["seller_id"] = seller_id
    product_doc["seller_name"] = user.get("business_name") or user.get("full_name")
    product_doc["status"] = "active"
    product_doc["created_at"] = datetime.utcnow().isoformat()
    
    result = db.products.insert_one(product_doc)
    product_doc["id"] = str(result.inserted_id)
    return product_doc

@router.get("/products", response_model=list[ProductResponse])
async def get_seller_products(seller_id: str):
    db = get_db()
    products = list(db.products.find({"seller_id": seller_id}))
    for p in products:
        p["id"] = str(p["_id"])
    return products

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, data: ProductCreate, seller_id: str):
    db = get_db()
    try:
        pid = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Product ID")

    product = db.products.find_one({"_id": pid})
    if not product or product["seller_id"] != seller_id:
        raise HTTPException(status_code=403, detail="You can only edit your own products")
    
    db.products.update_one({"_id": pid}, {"$set": data.dict()})
    updated = db.products.find_one({"_id": pid})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/products/{product_id}")
async def delete_product(product_id: str, seller_id: str):
    db = get_db()
    try:
        pid = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Product ID")

    product = db.products.find_one({"_id": pid})
    if not product or product["seller_id"] != seller_id:
        raise HTTPException(status_code=403, detail="You can only delete your own products")
    
    db.products.delete_one({"_id": pid})
    return {"message": "Product deleted"}
