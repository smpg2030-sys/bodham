"""FastAPI app with MongoDB. Run: uvicorn main:app --reload"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.admin import router as admin_router

app = FastAPI(title="MindRise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
prefix = "/api" if os.getenv("VERCEL") else ""

app.include_router(auth_router, prefix=prefix)
app.include_router(admin_router, prefix=prefix)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "message": str(exc),
            "traceback": traceback.format_exc()
        }
    )


@app.get(prefix + "/health")
def health():
    try:
        from database import get_db
        db = get_db()
        if db is None:
            return {"status": "error", "message": "Database not connected. Check your MONGO_URI and IP Whitelist."}
        # Ping the database to check connection
        db.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc() if os.getenv("VERCEL") else None
        }


@app.get(prefix + "/")
def root():
    return {"message": "MindRise API", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
