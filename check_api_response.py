import requests
import json

try:
    print("Fetching from http://localhost:8000/api/community-stories/")
    r = requests.get("http://localhost:8000/api/community-stories/")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(json.dumps(data, indent=2))
        if isinstance(data, list) and len(data) > 0:
            print("SUCCESS: Returned list with data.")
        else:
            print("FAILURE: Returned empty list or non-list.")
    else:
        print(f"FAILURE: Status {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
