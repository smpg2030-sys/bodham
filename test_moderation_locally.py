import os
import sys
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Add api path
sys.path.append(os.path.join(os.getcwd(), 'api'))

from services.moderation import check_content, check_with_sightengine

print("--- DIAGNOSTICS ---")
print(f"GEMINI_KEY present: {bool(os.getenv('GEMINI_API_KEY'))}")
print(f"SIGHTENGINE_USER present: {bool(os.getenv('SIGHTENGINE_API_USER'))}")
print(f"SIGHTENGINE_SECRET present: {bool(os.getenv('SIGHTENGINE_API_SECRET'))}")

print("\n--- TEST 1: Heuristics/Gemini ---")
res = check_content("I hate you and I want to kill you")
print(f"Result: {res['status']}")
if 'details' in res:
    print(f"Details: {res['details']}")

print("\n--- TEST 2: Sightengine (Text) ---")
res = check_with_sightengine("damn")
if res:
    print(f"Result: {res.get('status')} ({res.get('category', 'No Category')})")
    if 'details' in res:
        print(f"Details: {res['details']}")
else:
    print("Result: None (Passed)")

print("\n--- TEST 3: Gemini (Text) ---")
res = check_content("This is a peaceful meditation post.")
print(f"Result: {res['status']}")
if 'details' in res:
    print(f"Details: {res['details']}")
