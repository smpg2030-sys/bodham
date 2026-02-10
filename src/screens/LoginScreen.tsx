import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "/api");
  if (base.startsWith("http")) return base;
  return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

const API_BASE = getApiBase();

type Mode = "login" | "register";

const FloatingPixelInput = ({
  id,
  type = "text",
  label,
  value,
  onChange,
  required = false
}: {
  id: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <div className="relative group">
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className="block px-4 pb-3 pt-6 w-full text-base text-slate-900 bg-slate-50 rounded-t-2xl border-b-2 border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
      placeholder=" "
    />
    <label
      htmlFor={id}
      className="absolute text-sm text-slate-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 font-medium pointer-events-none"
    >
      {label}
    </label>
    {/* Ripple effect line */}
    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-600 scale-x-0 group-focus-within:scale-x-100 transition-transform origin-center duration-300" />
  </div>
);

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, full_name: fullName || undefined };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.detail ||
          data?.message ||
          "Something went wrong. Please try again."
        );
      }

      if (mode === "login") {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name ?? null,
        });

        navigate("/", { replace: true });
        return;
      }

      setMessage({
        type: "success",
        text: "Code sent! Redirecting to verify...",
      });
      setTimeout(() => navigate("/verify", { state: { email } }), 1000);

    } catch (err: any) {
      if (err.message.includes("Email not verified")) {
        setMessage({
          type: "error",
          text: "Account not verified. Redirecting...",
        });
        setTimeout(() => navigate("/verify", { state: { email } }), 1500);
      } else {
        setMessage({
          type: "error",
          text: err.message || "Network error. Please try again.",
        });
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-50">
      {/* Left Panel - Illustration */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-center items-center bg-emerald-900 text-white p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500 rounded-full blur-[120px] opacity-30 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-400 rounded-full blur-[100px] opacity-20 animate-float" style={{ animationDelay: "2s" }}></div>

        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl"
          >
            <span className="text-5xl">🌿</span>
          </motion.div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">MindRise</h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Your daily companion for mindfulness, journaling, and personal growth.
            Join our community of mindful thinkers today.
          </p>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-surface-900 mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-surface-500 text-sm">
              {mode === "login"
                ? "Enter your details to access your space."
                : "Start your journey to a clearer mind."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <FloatingPixelInput
                    id="fullname"
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <FloatingPixelInput
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FloatingPixelInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-red-50 text-red-800 border border-red-100"
                  }`}
              >
                <span>{message.type === "success" ? "🎉" : "⚠️"}</span>
                {message.text}
              </motion.div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full font-bold text-white bg-surface-900 hover:bg-surface-800 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-surface-500 text-sm">
              {mode === "login" ? "New to MindRise?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors ml-1"
              >
                {mode === "login" ? "Register now" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

