from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models import JournalEntryCreate, JournalEntryResponse
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/journals", tags=["journals"])

@router.get("/", response_model=List[JournalEntryResponse])
def get_journals(user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    # Strictly fetch only the entries belonging to the user
    entries = list(db.journals.find({"user_id": user_id}).sort("date", -1))
    
    results = []
    for doc in entries:
        doc["id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.post("/", response_model=JournalEntryResponse)
def create_journal(entry: JournalEntryCreate, user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    doc = {
        "user_id": user_id,
        "title": entry.title or f"Reflection - {datetime.now().strftime('%Y-%m-%d')}",
        "content": entry.content,
        "date": entry.date or datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = db.journals.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc

@router.put("/{journal_id}", response_model=JournalEntryResponse)
def update_journal(journal_id: str, entry: JournalEntryCreate, user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    update_data = {
        "content": entry.content
    }
    if entry.title:
        update_data["title"] = entry.title
    if entry.date:
        update_data["date"] = entry.date

    result = db.journals.update_one(
        {"_id": ObjectId(journal_id), "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found or unauthorized")
    
    doc = db.journals.find_one({"_id": ObjectId(journal_id)})
    doc["id"] = str(doc["_id"])
    return doc

@router.delete("/{journal_id}")
def delete_journal(journal_id: str, user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not established")
    
    result = db.journals.delete_one({"_id": ObjectId(journal_id), "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found or unauthorized")
    
    return {"message": "Journal entry deleted"}
