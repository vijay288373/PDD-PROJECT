import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Leaf, CloudRain, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const TYPE_CONFIG = {
  critical: {
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "CRITICAL",
    Icon: AlertTriangle,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    btnClass: "bg-red-500 text-white",
    btnLabel: "Take Action",
  },
  market: {
    border: "border-l-amber-400",
    badge: "bg-amber-100 text-amber-700",
    badgeLabel: "MARKET",
    Icon: TrendingUp,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    btnClass: "bg-amber-500 text-white",
    btnLabel: "View Market",
  },
  scan: {
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-700",
    badgeLabel: "SCAN",
    Icon: Leaf,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    btnClass: "bg-green-600 text-white",
    btnLabel: "View Result",
  },
  weather: {
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700",
    badgeLabel: "WEATHER",
    Icon: CloudRain,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    btnClass: "bg-blue-500 text-white",
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${cfg.border} overflow-hidden ${!alert.read ? "ring-1 ring-[#4ade80]/30" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
            <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.badgeLabel}</span>
              {!alert.read && <span className="w-2 h-2 rounded-full bg-[#4ade80] flex-shrink-0" />}
              <span className="text-xs text-gray-400 ml-auto">{timeAgo}</span>
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-snug">{alert.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.body}</p>
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <Link
            to={destination}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.btnClass}`}
          >
            {cfg.btnLabel} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
