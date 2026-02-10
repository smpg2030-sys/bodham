from fastapi import APIRouter, HTTPException, Query
from database import get_db
from models import PostCreate, PostResponse
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/", response_model=PostResponse)
def create_post(post: PostCreate, user_id: str, author_name: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    doc = {
        "user_id": user_id,
        "author_name": author_name,
        "content": post.content,
        "image_url": post.image_url,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "rejection_reason": None
    }
    
    result = db.pending_posts.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc

@router.get("/", response_model=list[PostResponse])
def get_feed():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    # Return all posts in the posts collection (they are all approved)
    posts_cursor = db.posts.find().sort("created_at", -1)
    results = []
    for doc in posts_cursor:
        doc["id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.get("/my", response_model=list[PostResponse])
def get_my_posts(user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    # Return all posts for the user from both collections
    approved_posts = list(db.posts.find({"user_id": user_id}))
    pending_posts = list(db.pending_posts.find({"user_id": user_id}))
    
    combined_posts = approved_posts + pending_posts
    # Sort by newest first
    combined_posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    results = []
    for doc in combined_posts:
        doc["id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.delete("/{post_id}")
def delete_post(post_id: str, user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    # Attempt deletion in both collections
    result_approved = db.posts.delete_one({"_id": ObjectId(post_id), "user_id": user_id})
    result_pending = db.pending_posts.delete_one({"_id": ObjectId(post_id), "user_id": user_id})
    
    if result_approved.deleted_count == 0 and result_pending.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    
    return {"message": "Post deleted"}
