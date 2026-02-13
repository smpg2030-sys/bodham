import google.generativeai as genai
import json
from config import GEMINI_API_KEY
from datetime import datetime

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def check_content(text: str, image_url: str | None = None, video_url: str | None = None) -> dict:
    """
    Analyzes content using Gemini AI.
    Returns autonomous status (approved, rejected, flagged).
    """
    
    if not model:
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
        # Construct Prompt
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

        # For now, we only pass the text/metadata to Gemini Flash. 
        # In a full-scale vision implementation, we'd pass the actual image bytes/files.
        response = model.generate_content(prompt)
        
        # Clean response text as it might be wrapped in ```json
        raw_text = response.text.strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(raw_text)
        
        return {
            "score": float(result.get("score", 0.1)),
            "status": result.get("status", "approved"),
            "category": result.get("category", "unclassified"),
            "details": [result.get("reason", "AI Assessed")],
            "language": "en",
            "transcript": None
        }

    except Exception as e:
        print(f"Gemini Moderation Error: {e}")
        return {
            "score": 0.5,
            "status": "flagged",
            "category": "api_error",
            "details": [f"Moderation failed: {str(e)}"],
            "language": "en",
            "transcript": None
        }
