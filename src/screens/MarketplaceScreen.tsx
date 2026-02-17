import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Search, ShoppingCart, ArrowLeft, Tag, Package } from "lucide-react";
import { Product } from "../types";

const getApiBase = () => {
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");
    if (base.startsWith("http")) return base;
    return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

const API_BASE = getApiBase();

export default function MarketplaceScreen() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        fetch(`${API_BASE}/marketplace`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.seller_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FDFEFE] pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/")} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-800">Marketplace</h1>
                    </div>

                    <div className="flex-1 max-w-md relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products, sellers..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-violet-600 transition-colors"
                        >
                            {viewMode === "grid" ? <List size={20} /> : <LayoutGrid size={20} />}
                        </button>
                        <button className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 flex items-center gap-2 text-xs font-bold">
                            <ShoppingCart size={16} />
                            <span>Cart (0)</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Mobile Search */}
                <div className="md:hidden relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 outline-none transition-all"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] bg-slate-50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Package size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">No products found</h2>
                        <p className="text-slate-400 text-sm">Try searching for something else or check back later.</p>
                    </div>
                ) : (
                    <div className={viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className={`group bg-white rounded-3xl border border-slate-100 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300 ${viewMode === "list" ? "flex gap-4 p-4" : "p-4"}`}
                            >
                                <div className={`relative overflow-hidden rounded-2xl bg-slate-50 ${viewMode === "list" ? "w-40 h-40" : "aspect-square mb-4"}`}>
                                    <img
                                        src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <button className="p-2 bg-white/80 backdrop-blur shadow-sm rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1.5 overflow-hidden">
                                        <Tag size={12} className="text-violet-500 shrink-0" />
                                        <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider truncate">{product.seller_name || "Official Store"}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 truncate leading-tight group-hover:text-violet-600 transition-colors">{product.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">{product.description}</p>

                                    <div className="flex items-center justify-between gap-2 mt-auto">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 mr-1">₹</span>
                                            <span className="text-lg font-black text-slate-800">{product.price.toLocaleString()}</span>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-50 hover:bg-violet-600 hover:text-white text-slate-600 rounded-xl text-[10px] font-black transition-all">
                                            VIEW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
