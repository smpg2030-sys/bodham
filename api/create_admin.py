from pymongo import MongoClient
import os
from dotenv import load_dotenv
import bcrypt
import sys

# Load config
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mindrise")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_admin(email, password="password123"):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users = db.users
    
    user = users.find_one({"email": email})
    
    if user:
        print(f"User {email} exists. Updating role to admin and resetting password...")
        users.update_one({"email": email}, {"$set": {
            "role": "admin", 
            "is_verified": True,
            "password_hash": hash_password(password)
        }})
        print(f"User {email} is now an admin with password '{password}'.")
    else:
        print(f"User {email} does not exist. Creating admin user...")
        doc = {
            "email": email,
            "password_hash": hash_password(password),
            "full_name": "Admin User",
            "role": "admin",
            "is_verified": True,
            "otp": None
        }
        users.insert_one(doc)
        print(f"Created admin user {email} with password '{password}'")

if __name__ == "__main__":
    email = "madhav200320@gmail.com"
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    create_admin(email)
