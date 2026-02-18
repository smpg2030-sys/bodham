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
    posts_cursor = db.posts.find({"user_id": user_id, "status": "approved"}).sort("created_at", -1)
    posts_list = list(posts_cursor)
    
    post_ids = [str(p["_id"]) for p in posts_list]
    
    # BULK FETCH: Optimization for social stats
    likes_counts = {}
    comments_counts = {}
    my_likes = set()

    if post_ids:
        # Likes aggregation
        likes_pipeline = [
            {"$match": {"post_id": {"$in": post_ids}}},
            {"$group": {"_id": "$post_id", "count": {"$sum": 1}}}
        ]
        likes_counts = {item["_id"]: item["count"] for item in db.likes.aggregate(likes_pipeline)}

        # Comments aggregation
        comments_pipeline = [
            {"$match": {"post_id": {"$in": post_ids}}},
            {"$group": {"_id": "$post_id", "count": {"$sum": 1}}}
        ]
        comments_counts = {item["_id"]: item["count"] for item in db.comments.aggregate(comments_pipeline)}

        # Check my likes
        if current_user_id:
            liked_by_me = db.likes.find({"post_id": {"$in": post_ids}, "user_id": current_user_id}, {"post_id": 1})
            my_likes = set(item["post_id"] for item in liked_by_me)

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
            "likes_count": likes_counts.get(pid, 0),
            "comments_count": comments_counts.get(pid, 0),
            "is_liked_by_me": pid in my_likes
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
