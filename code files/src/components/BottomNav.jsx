import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, CloudSun, ShoppingCart, Bell, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const NAV_KEYS = [
  { path: "/", icon: Leaf, key: "nav_scan" },
  { path: "/weather", icon: CloudSun, key: "nav_weather" },
  { path: "/market", icon: ShoppingCart, key: "nav_market" },
  { path: "/alerts", icon: Bell, key: "nav_alerts" },
  { path: "/profile", icon: UserCircle, key: "nav_profile" },
];

export default function BottomNav() {
  const location = useLocation();
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50 shadow-lg">
      {NAV_KEYS.map(({ path, icon: Icon, key }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center py-2 transition-colors min-h-[48px] justify-center ${
              isActive ? "text-[#1a5c2a]" : "text-gray-400 hover:text-[#1a5c2a]"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {key === "nav_alerts" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-xs mt-0.5 ${isActive ? "font-medium" : ""}`}>{t(key, langCode)}</span>
          </Link>
        );
      })}
    </div>
  );
}