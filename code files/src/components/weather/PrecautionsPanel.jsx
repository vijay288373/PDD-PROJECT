import { motion } from "framer-motion";
import { Zap, Calendar, Eye, Loader2 } from "lucide-react";
import ReadAloudButton from "@/components/ReadAloudButton";
import { useLang } from "@/lib/useLang.jsx";

const SECTIONS = [
  { key: "immediate", icon: Zap, label: "Immediate Actions", subtitle: "Do these within the next few hours", bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-100", iconColor: "text-red-600", dotColor: "bg-red-500", badgeColor: "bg-red-500" },
  { key: "this_week", icon: Calendar, label: "This Week", subtitle: "Plan and schedule for the coming days", bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", dotColor: "bg-amber-500", badgeColor: "bg-amber-500" },
  { key: "monitor", icon: Eye, label: "Monitor Closely", subtitle: "Keep an eye on these indicators", bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-100", iconColor: "text-blue-600", dotColor: "bg-blue-400", badgeColor: "bg-blue-400" },
];

export default function PrecautionsPanel({ cropImpact, analyzing }) {
  const { langCode } = useLang();

  if (analyzing) {
    return (
      <div className="p-6 flex flex-col items-center py-20">
        <Loader2 className="w-12 h-12 text-[#4ade80] animate-spin mb-4" />
        <p className="text-[#1a5c2a] font-semibold">Generating precautions...</p>
      </div>
    );
  }

  if (!cropImpact?.precautions) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-5xl mb-3">🛡️</p>
        <p className="text-gray-500 text-sm">Precautions will appear after weather analysis completes</p>
      </div>
    );
  }

  const allText = SECTIONS.flatMap(s => cropImpact.precautions[s.key] || []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#1a5c2a]">Today's Action Plan</h2>
          <p className="text-sm text-gray-500 mt-0.5">Based on current weather conditions</p>
        </div>
        <ReadAloudButton text={allText} />
      </div>

      <div className="flex flex-col gap-4">
        {SECTIONS.map((section, si) => {
          const SectionIcon = section.icon;
          const items = cropImpact.precautions[section.key] || [];
          if (!items.length) return null;
          return (
            <motion.div key={section.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.15 }} className={`${section.bg} border ${section.border} rounded-2xl p-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${section.iconBg} rounded-xl flex items-center justify-center`}>
                  <SectionIcon className={`w-5 h-5 ${section.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{section.label}</h3>
                  <p className="text-xs text-gray-500">{section.subtitle}</p>
                </div>
                <span className={`ml-auto ${section.badgeColor} text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold`}>{items.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.15 + i * 0.07 }} className="flex gap-3 bg-white/70 rounded-xl p-3">
                    <div className={`w-2 h-2 rounded-full ${section.dotColor} mt-1.5 flex-shrink-0`} />
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}