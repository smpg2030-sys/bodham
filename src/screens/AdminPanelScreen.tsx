import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Post, User } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "/api");

export default function AdminPanelScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ total_users: 0, pending_moderation: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "posts">("posts");

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) return;
    try {
      // Fetch stats, users, and pending posts
      const [usersRes, statsRes, postsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users?role=${user.role}`),
        fetch(`${API_BASE}/admin/stats?role=${user.role}`),
        fetch(`${API_BASE}/admin/posts?role=${user.role}`)
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
      if (postsRes.ok) {
        setPendingPosts(await postsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleModeration = async (postId: string, status: "approved" | "rejected") => {
    let reason = "";
    if (status === "rejected") {
      reason = prompt("Enter rejection reason (optional):") || "";
      if (reason === null) return; // Cancelled
    }

    try {
      const res = await fetch(`${API_BASE}/admin/posts/${postId}/status?role=${user?.role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason })
      });

      if (res.ok) {
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
        setStats(prev => ({ ...prev, pending_moderation: Math.max(0, prev.pending_moderation - 1) }));
      } else {
        alert("Failed to update post status");
      }
    } catch (error) {
      console.error("Error updating post", error);
    }
  };

  return (
    <div className="app-container min-h-screen bg-[#f8f9fa] p-4 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button type="button" onClick={() => navigate("/profile")} className="text-2xl text-slate-600">
          ←
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.total_users}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{pendingPosts.length}</div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-2 px-4 font-medium text-sm transition ${activeTab === "posts" ? "border-b-2 border-green-500 text-green-600" : "text-slate-500"}`}
        >
          Moderation Queue
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2 px-4 font-medium text-sm transition ${activeTab === "users" ? "border-b-2 border-green-500 text-green-600" : "text-slate-500"}`}
        >
          User Management
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading data...</div>
      ) : activeTab === "posts" ? (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
              <p className="text-slate-500">All caught up! No pending posts.</p>
            </div>
          ) : (
            pendingPosts.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                      {post.author_name[0]}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{post.author_name}</p>
                      <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold uppercase">
                    Pending
                  </span>
                </div>
                <p className="text-slate-800 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {post.content}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModeration(post.id, "approved")}
                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleModeration(post.id, "rejected")}
                    className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <div className="font-semibold text-slate-800">{u.full_name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.role}
                    </span>
                    {u.is_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
