"""MongoDB connection. Call get_db() to get the database instance."""
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError
from config import MONGO_URI, DB_NAME

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        if not MONGO_URI or "localhost" in MONGO_URI:
             print("WARNING: MONGO_URI is pointing to localhost or is empty.")
             print("Ensure your .env file has a valid MongoDB Atlas URI.")
        
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            # Verify connection
            _client.admin.command('ping')
            print("Successfully connected to MongoDB.")
        except Exception as e:
            print(f"CRITICAL: Could not connect to MongoDB: {e}")
            _client = None # Explicitly set to None on failure
    return _client


def get_db():
    client = get_client()
    if client:
        return client[DB_NAME]
    return None
