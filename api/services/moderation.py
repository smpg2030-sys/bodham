from config import GEMINI_API_KEY, SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET
from datetime import datetime
import requests
import json
import re
import time

def is_obviously_safe(text: str) -> bool:
    """Check for extremely safe/motivational keywords."""
    safe_patterns = [
        r"(?i)\b(peace|mindful|meditation|breathe|calm|gratitude|love|joy|happiness)\b",
        r"(?i)\b(good morning|have a great day|stay positive|keep going)\b"
    ]
    return any(re.search(p, text) for p in safe_patterns) and len(text.split()) < 50

def is_obviously_harmful(text: str) -> bool:
    """Check for obvious profanity or spam patterns."""
    harmful_patterns = [
        r"(?i)\b(fuck|shit|bitch|asshole|faggot|nigger|kill yourself)\b", # Basic profanity
        r"(?i)\b(earn \d+\$|make money fast|click here|buy now|bitcoin|crypto scam)\b" # Spam
    ]
    return any(re.search(p, text) for p in harmful_patterns)

def check_with_sightengine(text: str, image_url: str | None = None, video_url: str | None = None) -> dict | None:
    """Specialized moderation via Sightengine (High efficiency for media)."""
    if not SIGHTENGINE_API_USER or not SIGHTENGINE_API_SECRET:
        return None

    try:
        # 1. Text Moderation
        if text:
            text_params = {
                'text': text,
                'lang': 'en',
                'mode': 'standard',
                'api_user': SIGHTENGINE_API_USER,
                'api_secret': SIGHTENGINE_API_SECRET
            }
            res = requests.post('https://api.sightengine.com/1.0/text/check.json', data=text_params, timeout=10)
            if res.status_code == 200:
                data = res.json()
                if data.get('status') == 'success':
                    profanity = data.get('profanity', {}).get('matches', [])
                    if profanity:
                        return {
                            "score": 0.95,
                            "status": "rejected",
                            "category": "profanity",
                            "details": [f"Harmful language detected: {', '.join([p['type'] for p in profanity])}"]
                        }

        # 2. Image Moderation (Aggressive Detection)
        if image_url:
            image_params = {
                'models': 'nudity-2.0,wad,scam,suggestive,gore',
                'url': image_url,
                'api_user': SIGHTENGINE_API_USER,
                'api_secret': SIGHTENGINE_API_SECRET
            }
            res = requests.get('https://api.sightengine.com/1.0/check.json', params=image_params, timeout=15)
            if res.status_code == 200:
                data = res.json()
                if data.get('status') == 'success':
                    nudity = data.get('nudity', {})
                    # Aggressive REJECT thresholds
                    if (nudity.get('erotica', 0) > 0.1 or 
                        nudity.get('sexual_display', 0) > 0.1 or 
                        nudity.get('sexting', 0) > 0.1 or
                        nudity.get('raw', 0) > 0.1 or
                        nudity.get('partial', 0) > 0.2):
                        return {"score": 1.0, "status": "rejected", "category": "nudity", "details": ["System detected prohibited visual content."]}
                    
                    # WAD and Gore
                    wad = data.get('weapon', 0) + data.get('alcohol', 0) + data.get('drugs', 0)
                    if wad > 0.5 or data.get('gore', {}).get('prob', 0) > 0.3:
                        return {"score": 1.0, "status": "rejected", "category": "harmful_visuals", "details": ["Content violates community safety guidelines."]}

                    scam = data.get('scam', {}).get('prob', 0)
                    if scam > 0.6:
                        return {"score": 0.9, "status": "rejected", "category": "scam", "details": ["Scam pattern detected."]}
                    
                    # If Sightengine says it's clean (with high confidence), we can return approved
                    # But for safety, we'll let it move to Gemini if image exists.
                    # Or we could return:
                    # return {"score": 0.1, "status": "approved", "category": "safe", "details": ["Sightengine safe image"]}

        return None # Inconclusive, move to Gemini
    except Exception as e:
        print(f"Sightengine Error: {e}")
        return {"status": "error", "details": f"Sightengine Fail: {str(e)}"}

def check_content(text: str, image_url: str | None = None, video_url: str | None = None) -> dict:
    """Hybrid logic: Heuristics -> Sightengine -> Gemini."""
    # 1. Heuristics
    if is_obviously_harmful(text):
        return {"score": 1.0, "status": "rejected", "category": "spam_profanity", "details": ["Heuristic filter detected harmful content."], "language": "en"}
    if is_obviously_safe(text) and not image_url and not video_url:
        return {"score": 0.0, "status": "approved", "category": "safe", "details": ["Heuristic filter detected safe content."], "language": "en"}

    # 2. Sightengine
    sight_result = check_with_sightengine(text, image_url, video_url)
    if sight_result:
        if sight_result.get("status") == "rejected":
            return {**sight_result, "language": "en"}
        if sight_result.get("status") == "approved":
            return {**sight_result, "language": "en"}
        # If error, keep record for Gemini fallback

    # 3. Gemini Fallback
    if not GEMINI_API_KEY:
        error_msg = sight_result.get("details") if (sight_result and sight_result.get("status") == "error") else "Keys missing"
        return {"score": 0.5, "status": "flagged", "category": "api_fail", "details": [f"Moderation unavailable: {error_msg}"], "language": "en"}

    try:
        # Simpler prompt to avoid safety blocks
        prompt = f"Moderate text: '{text}'. Media: {image_url or video_url or 'None'}. Mindfulness app. Response JSON: {{'status':'approved'|'rejected', 'category':'...', 'reason':'...'}}"
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        res = requests.post(url, json=payload, timeout=10)
        if res.status_code != 200:
            sight_error = f"(SE Error: {sight_result.get('details')})" if (sight_result and sight_result.get("status") == "error") else ""
            return {"score": 0.5, "status": "flagged", "category": "api_fail", "details": [f"Gemini HTTP {res.status_code} {sight_error}"], "language": "en"}

        data = res.json()
        if 'candidates' not in data:
            return {"score": 1.0, "status": "rejected", "category": "safety_block", "details": ["Inappropriate content blocked by provider."]}

        raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
        if "```json" in raw_text: raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text: raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(raw_text)
        return {
            "score": 0.9 if result.get("status") == "rejected" else 0.1,
            "status": result.get("status", "flagged"),
            "category": result.get("category", "unclassified"),
            "details": [result.get("reason", "AI Decision")],
            "language": "en"
        }
    except Exception as e:
        sight_error = f" (SE Error: {sight_result.get('details')})" if (sight_result and sight_result.get("status") == "error") else ""
        return {"score": 0.5, "status": "flagged", "category": "ai_fail", "details": [f"Logic Error: {str(e)}{sight_error}"], "language": "en"}
