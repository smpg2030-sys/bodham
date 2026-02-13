from database import get_db
from bson import ObjectId

def check_recent_posts():
    db = get_db()
    if not db:
        print("No DB connection")
        return
        
    print("--- Approved Posts ---")
    for post in db.posts.find().sort("created_at", -1).limit(5):
        print(f"ID: {post['_id']}, Content: {post.get('content')}, Image: {post.get('image_url')}, Score: {post.get('moderation_score')}, Status: {post.get('status')}")

    print("\n--- Pending/Flagged/Rejected Posts ---")
    for post in db.pending_posts.find().sort("created_at", -1).limit(5):
        print(f"ID: {post['_id']}, Content: {post.get('content')}, Image: {post.get('image_url')}, Score: {post.get('moderation_score')}, Status: {post.get('status')}")

if __name__ == "__main__":
    check_recent_posts()
