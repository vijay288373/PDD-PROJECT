import { motion } from "framer-motion";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";

export default function FarmStatsGrid({ profile, user }) {
  const { langCode } = useLang();
  const farmSize = profile?.farm_size
    ? `${profile.farm_size} ${t("profile_" + (profile.farm_size_unit || "acres"), langCode)}`
    : "—";
  const region = profile?.region || profile?.country || "—";
  const cropCount = profile?.primary_crops?.length ?? 0;
  const memberSince = user?.created_date
    ? new Date(user.created_date).getFullYear()
    : "—";

  const stats = [
    { emoji: "🌾", label: t("lbl_farm_size", langCode), value: farmSize },
    { emoji: "📍", label: t("lbl_region", langCode), value: region },
    { emoji: "🌿", label: t("profile_my_crops", langCode), value: cropCount },
    { emoji: "📅", label: t("profile_member_since", langCode), value: memberSince },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]"
        >
          <p className="text-2xl mb-1">{stat.emoji}</p>
          <p className="text-xs text-gray-400">{stat.label}</p>
          <p className="font-bold text-gray-800 capitalize mt-0.5 truncate">{String(stat.value)}</p>
        </motion.div>
      ))}
    </div>
  );
}