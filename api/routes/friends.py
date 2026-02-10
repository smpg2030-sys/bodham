from fastapi import APIRouter, HTTPException, Query
from database import get_db
from models import UserResponse
from bson import ObjectId
from typing import List
from datetime import datetime

router = APIRouter(prefix="/friends", tags=["friends"])

@router.get("/search", response_model=List[UserResponse])
def search_users(query: str, current_user_id: str):
    db = get_db()
    if db is None:
         raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        user_oid = ObjectId(current_user_id)
    except:
        user_oid = None

    query_filter = {
        "$and": [
            {"is_verified": True},
            {
                "$or": [
                    {"full_name": {"$regex": query, "$options": "i"}},
                    {"email": {"$regex": query, "$options": "i"}}
                ]
            }
        ]
    }
    
    if user_oid:
        query_filter["$and"].append({"_id": {"$ne": user_oid}})
    
    users_cursor = db.users.find(query_filter).limit(20)
    
    results = []
    for user in users_cursor:
        results.append(UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user.get("full_name"),
            role=user.get("role", "user"),
            is_verified=user.get("is_verified", False),
            profile_pic=user.get("profile_pic")
        ))
    return results

@router.post("/request")
def send_friend_request(from_user_id: str, to_user_id: str):
    db = get_db()
    if db is None:
         raise HTTPException(status_code=503, detail="Database not available")
    
    if from_user_id == to_user_id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")
    
    # Check if already friends
    existing_friendship = db.friendships.find_one({
        "$or": [
            {"user1": from_user_id, "user2": to_user_id},
            {"user1": to_user_id, "user2": from_user_id}
        ]
    })
    if existing_friendship:
        return {"message": "Already friends"}

    # Check if request already pending
    existing_request = db.friend_requests.find_one({
        "from_user": from_user_id,
        "to_user": to_user_id,
        "status": "pending"
    })
    if existing_request:
        return {"message": "Request already pending"}

    db.friend_requests.insert_one({
        "from_user": from_user_id,
        "to_user": to_user_id,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    })
    return {"message": "Friend request sent"}

@router.get("/requests")
def get_friend_requests(user_id: str):
    db = get_db()
    if db is None:
         raise HTTPException(status_code=503, detail="Database not available")
    
    requests_cursor = db.friend_requests.find({
        "to_user": user_id,
        "status": "pending"
    }).sort("created_at", -1)
    
    results = []
    for req in requests_cursor:
        # Fetch user info
        user_info = db.users.find_one({"_id": ObjectId(req["from_user"])})
        if user_info:
            results.append({
                "request_id": str(req["_id"]),
                "from_user_id": req["from_user"],
                "from_user_name": user_info.get("full_name") or user_info["email"],
                "created_at": req["created_at"]
            })
    return results

@router.post("/respond")
def respond_to_request(request_id: str, action: str): # action: "accept" or "decline"
    db = get_db()
    if db is None:
         raise HTTPException(status_code=503, detail="Database not available")
    
    req = db.friend_requests.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if action == "accept":
        # Create mutual friendship
        db.friendships.insert_one({
            "user1": req["from_user"],
            "user2": req["to_user"],
            "created_at": datetime.utcnow().isoformat()
        })
        db.friend_requests.delete_one({"_id": ObjectId(request_id)})
        return {"message": "Friend request accepted"}
    else:
        db.friend_requests.delete_one({"_id": ObjectId(request_id)})
        return {"message": "Friend request declined"}

@router.get("/list")
def list_friends(user_id: str):
    db = get_db()
    if db is None:
         raise HTTPException(status_code=503, detail="Database not available")
    
    friendships = db.friendships.find({
        "$or": [
            {"user1": user_id},
            {"user2": user_id}
        ]
    })
    
    friend_ids = []
    for f in friendships:
        friend_ids.append(f["user2"] if f["user1"] == user_id else f["user1"])
    
    # Fetch user details
    friends_info = []
    if friend_ids:
        users = db.users.find({"_id": {"$in": [ObjectId(fid) for fid in friend_ids]}})
        for u in users:
            friends_info.append({
                "id": str(u["_id"]),
                "full_name": u.get("full_name"),
                "email": u["email"]
            })
    return friends_info
