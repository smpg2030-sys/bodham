import requests
import json
from config import GEMINI_API_KEY
from datetime import datetime

def check_content(text: str, image_url: str | None = None, video_url: str | None = None) -> dict:
    """
    Analyzes content using Gemini AI via REST API (Lighter than SDK).
    Returns autonomous status (approved, rejected, flagged).
    """
    
    if not GEMINI_API_KEY:
        # Fallback to safe flagging if API key is missing
        return {
            "score": 0.5,
            "status": "flagged",
            "category": "system_error",
            "details": ["Gemini API Key missing: Defaulting to manual review"],
            "language": "en",
            "transcript": None
        }

    try:
        # Prompt for Gemini
        prompt = f"""
        Analyze the following content for a community-driven mindfulness app (Mindrise).
        Content Text: "{text}"
        {'Image/Video URL: ' + (image_url or video_url) if (image_url or video_url) else ''}
        
        Provide a safety assessment in JSON format with:
        - status: "approved" (safe), "rejected" (unsafe/harmful), or "flagged" (ambiguous)
        - score: 0.0 (Safe) to 1.0 (Unsafe)
        - category: one word (e.g., hate, violence, sexual, spam, safe, controversial)
        - reason: brief explanation
        
        Rules:
        - Approve motivational, peaceful, and community-friendly content.
        - Reject nudity, extreme violence, hate speech, or obvious scams.
        - Flag if you are uncertain but it seems slightly controversial.
        """

        # Gemini REST API (Flash 2.0 Lite - Better availability/quota)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key={GEMINI_API_KEY}"
        
        # Use simple model name if preview specific one fails, but let's try standard aliases
        # Actually in recent tests gemini-2.0-flash-lite-001 worked but was rate limited.
        # Let's stick to gemini-2.0-flash as it is most standard for V2 beta.
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        # Retry logic for Rate Limits (429)
        import time
        max_retries = 3
        last_error = None
        
        for attempt in range(max_retries):
            try:
                response = requests.post(url, json=payload, timeout=15)
                
                if response.status_code == 429:
                    # Rate Limit
                    wait_time = 2 * (attempt + 1)
                    print(f"Gemini 429 Rate Limit. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    last_error = "Rate Limit (Quota Exceeded)"
                    continue
                
                if response.status_code != 200:
                    last_error = f"HTTP {response.status_code}: {response.text}"
                    response.raise_for_status()

                data = response.json()
                
                # Verify response structure
                if 'candidates' not in data or not data['candidates']:
                    # This happens if content was blocked by safety filters natively
                    if 'promptFeedback' in data:
                        return {
                            "score": 1.0,
                            "status": "rejected",
                            "category": "safety_block",
                            "details": ["Blocked by Gemini Safety Filters"],
                            "language": "en"
                        }
                    raise Exception(f"No candidates returned. Response: {data}")

                raw_text = data['candidates'][0]['content']['parts'][0]['text']
                
                # Clean JSON from markdown blocks if present
                raw_text = raw_text.strip()
                if "```json" in raw_text:
                    raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_text:
                    raw_text = raw_text.split("```")[1].split("```")[0].strip()
                    
                result = json.loads(raw_text)
                
                return {
                    "score": float(result.get("score", 0.1)),
                    "status": result.get("status", "approved"),
                    "category": result.get("category", "unclassified"),
                    "details": [result.get("reason", "AI Assessed via REST")],
                    "language": "en",
                    "transcript": None
                }
                
            except Exception as e:
                last_error = str(e)
                print(f"Gemini Attempt {attempt+1} failed: {e}")
                time.sleep(1)

        # If we get here, all retries failed
        print(f"Gemini Moderation Failed after {max_retries} attempts: {last_error}")
        return {
            "score": 0.5,
            "status": "flagged",
            "category": "rate_limited" if "Rate Limit" in str(last_error) else "api_error",
            "details": [f"Moderation failed: {str(last_error)}"],
            "language": "en",
            "transcript": None
        }

    except Exception as e:
        print(f"Gemini REST Moderation Error: {e}")
        return {
            "score": 0.5,
            "status": "flagged",
            "category": "system_error",
            "details": [f"System Error: {str(e)}"],
            "language": "en",
            "transcript": None
        }
