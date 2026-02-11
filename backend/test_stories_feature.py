from fastapi.testclient import TestClient
from main import app
from models import CommunityStoryCreate
import sys
import os

# Add backend to sys.path to resolve imports if run from root
sys.path.append(os.path.join(os.getcwd(), 'backend'))

client = TestClient(app)

def test_create_and_get_story():
    print("Testing Community Stories API...")
    
    # 1. Create a story
    new_story = {
        "title": "Test Story",
        "description": "This is a test description",
        "content": "This is the full content of the test story.",
        "image_url": "https://example.com/image.jpg",
        "author": "Tester"
    }
    
    print(f"Creating story: {new_story['title']}")
    response = client.post("/api/community-stories/", json=new_story)
    
    if response.status_code != 200:
        print(f"FAILED to create story: {response.status_code} {response.text}")
        return
    
    created_story = response.json()
    print(f"SUCCESS: Created story with ID {created_story['id']}")
    
    # 2. Get all stories
    print("Fetching all stories...")
    response = client.get("/api/community-stories/")
    
    if response.status_code != 200:
        print(f"FAILED to get stories: {response.status_code} {response.text}")
        return
        
    stories = response.json()
    print(f"SUCCESS: Retrieved {len(stories)} stories")
    
    found = False
    for story in stories:
        if story['id'] == created_story['id']:
            found = True
            print("Verified: Created story found in list.")
            break
            
    if not found:
        print("FAILED: Created story not found in list.")

    # 3. Get single story
    print(f"Fetching story details for {created_story['id']}...")
    response = client.get(f"/api/community-stories/{created_story['id']}")
    
    if response.status_code != 200:
        print(f"FAILED to get story details: {response.status_code} {response.text}")
        return
    
    detail = response.json()
    if detail['content'] == new_story['content']:
        print("SUCCESS: Story details verified.")
    else:
        print("FAILED: Content mismatch.")

if __name__ == "__main__":
    test_create_and_get_story()
