import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, MessageCircle, Zap, User } from "lucide-react";
import { useHomeRefresh } from "../context/HomeRefreshContext";

const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/messages", label: "Messages", Icon: MessageCircle },
  { to: "/focus", label: "Rooms", Icon: Zap },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const { triggerRefresh } = useHomeRefresh();
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none px-6 mb-8">
      <div className="w-full max-w-[440px] glass-premium rounded-[32px] border border-white/40 shadow-2xl px-2 pb-2 pt-2 flex items-center justify-around pointer-events-auto overflow-hidden">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={(e) => {
              if (to === "/") {
                if (location.pathname === "/") {
                  e.preventDefault();
                  triggerRefresh();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
            }}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center flex-1 py-3 px-1 rounded-2xl transition-all duration-500 ${isActive
                ? "text-emerald-900 bg-white/40 translate-y-[-2px]"
                : "text-slate-500 hover:text-emerald-700"
              }`
            }
          >
            <Icon className={`w-5 h-5 mb-1 transition-all duration-500 ${to === location.pathname ? 'stroke-[2.5px] scale-110 drop-shadow-[0_0_8px_rgba(6,78,59,0.3)]' : 'stroke-[1.5px]'}`} />
            <span className={`text-[10px] uppercase tracking-[0.1em] font-bold transition-all duration-500 ${to === location.pathname ? 'opacity-100' : 'opacity-40'}`}>
              {label}
            </span>
            {to === location.pathname && (
              <div className="absolute bottom-1 w-1 h-1 bg-emerald-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,78,59,0.5)]" />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
