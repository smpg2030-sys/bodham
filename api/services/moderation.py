import random
import re

def check_content(text: str, image_url: str | None = None, video_url: str | None = None) -> dict:
    """
    Analyzes content and returns a moderation score and status.
    Score ranges from 0.0 (Safe) to 1.0 (Unsafe).
    
    Thresholds:
    - Score < 0.3: Approved
    - 0.3 <= Score < 0.7: Flagged
    - Score >= 0.7: Rejected
    """
    
    score = 0.1 # Default safe score
    details = []
    
    # 1. Text Analysis (Heuristics)
    text_lower = text.lower()
    
    # Positive/Safe categories (Bonus for safety)
    positive_keywords = ["motivation", "inspire", "peace", "calm", "love", "community", "dance", "fun", "humor", "meditate"]
    if any(word in text_lower for word in positive_keywords):
        score -= 0.1 
        details.append("Positive sentiment detected")

    # Flagged keywords (Medium risk)
    flagged_keywords = ["political", "controversial", "scam", "money", "invest", "crypto"]
    if any(word in text_lower for word in flagged_keywords):
        score += 0.4
        details.append("Controversial keywords detected")
        
    # High risk / Banned keywords (High risk)
    banned_keywords = ["hate", "violence", "kill", "attack", "abuse", "xxx", "nsfw"]
    if any(word in text_lower for word in banned_keywords):
        score += 0.8
        details.append("Harmful content detected")

    # clamp score
    score = max(0.0, min(1.0, score))
    
    # Determine Status
    if score < 0.3:
        status = "approved"
    elif score < 0.7:
        status = "flagged"
    else:
        status = "rejected"
        
    return {
        "score": round(score, 2),
        "status": status,
        "details": details
    }
