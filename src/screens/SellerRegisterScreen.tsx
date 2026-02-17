import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

const getApiBase = () => {
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");
    if (base.startsWith("http")) return base;
    return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

const API_BASE = getApiBase();

export default function SellerRegisterScreen() {
    const navigate = useNavigate();
    const [step, setStep] = useState<"details" | "otp" | "success">("details");
    const [fullName, setFullName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/sellers/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    business_name: businessName,
                    phone_number: phoneNumber
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Registration failed");
            }
            setStep("otp");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/sellers/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Verification failed");
            }
            setStep("success");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-white">
                <button
                    onClick={() => navigate("/login")}
                    className="mb-8 p-2 rounded-xl border-2 border-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>

                {step === "details" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-2xl font-black text-slate-800 mb-2">Grow your business</h1>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Register as a seller and start listing your products</p>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Business Name (Optional)</label>
                                <input
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                                    placeholder="Acme Corp"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                                        >
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                            </div>

                            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold ring-1 ring-red-100">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? "Processing..." : (
                                    <>
                                        Continue
                                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {step === "otp" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h1 className="text-2xl font-black text-slate-800 mb-2">Verify Email</h1>
                        <p className="text-slate-500 text-sm mb-8 font-medium">We sent a 6-digit code to <span className="text-violet-600 font-bold">{email}</span></p>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <input
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="w-full px-5 py-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none transition-all text-center text-3xl font-black tracking-[1em] text-violet-600 placeholder:text-slate-200"
                                placeholder="000000"
                            />

                            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold ring-1 ring-red-100">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Verify & Register"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep("details")}
                                className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Change Email Address
                            </button>
                        </form>
                    </div>
                )}

                {step === "success" && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 mb-2">Application Submitted!</h1>
                        <p className="text-slate-500 text-sm mb-10 font-medium">
                            Thank you for applying to be a seller. Our admin team will review your application within 24-48 hours.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
