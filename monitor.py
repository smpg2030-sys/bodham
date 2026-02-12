import os
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

# Load environment variables
load_dotenv()

def monitor():
    mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "mindrise")
    
    if not mongo_uri:
        print("❌ Error: MONGO_URI not found in .env file.")
        sys.exit(1)

    try:
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        print("\n" + "="*40)
        print("🌿 MINDRISE DATABASE DASHBOARD")
        print("="*40)
        
        # Core Stats
        users_count = db.users.count_documents({})
        journals_count = db.journals.count_documents({})
        posts_count = db.posts.count_documents({})
        pending_count = db.pending_posts.count_documents({})
        
        print(f"👤 Total Users:      {users_count}")
        print(f"📖 Journal Entries:  {journals_count}")
        print(f"✅ Approved Posts:   {posts_count}")
        print(f"⏳ Pending Review:   {pending_count}")
        
        # User Snapshot
        print("\n🆕 Latest Registrations:")
        latest_users = db.users.find().sort("_id", -1).limit(5)
        for u in latest_users:
            email = u.get('email', 'N/A')
            name = u.get('full_name', 'No Name')
            print(f" - {email} ({name})")
            
        # Storage Context
        print("\n📊 Storage Snapshot:")
        print(" - Plan: MongoDB Atlas Free Tier (Limit 512MB)")
        # We can't easily get the exact MB size from pymongo without dbStats, 
        # which might be restricted on free tier, but we can try.
        try:
            stats = db.command("dbstats")
            size_mb = stats.get('dataSize', 0) / (1024 * 1024)
            print(f" - Used Data Size: ~{size_mb:.2f} MB")
        except:
            print(" - Used Data Size: (Check Atlas UI for precise size)")
            
        print("="*40 + "\n")

    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    monitor()
