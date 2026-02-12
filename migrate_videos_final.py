from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load config
load_dotenv('api/.env')
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

SOURCE_DB = "MindRiseDB"
TARGET_DB = "mindrise"
COLLECTION = "user_videos"

def migrate():
    print(f"Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    
    source_coll = client[SOURCE_DB][COLLECTION]
    target_coll = client[TARGET_DB][COLLECTION]
    
    # 1. Fetch from MindRiseDB
    videos = list(source_coll.find())
    print(f"Found {len(videos)} videos in {SOURCE_DB}.{COLLECTION}")
    
    if not videos:
        print("Nothing to migrate.")
        return

    # 2. Insert into mindrise (ignore duplicates if they somehow exist)
    count = 0
    for video in videos:
        # Check if already exists in target to avoid duplicates on rerun
        if not target_coll.find_one({"_id": video["_id"]}):
            target_coll.insert_one(video)
            count += 1
            
    print(f"Successfully migrated {count} videos to {TARGET_DB}.{COLLECTION}")
    
    # 3. Verification
    total_target = target_coll.count_documents({})
    print(f"Total videos in {TARGET_DB}.{COLLECTION}: {total_target}")

if __name__ == "__main__":
    migrate()
