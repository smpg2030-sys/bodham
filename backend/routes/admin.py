from fastapi import APIRouter, HTTPException
from database import get_db
from models import UserResponse, PostResponse
from typing import List
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(role: str | None = None):
    # For now, we expect the frontend to pass the role or we'd ideally use a token
    # This is a placeholder for proper JWT/Session auth
    if role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established.")
    
    users_coll = db.users
    all_users = []
    for user in users_coll.find():
        all_users.append(UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user.get("full_name") or None
        ))
    return all_users

@router.get("/stats")
def get_stats(role: str | None = None):
    if role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: Admin access required")

    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established.")
    
    user_count = db.users.count_documents({})
    # Count pending posts
    pending_count = db.posts.count_documents({"status": "pending"})
    
    return {
        "total_users": user_count,
        "pending_moderation": pending_count
    }

@router.get("/posts", response_model=List[PostResponse])
def get_pending_posts(role: str | None = None):
    if role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    posts_cursor = db.posts.find({"status": "pending"}).sort("created_at", -1)
    results = []
    for doc in posts_cursor:
        doc["id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.put("/posts/{post_id}/status")
def update_post_status(post_id: str, status: str, rejection_reason: str | None = None, role: str | None = None):
    if role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
        
    update_data = {"status": status}
    if status == "rejected":
        update_data["rejection_reason"] = rejection_reason
        
    result = db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or status unchanged")
        
    return {"message": f"Post {status}"}
