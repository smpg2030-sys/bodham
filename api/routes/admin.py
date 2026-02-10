from fastapi import APIRouter, HTTPException
from database import get_db
from models import UserResponse, PostResponse
from typing import List
from bson import ObjectId
from pydantic import BaseModel

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
            role=user.get("role", "user"),
            is_verified=user.get("is_verified", False),
            profile_pic=user.get("profile_pic"),
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
    # Count pending posts from the pending collection
    pending_count = db.pending_posts.count_documents({"status": "pending"})
    
    return {
        "total_users": user_count,
        "pending_moderation": pending_count
    }

@router.get("/posts", response_model=List[PostResponse])
def get_posts(status: str = "pending", role: str | None = None):
    if role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    posts_cursor = []
    if status == "approved":
        posts_cursor = db.posts.find().sort("created_at", -1)
    elif status == "pending" or status == "rejected":
        posts_cursor = db.pending_posts.find({"status": status}).sort("created_at", -1)
    else:  # status == "all"
        approved = list(db.posts.find())
        pending_rejected = list(db.pending_posts.find())
        combined = approved + pending_rejected
        combined.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        posts_cursor = combined
    results = []
    
    # Collect user IDs to batch fetch emails
    user_ids = set()
    posts = []
    for doc in posts_cursor:
        doc["id"] = str(doc["_id"])
        posts.append(doc)
        if "user_id" in doc:
            try:
                user_ids.add(ObjectId(doc["user_id"]))
            except:
                pass
                
    # Fetch users
    users_map = {}
    if user_ids:
        users = db.users.find({"_id": {"$in": list(user_ids)}})
        for u in users:
            users_map[str(u["_id"])] = {
                "email": u["email"],
                "profile_pic": u.get("profile_pic")
            }
            
    # Attach emails and profile pics
    for post in posts:
        user_info = users_map.get(post["user_id"], {})
        post["author_email"] = user_info.get("email")
        post["author_profile_pic"] = user_info.get("profile_pic")
        results.append(post)
        
    return results

class PostStatusUpdate(BaseModel):
    status: str
    rejection_reason: str | None = None

@router.put("/posts/{post_id}/status")
def update_post_status(post_id: str, update: PostStatusUpdate, role: str | None = None):
    if role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    if update.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
        
    if update.status == "approved":
        # Move post from pending_posts to posts
        post = db.pending_posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            # Check if it's already approved (maybe a retry)
            already_approved = db.posts.find_one({"_id": ObjectId(post_id)})
            if already_approved:
                return {"message": "Post already approved"}
            raise HTTPException(status_code=404, detail="Post not found in pending")
        
        post["status"] = "approved"
        db.posts.insert_one(post)
        db.pending_posts.delete_one({"_id": ObjectId(post_id)})
        return {"message": "Post approved and moved to live feed"}
    
    else:  # rejected
        result = db.pending_posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"status": "rejected", "rejection_reason": update.rejection_reason}}
        )
        
        if result.matched_count == 0:
            # If not in pending, maybe it was approved and we are trying to reject it?
            # For now, let's just handle the transition from pending/rejected
            raise HTTPException(status_code=404, detail="Post not found in pending moderation")
            
        return {"message": "Post rejected"}
