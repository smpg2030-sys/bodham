import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const getApiBase = () => {
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "/api");
    if (base.startsWith("http")) return base;
    return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

const API_BASE = getApiBase();

export default function VerifyOTPScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Verification failed");
            }

            // Login user
            if (data.token) localStorage.setItem("token", data.token);
            setUser(data);

            setMessage({ type: "success", text: "Verified! Redirecting..." });
            setTimeout(() => navigate("/", { replace: true }), 1500);

        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center bg-surface-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
                    <p className="text-red-500 font-bold mb-4">No email provided</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3 bg-surface-900 text-white rounded-xl font-bold hover:bg-surface-800 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-surface-50">
            {/* Left Panel - Same as Login for consistency */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex flex-col justify-center items-center bg-emerald-900 text-white p-12 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500 rounded-full blur-[120px] opacity-30 animate-float"></div>

                <div className="relative z-10 max-w-md text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl"
                    >
                        <span className="text-5xl">🔐</span>
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Security Check</h1>
                    <p className="text-emerald-100 text-lg leading-relaxed">
                        To protect your mindful space, please verify your email address.
                    </p>
                </div>
            </motion.div>

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm text-surface-500 hover:text-surface-800 transition mb-6 flex items-center gap-1"
                        >
                            ← Back to login
                        </button>
                        <h2 className="text-3xl font-bold text-surface-900 mb-2">Verify Email</h2>
                        <p className="text-surface-500 text-sm">
                            We've sent a code to <span className="font-bold text-surface-900">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-8">
                        <div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-4 text-center text-4xl font-bold tracking-[0.5em] text-surface-900 bg-surface-50 border-b-4 border-surface-200 focus:border-emerald-500 outline-none transition-colors rounded-t-2xl"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <p className="text-center text-xs text-surface-400 mt-2 uppercase tracking-wider font-bold">
                                Enter 6-digit code
                            </p>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl text-sm font-medium text-center ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-full font-bold text-white bg-surface-900 hover:bg-surface-800 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
