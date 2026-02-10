import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Post } from "../types";

const TABS = ["All Posts", "Daily Quotes", "Gratitude"] as const;

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "/api"); // Ensure consistency

export default function HomeFeedScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All Posts");
  const [showNewPost, setShowNewPost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts/`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !user) return;

    try {
      const res = await fetch(`${API_BASE}/posts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ideally we should send a token, but for now passing user_id as per backend implementation
        // We need to pass user_id and author_name as query params or body? 
        // Backend definition: create_post(post: PostCreate, user_id: str, author_name: str)
        // FastAPI defaults to query params for scalar types not in Pydantic model.
        // Let's check backend/routes/posts.py again. create_post uses DI? No, just args.
        // So params: ?user_id=...&author_name=...
        body: JSON.stringify({ content: postContent }),
      });

      // Wait, I need to send user_id and author_name. 
      // If I send JSON body, it maps to `post: PostCreate`. 
      // `user_id` and `author_name` are separate arguments, so they are Query parameters by default in FastAPI.
      // I should update the fetch call to include them in URL.
      // Re-reading backend/routes/posts.py:
      // def create_post(post: PostCreate, user_id: str, author_name: str):
      // Yes, they are query params.

      const url = new URL(`${API_BASE}/posts/`);
      url.searchParams.append("user_id", user.id);
      url.searchParams.append("author_name", user.full_name || user.email);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postContent }),
      });

      if (response.ok) {
        alert("Post submitted for review! ✅");
        setPostContent("");
        setShowNewPost(false);
        // We don't refresh feed because it only shows approved posts.
      } else {
        alert("Failed to submit post.");
      }
    } catch (error) {
      console.error("Error creating post", error);
      alert("Error submitting post.");
    }
  };

  return (
    <div className="app-container min-h-screen bg-[#f8f9fa] pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold bg-gradient-to-br from-green-400 to-green-600"
          >
            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "M"}
          </div>
          <h1 className="text-xl font-bold text-slate-800">MindRise</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="p-2 text-slate-600"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-slate-600" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowNewPost(true)}
            className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold"
          >
            +
          </button>
        </div>
      </header>

      <div className="flex gap-2 px-4 py-4 border-b border-slate-100 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === tab ? "bg-green-500 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xl text-slate-400 mb-2">No posts yet</p>
            <p className="text-slate-500 text-sm">
              Be the first to share your mindful moment!
            </p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {post.author_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{post.author_name}</p>
                  <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-slate-700">{post.content}</p>
            </div>
          ))
        )}
      </div>

      {showNewPost && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowNewPost(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setShowNewPost(false)} className="text-2xl text-slate-500">
                ×
              </button>
              <h2 className="text-xl font-bold">New Post</h2>
              <button
                type="button"
                onClick={handleCreatePost}
                className="px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-green-400 to-green-600"
              >
                Post
              </button>
            </div>
            <textarea
              className="w-full p-4 border-2 border-slate-200 rounded-xl mb-4 h-32"
              placeholder="How are you feeling today?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <button
              type="button"
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 mb-4"
            >
              ⚡ Rewrite with AI
            </button>
            <div className="grid grid-cols-2 gap-3">
              <label className="p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer text-center hover:bg-slate-50">
                <span className="text-2xl block mb-1">📷</span>
                <span className="text-sm text-slate-500">Camera</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              <label className="p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer text-center hover:bg-slate-50">
                <span className="text-2xl block mb-1">🖼️</span>
                <span className="text-sm text-slate-500">Gallery</span>
                <input type="file" accept="image/*,video/*" className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">Posts are moderated before appearing</p>
          </div>
        </div>
      )}

      {showSearch && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <button type="button" onClick={() => setShowSearch(false)} className="text-2xl text-slate-500">
                ←
              </button>
              <input
                type="text"
                className="flex-1 p-3 border-2 border-slate-200 rounded-xl"
                placeholder="Search users, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            {searchQuery ? (
              <p className="text-slate-500 text-center py-8">No results found</p>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xl mb-2">🔍</p>
                <p>Search for users or posts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
