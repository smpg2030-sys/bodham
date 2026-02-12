import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JournalEntry } from "../types";
import { motion } from "framer-motion";
import {
    Book,
    Plus,
    ArrowLeft,
    Calendar,
    Search,
    Trash2,
    Save,
    X,
    ChevronRight,
    Clock
} from "lucide-react";

const getApiBase = () => {
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");
    if (base.startsWith("http")) return base;
    return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

const API_BASE = getApiBase();

export default function JournalScreen() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Current entry being edited/created
    const [currentEntry, setCurrentEntry] = useState<{
        id?: string;
        title: string;
        content: string;
        date: string;
    }>({
        title: "",
        content: "",
        date: new Date().toISOString()
    });

    useEffect(() => {
        fetchEntries();
    }, [user]);

    const fetchEntries = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE}/journals/?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (err) {
            console.error("Failed to fetch journals:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !currentEntry.content.trim()) return;

        setLoading(true);
        try {
            const method = currentEntry.id ? "PUT" : "POST";
            const url = currentEntry.id
                ? `${API_BASE}/journals/${currentEntry.id}?user_id=${user.id}`
                : `${API_BASE}/journals/?user_id=${user.id}`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: currentEntry.title,
                    content: currentEntry.content,
                    date: currentEntry.date
                })
            });

            if (res.ok) {
                await fetchEntries();
                setIsEditing(false);
                setCurrentEntry({ title: "", content: "", date: new Date().toISOString() });
            }
        } catch (err) {
            console.error("Error saving journal entry:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !window.confirm("Are you sure you want to delete this memory?")) return;

        try {
            const res = await fetch(`${API_BASE}/journals/${id}?user_id=${user.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setEntries(entries.filter(e => e.id !== id));
            }
        } catch (err) {
            console.error("Error deleting journal entry:", err);
        }
    };

    const startEditing = (entry: JournalEntry) => {
        setCurrentEntry({
            id: entry.id,
            title: entry.title || "",
            content: entry.content,
            date: entry.date
        });
        setIsEditing(true);
    };

    const filteredEntries = entries.filter(e =>
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#faf9f6] text-slate-800 pb-24 lg:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-100 flex items-center justify-between p-4 px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-500">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-stone-800">My Journal</h1>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Private Sanctuary</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setCurrentEntry({ title: "", content: "", date: new Date().toISOString() });
                        setIsEditing(true);
                    }}
                    className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 hover:scale-105 transition-transform"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </header>

            <main className="max-w-4xl mx-auto p-4 py-8">
                {!isEditing ? (
                    <div className="space-y-8">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search through your memories..."
                                className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-3xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-stone-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {loading && entries.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-stone-400 font-serif italic">Gathering your thoughts...</p>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="text-center py-20 px-8 bg-white rounded-[40px] shadow-sm border border-stone-50">
                                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                    <Book className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Begin your story</h3>
                                <p className="text-stone-500 max-w-sm mx-auto leading-relaxed">
                                    Your journal is a safe space for your digital thoughts. Click the plus button to write your first entry.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredEntries.map((entry, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={entry.id}
                                        onClick={() => startEditing(entry)}
                                        className="group bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-bold tracking-tighter uppercase">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <h3 className="text-xl font-serif font-bold text-stone-800">{entry.title}</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(entry.id);
                                                    }}
                                                    className="p-3 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-stone-600 line-clamp-3 leading-relaxed font-medium">
                                            {entry.content}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                                <Clock className="w-3 h-3" />
                                                {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[40px] shadow-2xl border border-stone-50 overflow-hidden"
                    >
                        <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
                            <input
                                type="text"
                                placeholder="Give your memory a title..."
                                className="bg-transparent border-0 text-2xl font-serif font-black focus:ring-0 outline-none w-full placeholder:text-stone-300 text-stone-800"
                                value={currentEntry.title}
                                onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                            />
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-2 hover:bg-stone-200/50 rounded-full transition-colors text-stone-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 pb-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                            <textarea
                                placeholder="Pour your thoughts onto the page..."
                                className="w-full h-[50vh] bg-transparent border-0 focus:ring-0 outline-none resize-none font-medium leading-relaxed text-lg text-stone-700 placeholder:text-stone-300"
                                value={currentEntry.content}
                                onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="p-6 px-8 bg-stone-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider">
                                <Calendar className="w-4 h-4" />
                                {new Date(currentEntry.date).toLocaleDateString()}
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading || !currentEntry.content.trim()}
                                className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {loading ? "Saving..." : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Archive Memory
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
