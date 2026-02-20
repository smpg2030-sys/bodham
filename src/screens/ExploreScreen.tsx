import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Category icons and labels
const CATEGORIES = [
  { icon: "☀️", title: "Meditation", bg: "bg-emerald-100" },
  { icon: "🖼️", title: "Journaling", bg: "bg-sky-100" },
  { icon: "🛒", title: "Marketplace", bg: "bg-indigo-100" },
  { icon: "🏪", title: "Seller Hub", bg: "bg-violet-100" },
  { icon: "📖", title: "E-Books", bg: "bg-amber-100" },
  { icon: "👥", title: "Community", subtitle: "Stories", bg: "bg-rose-100" },
];

const EBOOKS = [
  { title: "The Power of Now", author: "Eckhart Tolle", cover: "📘", price: "Premium" },
  { title: "Atomic Habits", author: "James Clear", cover: "📗", price: "Premium" },
  { title: "The Subtle Art", author: "Mark Manson", cover: "📙", price: "Premium" },
  { title: "Mindfulness Guide", author: "Jon Kabat-Zinn", cover: "📕", price: "Premium" },
  { title: "Calm Mind Journey", author: "Sarah Miller", cover: "📔", price: "Premium" },
];

export default function ExploreScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEbooks, setShowEbooks] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [hasEbookAccess, setHasEbookAccess] = useState(false);

  const isSeller = user?.role === "seller" || user?.role === "admin" || user?.role === "host";
  const isApprovedSeller = user?.seller_status === "approved";

  const visibleCategories = CATEGORIES.filter(cat => {
    if (cat.title === "Seller Hub") {
      return isSeller && isApprovedSeller;
    }
    return true;
  });

  const handleSubscribe = () => {
    setShowPayment(true);
  };

  const handlePaymentDone = () => {
    setHasEbookAccess(true);
    setShowPayment(false);
    setShowEbooks(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#fdfdfd]">
      <header className="sticky top-0 z-10 glass-premium border-b border-white/20 px-6 py-6 flex items-center justify-between">
        <h1 className="font-premium text-3xl text-slate-900 tracking-tight">Explore</h1>
        <button type="button" className="p-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 rounded-full transition-all" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4">
        <div className="mb-8">
          <div className="relative group">
            <input
              type="text"
              className="input-field pl-12"
              placeholder="Search meditations, journals..."
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/support")}
          className="w-full mb-10 p-5 rounded-3xl bg-slate-900 text-white flex items-center justify-between hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/10 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🤍
            </div>
            <div className="text-left">
              <div className="font-premium text-lg">Sanctuary Support</div>
              <div className="text-xs text-emerald-100 opacity-60 font-medium uppercase tracking-widest">Available 24/7 for you</div>
            </div>
          </div>
          <span className="text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">→</span>
        </button>

        <h2 className="font-premium text-2xl text-slate-900 mb-6 px-1">Discover Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {visibleCategories.map((cat) => (
            <button
              key={cat.title}
              type="button"
              onClick={() => {
                if (cat.title === "E-Books") setShowEbooks(true);
                if (cat.title === "Community") navigate("/community-stories");
                if (cat.title === "Journaling") navigate("/journal");
                if (cat.title === "Marketplace") navigate("/marketplace");
                if (cat.title === "Seller Hub") navigate("/seller/dashboard");
              }}
              className={`${cat.bg} rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-sm group border border-white/50 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors" />
              <span className="text-4xl block mb-4 filter drop-shadow-sm group-hover:scale-110 transition-transform origin-left">{cat.icon}</span>
              <div className="font-premium text-2xl text-slate-900 mb-1">{cat.title}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider opacity-60">{cat.subtitle || "Access Room"}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Community Modal removed in favor of dedicated Preview Screen */}

      {showEbooks && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowEbooks(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">E-Books Library</h2>
              <button type="button" onClick={() => setShowEbooks(false)} className="text-2xl text-slate-500">
                ×
              </button>
            </div>
            <div className="p-4">
              {!hasEbookAccess ? (
                <div className="bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold mb-2">Unlock Premium E-Books</h3>
                  <p className="text-slate-600 mb-4">Get unlimited access to our entire wellness library</p>
                  <div className="text-2xl font-bold mb-4">$9.99<span className="text-base">/month</span></div>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600"
                  >
                    Subscribe Now
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-100 rounded-xl p-4 mb-6 flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span className="font-semibold text-emerald-800">Premium Active</span>
                </div>
              )}
              <div className="space-y-3">
                {EBOOKS.map((book, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <span className="text-4xl">{book.cover}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800">{book.title}</h3>
                      <p className="text-sm text-slate-600">{book.author}</p>
                      <p className="text-xs text-violet-600 mt-1">{book.price}</p>
                    </div>
                    {hasEbookAccess ? (
                      <button type="button" className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm">
                        Read
                      </button>
                    ) : (
                      <span className="text-slate-400">🔒</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div
          className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
          onClick={() => setShowPayment(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl p-6 text-white mb-6">
              <div className="text-sm opacity-90">Subscription</div>
              <div className="text-2xl font-bold">$9.99<span className="text-base">/month</span></div>
              <div className="text-sm mt-1">E-Books Premium Access</div>
            </div>
            <input
              type="text"
              className="w-full p-3 border-2 border-slate-200 rounded-xl mb-3"
              placeholder="Card Number"
              maxLength={19}
            />
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 p-3 border-2 border-slate-200 rounded-xl"
                placeholder="MM/YY"
                maxLength={5}
              />
              <input
                type="text"
                className="flex-1 p-3 border-2 border-slate-200 rounded-xl"
                placeholder="CVV"
                maxLength={4}
              />
            </div>
            <button
              type="button"
              onClick={handlePaymentDone}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-emerald-500"
            >
              Complete Payment
            </button>
            <p className="text-xs text-slate-500 text-center mt-4">🔒 Secure payment</p>
          </div>
        </div>
      )}
    </div>
  );
}
