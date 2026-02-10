import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGO_URI'))
db = client[os.getenv('DB_NAME', 'mindrise')]
print(f"Checking database: {os.getenv('DB_NAME')}")
users = list(db.users.find())
print(f"Total users found: {len(users)}")
search_term = 'manikanta'
print(f"Searching for '{search_term}':")
for u in users:
    if search_term.lower() in str(u.get('full_name', '')).lower() or search_term.lower() in str(u.get('email', '')).lower():
        print(f"Match -> ID: {u.get('_id')}, User: {u.get('full_name')}, Email: {u.get('email')}, Verified: {u.get('is_verified')}")
    else:
        pass
