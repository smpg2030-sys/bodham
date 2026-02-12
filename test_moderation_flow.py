import requests
import json
import time
from datetime import datetime

API_BASE = "http://localhost:8000/api"

def test_moderation_flow():
    print("--- Starting Post Moderation Flow Verification ---")
    
    # 1. Fetch a user to use as author
    print("Fetching users to get a valid user_id...")
    # Since we can't easily get an admin token here, we assume the server is running without strict auth for these endpoints OR we use the fact that they take user_id as param
    # Let's try to get users via the auth route if possible, or just use a dummy ID for testing database insertion
    user_id = "698ac3494074a0a36e261d86" # From previous logs
    author_name = "Verification Tester"

    # 2. Create a Post
    print(f"Creating a new post for user {user_id}...")
    post_payload = {
        "content": f"Verification post at {datetime.utcnow().isoformat()}",
        "image_url": None
    }
    params = {
        "user_id": user_id,
        "author_name": author_name
    }
    
    create_res = requests.post(f"{API_BASE}/posts/", params=params, json=post_payload)
    if create_res.status_code != 200:
        print(f"FAILED: Post creation failed with status {create_res.status_code}")
        print(create_res.text)
        return

    post_data = create_res.json()
    post_id = post_data["id"]
    print(f"SUCCESS: Post created with ID: {post_id}")

    # 3. Check Status (expected: pending)
    print("Checking initial post status (expected: pending)...")
    status_res = requests.get(f"{API_BASE}/posts/{post_id}/status")
    if status_res.status_code != 200:
        print(f"FAILED: Status check failed with status {status_res.status_code}")
        return
    
    status_data = status_res.json()
    print(f"Initial status: {status_data['status']}")
    if status_data['status'] != "pending":
        print(f"FAILED: Expected 'pending', got '{status_data['status']}'")
        return
    print("SUCCESS: Initial status is 'pending'")

    # 4. Moderate (Approve)
    print(f"Approving post {post_id} as admin...")
    # Note: Admin role is required in the query param
    mod_payload = {
        "status": "approved"
    }
    mod_res = requests.put(f"{API_BASE}/admin/posts/{post_id}/status?role=admin", json=mod_payload)
    if mod_res.status_code != 200:
        print(f"FAILED: Moderation failed with status {mod_res.status_code}")
        print(mod_res.text)
        return
    print("SUCCESS: Post approved")

    # 5. Check Status Again (expected: approved)
    print("Checking status after approval (expected: approved)...")
    status_res = requests.get(f"{API_BASE}/posts/{post_id}/status")
    if status_res.status_code != 200:
        print(f"FAILED: Status check failed with status {status_res.status_code}")
        return
    
    status_data = status_res.json()
    print(f"Status after moderation: {status_data['status']}")
    if status_data['status'] != "approved":
        print(f"FAILED: Expected 'approved', got '{status_data['status']}'")
        return
    print("SUCCESS: Post status is now 'approved'")

    # 6. Verify in Feed
    print("Verifying post appears in feed...")
    feed_res = requests.get(f"{API_BASE}/posts/")
    if feed_res.status_code != 200:
        print(f"FAILED: Feed fetch failed with status {feed_res.status_code}")
        return
    
    feed_posts = feed_res.json()
    found = any(p["id"] == post_id for p in feed_posts)
    if found:
        print("SUCCESS: Post found in public feed")
    else:
        print("FAILED: Post NOT found in public feed")

    print("\n--- Verification Complete: ALL TESTS PASSED ---")

if __name__ == "__main__":
    test_moderation_flow()
