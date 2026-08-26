import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Leaf, CloudRain, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const TYPE_CONFIG = {
  critical: {
    border: "border-l-red-500",
    badge: "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30",
    badgeLabel: "CRITICAL",
    Icon: AlertTriangle,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10 border border-red-500/20",
    btnClass: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20 hover:shadow-red-500/40",
    btnLabel: "Take Action",
  },
  market: {
    border: "border-l-amber-400",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    badgeLabel: "MARKET",
    Icon: TrendingUp,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 border border-amber-500/20",
    btnClass: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/40",
    btnLabel: "View Market",
  },
  scan: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    badgeLabel: "SCAN",
    Icon: Leaf,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 border border-emerald-500/20",
    btnClass: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40",
    btnLabel: "View Result",
  },
  weather: {
    border: "border-l-blue-500",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
    badgeLabel: "WEATHER",
    Icon: CloudRain,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 border border-blue-500/20",
    btnClass: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/40",
    btnLabel: "View Precautions",
  },
};

const LINK_MAP = {
  scan: "/",
  market: "/market",
  weather: "/weather",
  critical: "/",
};

export default function AlertCard({ alert, index }) {
  const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.critical;
  const Icon = cfg.Icon;

  const timeAgo = alert.created_date
    ? formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })
    : "";

  const destination = alert.linked_screen || LINK_MAP[alert.type] || "/";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`glass-card-interactive border-l-4 ${cfg.border} overflow-hidden ${!alert.read ? "ring-2 ring-emerald-500/40" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md ${cfg.iconBg}`}>
            <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider ${cfg.badge}`}>{cfg.badgeLabel}</span>
              {!alert.read && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />}
              <span className="text-xs text-slate-400 dark:text-slate-400 ml-auto">{timeAgo}</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{alert.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{alert.body}</p>
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <Link
            to={destination}
            className={`flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-200 ${cfg.btnClass}`}
          >
            {cfg.btnLabel} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
