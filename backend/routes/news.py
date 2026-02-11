from fastapi import APIRouter, HTTPException, Body
from typing import List
from datetime import datetime
import uuid
from database import get_db
from models import NewsArticle

router = APIRouter()

@router.get("/", response_model=List[NewsArticle])
async def get_news_articles():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    articles = list(db.news_articles.find({}, {"_id": 0}).sort("published_at", -1))
    return articles

@router.get("/{article_id}", response_model=NewsArticle)
async def get_news_article(article_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    article = db.news_articles.find_one({"article_id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/", response_model=NewsArticle)
async def create_news_article(article: NewsArticle):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    # Check if article_id already exists
    if db.news_articles.find_one({"article_id": article.article_id}):
        raise HTTPException(status_code=400, detail="Article with this ID already exists")
    
    db.news_articles.insert_one(article.dict())
    return article

@router.post("/seed")
async def seed_news_articles():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    # Sample data
    sample_articles = [
        {
            "article_id": str(uuid.uuid4()),
            "title": "Indian AI Reading Document",
            "short_description": "How Sarvam AI is breaking language barriers in document reading.",
            "content": "Full content about Sarvam AI and their language tests with Gemini and OpenAI...",
            "image_url": "/images/sarvam-ai.png",
            "author": "The Better India",
            "published_at": datetime.now().isoformat()
        },
        {
            "article_id": str(uuid.uuid4()),
            "title": "The Rise of Mindful Technology",
            "short_description": "How new apps are helping people stay focused in a digital world.",
            "content": "Deep dive into the latest trends in wellness technology...",
            "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
            "author": "Tech Wellness",
            "published_at": datetime.now().isoformat()
        }
    ]
    
    # Clear existing and seed
    db.news_articles.delete_many({})
    db.news_articles.insert_many(sample_articles)
    
    return {"message": f"Successfully seeded {len(sample_articles)} articles"}
