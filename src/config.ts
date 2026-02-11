const getApiBase = () => {
    // Check if we are running on Vercel or in development
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

    // If it's a full URL (like from VITE_API_BASE_URL), return it
    if (base.startsWith("http")) return base;

    // Otherwise, construct it relative to the current origin
    return window.location.origin + (base.startsWith("/") ? "" : "/") + base;
};

export const API_BASE = getApiBase();
