import sys
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "mindrise")

if not MONGO_URI:
    print("Error: MONGO_URI not found in environment variables.")
    sys.exit(1)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Connected to DB: {DB_NAME}")
print(f"Checking 'stories' collection...")

count = db.stories.count_documents({})
print(f"Total stories found: {count}")

stories = db.stories.find()
for story in stories:
    print("-" * 20)
    print(f"ID: {story.get('_id')}")
    print(f"Title: {story.get('title')}")
    print(f"Image: {story.get('image_url')}")
    print(f"Description: {story.get('description')}")
