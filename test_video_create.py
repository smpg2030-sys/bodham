import requests
import json

URL = "http://localhost:8001/api/videos/"
payload = {
    "title": "Test Video",
    "video_url": "http://example.com/video.mp4",
    "user_id": "678aef874f5fb1f8498caf1f",
    "author_name": "sai"
}

print(f"Testing video creation at {URL}...")
try:
    res = requests.post(URL, json=payload)
    print(f"Status: {res.status_code}")
    print(f"Body: {res.text}")
except Exception as e:
    print(f"Error: {e}")
