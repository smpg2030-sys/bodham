import sys
import os
from dotenv import load_dotenv

import requests

def list_models():
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        models = response.json()
        print("\n--- Available Models ---")
        for m in models.get('models', []):
            if 'generateContent' in m.get('supportedGenerationMethods', []):
                print(f"- {m['name']}")
    except Exception as e:
        print(f"Error listing models: {e}")

load_dotenv()
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from api.services.moderation import check_content

# List models first
list_models()

print("\nTesting Gemini REST API...")
print(f"API Key present: {bool(os.getenv('GEMINI_API_KEY'))}")

# Test 1: Simple Text
print("\n--- Test 1: Simple Text ---")
result = check_content("I love this community, it is so peaceful.")
print(result)

# Test 2: Text with Image URL
print("\n--- Test 2: Text with Image URL ---")
result = check_content("Check this out", image_url="https://example.com/image.jpg")
print(result)
