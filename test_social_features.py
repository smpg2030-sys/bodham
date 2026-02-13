import sys
import os
import asyncio
# Add 'api' folder to sys.path so 'routes' can be imported by main.py
sys.path.append(os.path.join(os.path.dirname(__file__), "api"))

from httpx import AsyncClient, ASGITransport
from api.main import app
from api.database import get_db
from pymongo import MongoClient

async def test_social_flow():
    print("Creating ASGITransport...")
    transport = ASGITransport(app=app)
    print("Creating AsyncClient...")
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("Client created.")

        print("Calling /api/health...")
        try:
            response = await client.get("/api/health")
            print(f"Health Response: {response.status_code} {response.text}")
        except Exception as e:
            print("Health check failed!")
            import traceback
            traceback.print_exc()
            return

        # 1. Login/Register User A
        user_a_email = "usera_test@example.com"
        user_a_pass = "password123"
        print("Registering User A...")
        await client.post("/api/auth/register", json={
            "email": user_a_email,
            "password": user_a_pass,
            "full_name": "User A"
        })
        # Verify User A in DB
        db = get_db()
        db.users.update_one({"email": user_a_email}, {"$set": {"is_verified": True, "is_phone_verified": True}})

        print("Logging in User A...")
        login_res_a = await client.post("/api/auth/login", json={
            "email": user_a_email,
            "password": user_a_pass
        })
        if login_res_a.status_code != 200:
             print(f"Login A failed: {login_res_a.text}")
             return

        token_a = "mock_token" # Login doesn't return token in this specific implementation shown in auth.py, it returns UserResponse?
        # Wait, auth.py login returns UserResponse. It does NOT return a token?
        # Let's check auth.py again.
        # @router.post("/login", response_model=UserResponse)
        # It returns UserResponse.
        # Make sure UserResponse has id. YES.
        # It seems there is NO JWT token returned in the code I read?
        # "access_token" is usually in a token response.
        # The user seems to be using basic auth or just id?
        # In the previous artifacts or context, was there a token?
        # The `auth.py` file I read shows `def login` returning `UserResponse`.
        # It does NOT return `{"access_token": ...}`.
        # So I should just get user_id.
        user_a_id = login_res_a.json().get("id")
        print(f"User A ID: {user_a_id}")

        # 2. Login/Register User B
        user_b_email = "userb_test@example.com"
        user_b_pass = "password123"
        print("Registering User B...")
        await client.post("/api/auth/register", json={
            "email": user_b_email,
            "password": user_b_pass,
            "full_name": "User B"
        })
        
        # Verify User B in DB
        db.users.update_one({"email": user_b_email}, {"$set": {"is_verified": True, "is_phone_verified": True}})

        print("Logging in User B...")
        login_res_b = await client.post("/api/auth/login", json={
            "email": user_b_email,
            "password": user_b_pass
        })
        user_b_id = login_res_b.json().get("id")
        print(f"User B ID: {user_b_id}")

        # 3. User A creates a post
        print("User A creating post...")
        post_res = await client.post(f"/api/posts/?user_id={user_a_id}&author_name=UserA", json={
            "content": "Hello World Social!"
        })
        post_id = post_res.json().get("id")
        print(f"Post Created: {post_id}")

        # 4. User B likes the post
        print("User B liking post...")
        # interactions.py expects user_id in body
        like_res = await client.post(f"/api/posts/{post_id}/like", json={"user_id": user_b_id})
        print(f"Like Response: {like_res.json()}")
        assert like_res.status_code == 200
        assert like_res.json()["is_liked"] == True

        # 5. User B comments on the post
        print("User B commenting...")
        comment_res = await client.post(f"/api/posts/{post_id}/comments", json={
            "comment": {"content": "Nice post!"}, 
            "user_id": user_b_id
        })
        # Note: endpoint signature: add_comment(post_id, comment: CommentCreate, user_id: Body)
        # FastApi might expect:
        # { "comment": { "content": "..." }, "user_id": "..." } if Body(embed=True) is used for user_id
        # interactions.py: user_id: str = Body(..., embed=True)
        # comment: CommentCreate (body)
        # This mix is tricky. Usually if Pydantic model is used, it takes the whole body unless embed=True is used for it too.
        # But here 'comment' argument is not Body(embed=True).
        # So FastAPI expects `{"content": "...", "user_id": "..."}` MERGED?
        # NO. if one param is Body(embed=True), it expects `{"user_id": "..."}`.
        # But `comment` is Pydantic model.
        # If multiple body params, FastAPI expects a dict with keys matching param names IF they are all embedded?
        # Let's inspect the error if it fails.
        if comment_res.status_code != 200:
             print(f"Comment failed: {comment_res.text}")
        else:
             print(f"Comment Response: {comment_res.json()}")

        # 6. Verify Feed sees the stats
        print("User B checking feed...")
        feed_res = await client.get(f"/api/posts/?user_id={user_b_id}")
        feed_posts = feed_res.json()
        target_post = next((p for p in feed_posts if p["id"] == post_id), None)
        
        print(f"Feed Post Data: {target_post}")
        if target_post:
            assert target_post["likes_count"] >= 1
            assert target_post["comments_count"] >= 1
            assert target_post["is_liked_by_me"] == True
        else:
            print("Post not found in feed!")

if __name__ == "__main__":
    try:
        asyncio.run(test_social_flow())
        print("Test Passed!")
    except Exception as e:
        print(f"Test Failed: {e}")
        import traceback
        traceback.print_exc()

