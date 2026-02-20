import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Send, Trash2, AlertCircle } from "lucide-react";
import { Post, Comment } from "../types";
import VideoPlayer from "./VideoPlayer";

interface PostCardProps {
    post: Post;
    currentUserId: string;
    activeVideoId?: string | null;
    onLikeToggle: (postId: string) => void;
    onCommentSubmit: (postId: string, content: string) => void;
    onDelete?: (postId: string) => void;
    onReport?: (postId: string) => void;
}

export default function PostCard({ post, currentUserId, activeVideoId, onLikeToggle, onCommentSubmit, onDelete, onReport }: PostCardProps) {
    const navigate = useNavigate();
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const handleLike = () => {
        onLikeToggle(post.id);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onCommentSubmit(post.id, commentText);
        setCommentText("");
    };

    const toggleComments = async () => {
        setShowComments(!showComments);
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");
                const apiBase = base.startsWith("http") ? base : window.location.origin + (base.startsWith("/") ? "" : "/") + base;

                const res = await fetch(`${apiBase}/posts/${post.id}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (error) {
                console.error("Failed to load comments", error);
            } finally {
                setLoadingComments(false);
            }
        }
    };

    return (
        <div className="post-card group">
            {/* Header */}
            <div className="p-2 flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden cursor-pointer ring-2 ring-emerald-50 ring-offset-2 transition-all group-hover:ring-emerald-100"
                        onClick={() => navigate(`/profile/${post.user_id}`)}
                    >
                        {post.author_profile_pic ? (
                            <img src={post.author_profile_pic} alt={post.author_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-900 bg-emerald-50 font-premium text-xl">
                                {post.author_name?.charAt(0) || "B"}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3
                            className="font-premium text-xl text-slate-900 cursor-pointer hover:text-emerald-800 transition-colors"
                            onClick={() => navigate(`/profile/${post.user_id}`)}
                        >
                            {post.author_name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {post.status !== 'approved' && (
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-tighter ${post.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                            {post.status}
                        </span>
                    )}
                    {currentUserId === post.user_id && onDelete && (
                        <button onClick={() => onDelete(post.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    {currentUserId !== post.user_id && onReport && (
                        <button
                            onClick={() => onReport(post.id)}
                            className="p-2 text-slate-200 hover:text-slate-400 hover:bg-slate-50 rounded-full transition-all"
                            title="Report Post"
                        >
                            <AlertCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-1 pb-4">
                <p className="text-slate-700 leading-relaxed text-[16px] font-medium whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {(post.image_url || post.video_url) && (
                <div className="w-full rounded-2xl overflow-hidden shadow-sm mb-4 border border-slate-100/50">
                    {post.image_url && (
                        <div className="w-full aspect-[4/3] bg-slate-50">
                            <img src={post.image_url} alt="Post content" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                    )}
                    {post.video_url && (
                        <div
                            className="w-full aspect-video bg-black"
                            data-video-id={post.id}
                        >
                            <VideoPlayer
                                src={post.video_url}
                                className="w-full h-full"
                                shouldPlay={post.id === activeVideoId}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 group/btn transition-all ${post.is_liked_by_me ? 'text-pink-600' : 'text-slate-400 hover:text-pink-600'}`}
                    >
                        <div className={`p-2 rounded-full transition-all ${post.is_liked_by_me ? 'bg-pink-50' : 'group-hover/btn:bg-pink-50'}`}>
                            <Heart className={`w-6 h-6 ${post.is_liked_by_me ? 'fill-current' : ''}`} />
                        </div>
                        <span className="font-bold text-sm">{post.likes_count}</span>
                    </button>

                    <button
                        onClick={toggleComments}
                        className="flex items-center gap-2 group/btn text-slate-400 hover:text-emerald-700 transition-all"
                    >
                        <div className="p-2 rounded-full group-hover/btn:bg-emerald-50 transition-all">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">{post.comments_count}</span>
                    </button>
                </div>

                <button className="p-2 text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all">
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    {loadingComments ? (
                        <div className="text-center py-6">
                            <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Gathering thoughts...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 mb-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4">
                                    <div
                                        className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 cursor-pointer"
                                        onClick={() => navigate(`/profile/${comment.user_id}`)}
                                    >
                                        {comment.author_profile_pic ? (
                                            <img src={comment.author_profile_pic} alt={comment.author_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-emerald-900 bg-emerald-50 font-bold">
                                                {comment.author_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span
                                                className="font-bold text-slate-800 text-sm cursor-pointer hover:text-emerald-700 transition-colors"
                                                onClick={() => navigate(`/profile/${comment.user_id}`)}
                                            >
                                                {comment.author_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">The silence is peaceful. Be the first to speak?</p>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center bg-slate-50/80 p-2 rounded-[24px] border border-slate-100">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your resonance..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="p-3 bg-emerald-900 text-white rounded-full disabled:opacity-20 disabled:grayscale hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
