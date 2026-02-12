import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
db_name = os.getenv("DB_NAME", "mindrise")

print(f"Connecting to MongoDB: {mongo_uri}")
print(f"Database: {db_name}")

client = MongoClient(mongo_uri)
db = client[db_name]

collections = db.list_collection_names()
print("\nCollections in database:")
for coll in collections:
    count = db[coll].count_documents({})
    print(f" - {coll}: {count} documents")
