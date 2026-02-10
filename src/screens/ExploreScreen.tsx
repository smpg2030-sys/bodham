import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronRight, X, CreditCard, BookOpen, Users, PenTool, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  {
    id: "meditation",
    icon: "☀️",
    title: "Meditation",
    subtitle: "120+ Sessions",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    height: "h-48"
  },
  {
    id: "journaling",
    icon: <PenTool className="w-6 h-6" />,
    title: "Journaling",
    subtitle: "Daily Prompts",
    bg: "bg-sky-100",
    text: "text-sky-800",
    height: "h-40"
  },
  {
    id: "community",
    icon: <Users className="w-6 h-6" />,
    title: "Community",
    subtitle: "Active Stories",
    bg: "bg-violet-100",
    text: "text-violet-800",
    height: "h-40"
  },
  {
    id: "ebooks",
    icon: <BookOpen className="w-6 h-6" />,
    title: "E-Books",
    subtitle: "Premium Library",
    bg: "bg-amber-100",
    text: "text-amber-800",
    height: "h-48"
  },
];

const EBOOKS = [
  { title: "The Power of Now", author: "Eckhart Tolle", cover: "📘", price: "Premium" },
  { title: "Atomic Habits", author: "James Clear", cover: "📗", price: "Premium" },
  { title: "The Subtle Art", author: "Mark Manson", cover: "📙", price: "Premium" },
  { title: "Mindfulness Guide", author: "Jon Kabat-Zinn", cover: "📕", price: "Premium" },
  { title: "Calm Mind Journey", author: "Sarah Miller", cover: "📔", price: "Premium" },
];

const COMMUNITY_STORIES = [
  {
    title: "Indian AI Reading Document",
    source: "The Better India",
    link: "https://thebetterindia.com/innovation/indian-ai-document-reading-sarvam-gemini-openai-language-tests-11092770",
    cover: "/images/sarvam-ai.png",
    description: "How Sarvam AI is breaking language barriers in document reading."
  }
];

const BottomSheet = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white z-[101] rounded-t-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
          </div>

          <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 pb-12">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [showEbooks, setShowEbooks] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [hasEbookAccess, setHasEbookAccess] = useState(false);

  const handleSubscribe = () => {
    setShowPayment(true);
  };

  const handlePaymentDone = () => {
    setHasEbookAccess(true);
    setShowPayment(false);
    setShowEbooks(false);
  };

  return (
    <div className="app-container min-h-screen bg-surface-50 pb-24">
      <header className="sticky top-0 z-10 glass px-6 py-4 flex items-center justify-between border-b border-white/50">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Explore</h1>
        <button type="button" className="p-2.5 bg-white rounded-full text-slate-600 shadow-sm border border-slate-100 hover:scale-105 transition" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="p-6">
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-soft focus:shadow-md focus:ring-2 focus:ring-emerald-100 transition-all text-slate-700 placeholder:text-slate-400"
            placeholder="Search meditations, journals..."
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => navigate("/support")}
          className="w-full mb-8 p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800 text-lg">Therapist Support</div>
              <div className="text-sm text-slate-500 font-medium">We're here for you 24/7</div>
            </div>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </motion.button>

        <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Discover</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {CATEGORIES.filter((_, i) => i % 2 === 0).map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (cat.id === "ebooks") setShowEbooks(true);
                  if (cat.id === "community") setShowCommunity(true);
                }}
                className={`${cat.bg} ${cat.height} w-full rounded-[2rem] p-6 text-left transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden group border-2 border-white/50`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ChevronRight className={`w-4 h-4 ${cat.text}`} />
                  </div>
                </div>
                <span className={`text-4xl block mb-2 w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center backdrop-blur-sm ${cat.text}`}>
                  {typeof cat.icon === 'string' ? cat.icon : cat.icon}
                </span>
                <div>
                  <div className={`font-bold text-lg ${cat.text} mb-1`}>{cat.title}</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider opacity-70 ${cat.text}`}>{cat.subtitle}</div>
                </div>
              </motion.button>
            ))}
          </div>
          <div className="space-y-4 pt-8">
            {CATEGORIES.filter((_, i) => i % 2 !== 0).map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (cat.id === "ebooks") setShowEbooks(true);
                  if (cat.id === "community") setShowCommunity(true);
                }}
                className={`${cat.bg} ${cat.height} w-full rounded-[2rem] p-6 text-left transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden group border-2 border-white/50`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ChevronRight className={`w-4 h-4 ${cat.text}`} />
                  </div>
                </div>
                <span className={`text-4xl block mb-2 w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center backdrop-blur-sm ${cat.text}`}>
                  {typeof cat.icon === 'string' ? cat.icon : cat.icon}
                </span>
                <div>
                  <div className={`font-bold text-lg ${cat.text} mb-1`}>{cat.title}</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider opacity-70 ${cat.text}`}>{cat.subtitle}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <BottomSheet isOpen={showCommunity} onClose={() => setShowCommunity(false)} title="Community Stories">
        <div className="space-y-4">
          {COMMUNITY_STORIES.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl shadow-inner overflow-hidden flex-shrink-0">
                  {story.cover.startsWith("/") ? (
                    <img src={story.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📄</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-violet-600 mb-1 uppercase tracking-wide">{story.source}</div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">{story.title}</h3>
                </div>
              </div>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed border-l-2 border-violet-100 pl-3">{story.description}</p>
              <a
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-slate-900 text-white text-center rounded-xl font-bold text-sm hover:bg-slate-800 transition mt-4 block"
              >
                Read Full Story
              </a>
            </motion.div>
          ))}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">✨</div>
            <p className="text-slate-500 font-medium">More stories coming soon!</p>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={showEbooks} onClose={() => setShowEbooks(false)} title="Premium Library">
        {!hasEbookAccess ? (
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Unlock Unlimited Wisdom</h3>
              <p className="text-indigo-100 mb-6 leading-relaxed">Get lifetime access to our curated collection of mindfulness bestsellers.</p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-indigo-200 mb-1 font-medium">/ month</span>
              </div>
              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full py-3.5 rounded-xl font-bold text-indigo-900 bg-white hover:bg-indigo-50 transition shadow-lg"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">✓</div>
            <span className="font-bold text-emerald-800">Premium Active</span>
          </div>
        )}

        <div className="grid gap-3">
          {EBOOKS.map((book, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors group"
            >
              <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                {book.cover}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base">{book.title}</h3>
                <p className="text-sm text-slate-500">{book.author}</p>
              </div>
              {hasEbookAccess ? (
                <button type="button" className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition">
                  READ
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="text-xs">🔒</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </BottomSheet>

      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[110] backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Payment Details</h2>
                <button onClick={() => setShowPayment(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
                <div className="flex justify-between items-start mb-8">
                  <div className="opacity-80 text-sm font-medium">Personal Plan</div>
                  <CreditCard className="w-6 h-6 opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">$9.99</div>
                <div className="text-xs opacity-60">/ month</div>
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition text-sm font-medium placeholder:text-slate-400"
                  placeholder="Card Number"
                  maxLength={19}
                />
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="flex-1 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition text-sm font-medium placeholder:text-slate-400"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    className="flex-1 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition text-sm font-medium placeholder:text-slate-400"
                    placeholder="CVV"
                    maxLength={4}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePaymentDone}
                className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
              >
                Pay & Subscribe
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldIcon className="w-3 h-3" />
                <span>256-bit SSL Secure Payment</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShieldIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}
