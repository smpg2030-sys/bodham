import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timedelta

load_dotenv()

mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
db_name = os.getenv("DB_NAME", "mindrise")

client = MongoClient(mongo_uri)
db = client[db_name]

# Find a user to test with
user = db.users.find_one({"email": "smpg2030@gmail.com"})
if not user:
    print("User not found")
    exit()

user_id = str(user["_id"])
print(f"Testing for user: {user['email']} (ID: {user_id})")

# Clear existing journals for this user
db.journals.delete_many({"user_id": user_id})

# Add journals for today, yesterday, and the day before (3 day streak)
today = datetime.utcnow()
journals = [
    {
        "user_id": user_id,
        "title": "Streak Test Day 1",
        "content": "Content line 1",
        "date": today.isoformat(),
        "created_at": today.isoformat()
    },
    {
        "user_id": user_id,
        "title": "Streak Test Day 2",
        "content": "Content line 2",
        "date": (today - timedelta(days=1)).isoformat(),
        "created_at": (today - timedelta(days=1)).isoformat()
    },
    {
        "user_id": user_id,
        "title": "Streak Test Day 3",
        "content": "Content line 3",
        "date": (today - timedelta(days=2)).isoformat(),
        "created_at": (today - timedelta(days=2)).isoformat()
    }
]

db.journals.insert_many(journals)
print("Added 3 consecutive journal entries (including today). Expected streak: 3")
