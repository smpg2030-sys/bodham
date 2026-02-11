from pymongo import MongoClient
import os
from dotenv import load_dotenv
import sys

# Load config
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mindrise")

def promote_user(email):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users = db.users
    
    user = users.find_one({"email": email})
    if not user:
        print(f"User with email {email} not found.")
        return

    result = users.update_one({"email": email}, {"$set": {"role": "admin"}})
    if result.modified_count > 0:
        print(f"Successfully promoted {email} to admin.")
    else:
        print(f"User {email} is already an admin or update failed.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_user.py <email>")
    else:
        promote_user(sys.argv[1])
