import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileHeader({ user, profile, scanCount, onEdit }) {
  const { langCode } = useLang();
  const displayName = user?.full_name || profile?.name || t("profile_farmer", langCode);
  
  const farmTypeKey = profile?.farming_type || "smallholder";
  const farmTypeLabel = t("profile_" + farmTypeKey, langCode);

  const statsLabel = scanCount === 1
    ? t("profile_scans_singular", langCode).replace("{scans}", scanCount)
    : t("profile_stats", langCode).replace("{scans}", scanCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mt-4 p-6 relative border-emerald-500/20 shadow-xl overflow-hidden"
    >
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-1.5 rounded-full border border-emerald-500/30 transition-all duration-200 active:scale-95 shadow-xs"
      >
        <Pencil className="w-3.5 h-3.5" /> {t("profile_edit", langCode)}
      </button>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30 border border-white/40">
          <span className="text-white text-2xl font-black">{getInitials(displayName)}</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{displayName}</h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {farmTypeLabel} · {statsLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}