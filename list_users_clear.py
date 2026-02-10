from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load cloud config
load_dotenv('backend/.env')
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "mindrise")

def list_users(uri, label):
    print(f"\n--- {label} Database Users ---")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=2000)
        db = client[DB_NAME]
        users = list(db.users.find())
        if not users:
            print("No users found.")
        for u in users:
            print(f"Email: {u.get('email')} | Role: {u.get('role', 'user')} | Verified: {u.get('is_verified')}")
    except Exception as e:
        print(f"Error: {e}")

list_users(MONGO_URI, "Cloud")
list_users("mongodb://localhost:27017/", "Local")
