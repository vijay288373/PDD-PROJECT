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
      className="bg-white rounded-3xl shadow-sm border border-[#e8f5e9] mt-4 p-5 relative"
    >
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-[#1a5c2a] font-medium bg-[#e8f5e9] px-3 py-1.5 rounded-full"
      >
        <Pencil className="w-3 h-3" /> {t("profile_edit", langCode)}
      </button>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#1a5c2a] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">{getInitials(displayName)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {farmTypeLabel} · {statsLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}