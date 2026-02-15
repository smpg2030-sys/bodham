import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LiveRoom } from "../types";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutDashboard, DollarSign, ChevronRight, ArrowLeft, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HostDashboardScreen() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<LiveRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"group" | "private">("group");
    const [access, setAccess] = useState<"free" | "paid">("free");
    const [price, setPrice] = useState("0");
    const [scheduledAt, setScheduledAt] = useState("");
    const [duration, setDuration] = useState("60");

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

    useEffect(() => {
        if (!((user?.role === "host" || user?.role === "admin") && user?.is_verified_host)) {
            navigate("/focus");
            return;
        }
        fetchHostData();
    }, [user]);

    const fetchHostData = async () => {
        setLoading(true);
        try {
            // We'll fetch all rooms and filter for now, or update API if needed
            const res = await fetch(`${BASE_URL}/sessions/rooms?status=upcoming`);
            if (res.ok) {
                const data = await res.json();
                setRooms(data.filter((r: any) => r.host_id === user?.id));
            }
        } catch (error) {
            console.error("Failed to fetch host data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingRoomId(null);
        setTitle("");
        setType("group");
        setAccess("free");
        setPrice("0");
        setScheduledAt("");
        setDuration("60");
        setShowCreateModal(true);
    };

    const handleOpenEditModal = (room: LiveRoom) => {
        setEditingRoomId(room.id);
        setTitle(room.title);
        setType(room.type as any);
        setAccess(room.access as any);
        setPrice(room.price.toString());
        setScheduledAt(room.scheduled_at ? room.scheduled_at.substring(0, 16) : ""); // Format for datetime-local
        setDuration(room.duration.toString());
        setShowCreateModal(true);
    };

    const handleCreateOrUpdateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingRoomId ? "PUT" : "POST";
        const url = editingRoomId
            ? `${BASE_URL}/sessions/rooms/${editingRoomId}?user_id=${user?.id}`
            : `${BASE_URL}/sessions/rooms?user_id=${user?.id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    type,
                    access,
                    price: parseFloat(price),
                    scheduled_at: scheduledAt || new Date().toISOString(),
                    duration: parseInt(duration)
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                fetchHostData();
            } else {
                alert(`Failed to ${editingRoomId ? 'update' : 'create'} room`);
            }
        } catch (error) {
            console.error(`Error ${editingRoomId ? 'updating' : 'creating'} room`, error);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm("Are you sure you want to delete this upcoming session?")) return;

        try {
            const res = await fetch(`${BASE_URL}/sessions/rooms/${roomId}?user_id=${user?.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchHostData();
            } else {
                alert("Failed to delete room");
            }
        } catch (error) {
            console.error("Error deleting room", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/focus")} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-800">Host Dashboard</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your sessions</p>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Stats Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-100">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                            <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-tight">Total Net</p>
                        <h2 className="text-2xl font-black">$0.00</h2>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Upcoming</p>
                        <h2 className="text-2xl font-black text-slate-800">{rooms.length}</h2>
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Upcoming Sessions</h3>
                        <button
                            onClick={handleOpenCreateModal}
                            className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Room
                        </button>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="py-8 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading...</div>
                        ) : rooms.length === 0 ? (
                            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 text-sm font-medium">No upcoming sessions yet.</p>
                            </div>
                        ) : (
                            rooms.map(room => (
                                <div key={room.id} className="bg-white rounded-3xl p-4 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">
                                            🧘‍♂️
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{room.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                                <span>{room.type}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-indigo-500">{new Date(room.scheduled_at || room.scheduledAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(room)}
                                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRoom(room.id)}
                                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/sessions/${room.id}`, { state: { token: 'host_token' } })}
                                            className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
                            <h2 className="text-2xl font-black text-slate-800 mb-6">
                                {editingRoomId ? 'Edit Live Room' : 'Create Live Room'}
                            </h2>

                            <form onSubmit={handleCreateOrUpdateRoom} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Room Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Morning Vinyasa Yoga"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Type</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value as any)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800"
                                        >
                                            <option value="group">Group</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Access</label>
                                        <select
                                            value={access}
                                            onChange={(e) => setAccess(e.target.value as any)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800"
                                        >
                                            <option value="free">Free</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                {access === "paid" && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Price ($)</label>
                                        <input
                                            type="number"
                                            value={price}
                                            step="0.01"
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Duration (min)</label>
                                        <input
                                            type="number"
                                            required
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {editingRoomId ? 'Update Room' : 'Publish Room'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
