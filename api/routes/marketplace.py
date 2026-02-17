from fastapi import APIRouter, HTTPException
from database import get_db
from models import ProductResponse
from bson import ObjectId

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.get("", response_model=list[ProductResponse])
async def get_marketplace():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    # 1. Identify approved sellers
    approved_sellers_docs = list(db.users.find({"role": "seller", "seller_status": "approved"}))
    approved_seller_ids = [str(u["_id"]) for u in approved_sellers_docs]
    
    # 2. Fetch active products from these sellers
    cursor = db.products.find({
        "seller_id": {"$in": approved_seller_ids},
        "status": "active"
    }).sort("created_at", -1)
    
    products = []
    for p in cursor:
        p_id = str(p["_id"])
        products.append(ProductResponse(
            id=p_id,
            seller_id=p.get("seller_id"),
            seller_name=p.get("seller_name"),
            title=p.get("title"),
            description=p.get("description"),
            price=p.get("price"),
            stock=p.get("stock"),
            images=p.get("images", []),
            status=p.get("status", "active"),
            created_at=p.get("created_at")
        ))
    
    return products
