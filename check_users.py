import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGO_URI'))
db = client[os.getenv('DB_NAME', 'mindrise')]
print(f"Checking database: {os.getenv('DB_NAME')}")
users = list(db.users.find())
print(f"Total users found: {len(users)}")
for u in users:
    print(f"User: {u.get('full_name')}, Email: {u.get('email')}, Verified: {u.get('is_verified')}")
