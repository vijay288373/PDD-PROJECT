import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { base44 } from "@/api/base44Client";
import AlertCard from "@/components/Alerts/AlertCard";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

const FILTER_TABS = ["filter_all", "filter_critical", "filter_market", "filter_weather", "filter_scans"];

const TAB_TYPE_MAP = {
  filter_all: null,
  filter_critical: "critical",
  filter_market: "market",
  filter_weather: "weather",
  filter_scans: "scan",
};

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("filter_all");
  const [uid, setUid] = useState(null);
  const { langCode } = useLang();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        setUid(user.email);
        const data = await base44.entities.Alert.filter({ uid: user.email }, "-created_date", 50);
        setAlerts(data);

        // Mark all as read
        const unread = data.filter(a => !a.read);
        await Promise.all(unread.map(a => base44.entities.Alert.update(a.id, { read: true })));
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    await Promise.all(unread.map(a => base44.entities.Alert.update(a.id, { read: true })));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const filtered = alerts.filter(a => {
    const type = TAB_TYPE_MAP[activeFilter];
    return type === null || a.type === type;
  });

  return (
    <div className="min-h-screen bg-[#f5f8f0]">
      {/* Header */}
      <div className="bg-[#1a5c2a] px-4 pt-4 pb-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-6 h-6 text-[#4ade80]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <h1 className="text-white font-bold text-xl">{t("alerts_title", langCode)}</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {t("alerts_new", langCode)}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[#a7f3c8] text-xs">
                <CheckCheck className="w-4 h-4" /> {t("alerts_mark_all_read", langCode)}
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide pb-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === tab
                    ? "bg-[#4ade80] text-[#0d1f3c] shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t(tab, langCode)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Content */}
      <div className="max-w-lg mx-auto pb-20 p-4">
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100 border-l-4 border-l-gray-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell className="w-14 h-14 text-gray-200 mb-4" />
            <p className="font-semibold text-gray-500">{t("alerts_empty", langCode)}</p>
            <p className="text-sm text-gray-400 mt-1">
              {activeFilter === "filter_all" ? t("alerts_caught_up", langCode) : t("alerts_no_type", langCode)}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3 pt-2">
              {filtered.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}