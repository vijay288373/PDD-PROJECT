import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, CloudSun, ShoppingCart, UserCircle, Sprout, FlaskConical, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const NAV_KEYS = [
  { path: "/crop-advisor", icon: Sprout, key: "nav_crops", label: "Crops" },
  { path: "/growth-advisor", icon: FlaskConical, key: "nav_grow", label: "Grow" },
  { path: "/weather", icon: CloudSun, key: "nav_weather", label: "Weather" },
  { path: "/market", icon: ShoppingCart, key: "nav_market", label: "Market" },
  { path: "/", icon: Leaf, key: "nav_scan", label: "Scan" },
  { path: "/profile", icon: UserCircle, key: "nav_profile", label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { langCode } = useLang();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const user = await base44.auth.me();
        const alerts = await base44.entities.Alert.filter({ uid: user.email, read: false });
        setUnreadCount(alerts.length);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-3 left-3 right-3 max-w-screen-sm mx-auto glass-nav rounded-2xl flex z-50 p-1 shadow-2xl backdrop-blur-2xl border border-white/40 dark:border-emerald-500/20">
      {NAV_KEYS.map(({ path, icon: Icon, key, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center py-2 px-0.5 rounded-xl transition-all duration-300 relative justify-center ${
              isActive
                ? "text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/15 shadow-sm border border-emerald-500/25 scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/5"
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]" : ""}`} />
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight truncate ${isActive ? "font-semibold" : "font-normal"}`}>
              {t(key, langCode) || label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </Link>
        );
      })}

      {/* Floating alerts bell – positioned as a badge in top-right of nav bar */}
      {unreadCount > 0 && (
        <button
          onClick={() => navigate('/alerts')}
          className="absolute -top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce"
        >
          <Bell className="w-3 h-3" />
          {unreadCount > 9 ? "9+" : unreadCount}
        </button>
      )}
    </div>
  );
}