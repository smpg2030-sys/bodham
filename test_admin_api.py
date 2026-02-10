import requests
import os
from dotenv import load_dotenv

# Load config
load_dotenv(dotenv_path="backend/.env")

API_BASE = "http://localhost:8000/api"

def test_admin_stats():
    # Simulate admin request
    role = "admin"
    print(f"Testing stats endpoint with role={role}...")
    try:
        response = requests.get(f"{API_BASE}/admin/stats", params={"role": role})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

    print(f"\nTesting users endpoint with role={role}...")
    try:
        response = requests.get(f"{API_BASE}/admin/users", params={"role": role})
        print(f"Status Code: {response.status_code}")
        # Print first 2 users to avoid spam
        users = response.json()
        print(f"User Count: {len(users)}")
        if users:
            print(f"First User: {users[0]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_stats()
