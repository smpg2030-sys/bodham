from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mindrise")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("Backfilling social stats for posts...")
result = db.posts.update_many(
    {
        "$or": [
            {"likes_count": {"$exists": False}},
            {"comments_count": {"$exists": False}}
        ]
    }, 
    {"$set": {"likes_count": 0, "comments_count": 0}}
)
print(f"Updated {result.modified_count} posts.")

print("Backfilling social stats for pending posts...")
result_pending = db.pending_posts.update_many(
    {
        "$or": [
            {"likes_count": {"$exists": False}},
            {"comments_count": {"$exists": False}}
        ]
    }, 
    {"$set": {"likes_count": 0, "comments_count": 0}}
)
print(f"Updated {result_pending.modified_count} pending posts.")
