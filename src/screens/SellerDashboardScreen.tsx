import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Package, Plus, Edit, Trash2, TrendingUp, DollarSign, ArrowLeft, Image as ImageIcon, X, Info } from "lucide-react";
import { Product } from "../types";

const getApiBase = () => {
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");
    if (base.startsWith("http")) return base;
    return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

const API_BASE = getApiBase();

export default function SellerDashboardScreen() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: ""
    });

    useEffect(() => {
        if (!user) return;
        if (user.seller_status !== "approved") {
            // Check if we should refresh to see if status changed
            refreshUser();
        } else {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/sellers/products?seller_id=${user?.id}`);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            images: form.imageUrl ? [form.imageUrl] : []
        };

        try {
            const endpoint = editingProduct
                ? `${API_BASE}/sellers/products/${editingProduct.id}?seller_id=${user?.id}`
                : `${API_BASE}/sellers/products?seller_id=${user?.id}`;

            const res = await fetch(endpoint, {
                method: editingProduct ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchProducts();
                setShowAddModal(false);
                setEditingProduct(null);
                setForm({ title: "", description: "", price: "", stock: "", category: "", imageUrl: "" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await fetch(`${API_BASE}/sellers/products/${id}?seller_id=${user?.id}`, { method: "DELETE" });
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const isSeller = user?.role === "seller" || user?.role === "admin" || user?.role === "host";
    const isApproved = user?.seller_status === "approved";

    if (!user || !isSeller || !isApproved) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Access Restricted</h1>
                    <p className="text-slate-500 mb-8">
                        {user?.seller_status === "pending"
                            ? "Your application is currently under review. Please check back later."
                            : "You must be an approved seller to access this dashboard."}
                    </p>
                    <button onClick={() => navigate("/")} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFB] pb-20">
            <div className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/")} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-black text-slate-800">Seller Hub</h1>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setForm({ title: "", description: "", price: "", stock: "", category: "", imageUrl: "" });
                            setShowAddModal(true);
                        }}
                        className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-black text-slate-800">₹0</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                            <Package size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Products</p>
                        <h3 className="text-3xl font-black text-slate-800">{products.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center mb-4">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Rating</p>
                        <h3 className="text-3xl font-black text-slate-800">N/A</h3>
                    </div>
                </div>

                {/* Product Table */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-800">My Inventory</h2>
                        <span className="text-xs font-bold text-slate-400">Showing {products.length} Items</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Product</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Price</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Stock</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                                                    <img src={p.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{p.title}</p>
                                                    <p className="text-xs text-slate-400">{p.category || "No Category"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-black text-slate-800">₹{p.price}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${p.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                                {p.stock} in stock
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(p);
                                                        setForm({
                                                            title: p.title,
                                                            description: p.description,
                                                            price: p.price.toString(),
                                                            stock: p.stock.toString(),
                                                            category: p.category || "",
                                                            imageUrl: p.images[0] || ""
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && !loading && (
                            <div className="py-20 text-center">
                                <Package size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-medium">Your inventory is empty.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-800">{editingProduct ? "Edit Product" : "New Product"}</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 transition-all outline-none font-medium"
                                    placeholder="Name of your product"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 transition-all outline-none font-medium"
                                    placeholder="Tell customers about it..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 transition-all outline-none font-medium"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                                    <input
                                        required
                                        type="number"
                                        value={form.stock}
                                        onChange={e => setForm({ ...form, stock: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 transition-all outline-none font-medium"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden shrink-0">
                                        {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={24} />}
                                    </div>
                                    <input
                                        value={form.imageUrl}
                                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                        className="flex-1 px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 transition-all outline-none font-medium"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 active:scale-98 transition-all">
                                {editingProduct ? "Update Product" : "Publish Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
