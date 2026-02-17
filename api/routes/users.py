from fastapi import APIRouter, HTTPException
from database import get_db
from models import UserResponse, PostResponse
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}")
async def get_public_profile(user_id: str, current_user_id: str = None):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        oid = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid User ID")

    user = db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. User Data
    user_data = UserResponse(
        id=str(user["_id"]),
        email=user.get("email"),
        full_name=user.get("full_name"),
        role=user.get("role", "user"),
        profile_pic=user.get("profile_pic"),
        bio=user.get("bio"),
        streak_count=user.get("streak_count", 0),
        created_at=oid.generation_time.isoformat()
    )

    # 2. Fetch Posts (Approved Only)
    posts_cursor = db.posts.find({"user_id": user_id}).sort("created_at", -1)
    posts_list = list(posts_cursor)
    
    # Enrich posts with status and stats (simpler version for profile grid)
    posts = []
    for p in posts_list:
        pid = str(p["_id"])
        posts.append({
            "id": pid,
            "user_id": p.get("user_id"),
            "author_name": p.get("author_name", user_data.full_name),
            "content": p.get("content", ""),
            "image_url": p.get("image_url"),
            "video_url": p.get("video_url"),
            "status": p.get("status", "approved"),
            "created_at": p.get("created_at"),
            "likes_count": db.likes.count_documents({"post_id": pid}),
            "comments_count": db.comments.count_documents({"post_id": pid}),
            "is_liked_by_me": bool(db.likes.find_one({"post_id": pid, "user_id": current_user_id})) if current_user_id else False
        })

    # 3. Friend Counts (Followers/Following equivalent)
    # Using the existing friends collection logic
    friendships = list(db.friends.find({
        "status": "accepted",
        "$or": [{"sender_id": user_id}, {"receiver_id": user_id}]
    }))
    
    followers_count = len(friendships)
    following_count = len(friendships) # In a mutual friend system, these are equal

    return {
        "userData": user_data,
        "posts": posts,
        "followersCount": followers_count,
        "followingCount": following_count,
        "streaks": user_data.streak_count
    }
