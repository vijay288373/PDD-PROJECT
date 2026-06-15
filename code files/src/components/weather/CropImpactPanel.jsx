import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const RISK_CONFIG = {
  low: { color: "bg-green-100 text-green-700 border-green-200", bar: "bg-green-500", icon: CheckCircle, label: "Low Risk" },
  medium: { color: "bg-amber-100 text-amber-700 border-amber-200", bar: "bg-amber-500", icon: AlertTriangle, label: "Medium Risk" },
  high: { color: "bg-orange-100 text-orange-700 border-orange-200", bar: "bg-orange-500", icon: AlertTriangle, label: "High Risk" },
  critical: { color: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500", icon: AlertTriangle, label: "Critical!" },
};

const OVERALL_BG = {
  low: "from-green-500 to-emerald-600",
  medium: "from-amber-500 to-orange-500",
  high: "from-orange-500 to-red-500",
  critical: "from-red-600 to-red-800",
};

function IrrigationBadge({ change, pct }) {
  if (change === "increase") return (
    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs border border-blue-100">
      <TrendingUp className="w-3 h-3" /> +{pct}% water
    </span>
  );
  if (change === "decrease") return (
    <span className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full text-xs border border-teal-100">
      <TrendingDown className="w-3 h-3" /> -{pct}% water
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full text-xs border border-gray-100">
      <Minus className="w-3 h-3" /> Maintain
    </span>
  );
}

export default function CropImpactPanel({ cropImpact, analyzing, userProfile }) {
  if (analyzing) {
    return (
      <div className="p-6 flex flex-col items-center py-20">
        <Loader2 className="w-12 h-12 text-[#4ade80] animate-spin mb-4" />
        <p className="text-[#1a5c2a] font-semibold">Analyzing crop impacts...</p>
        <p className="text-gray-500 text-sm mt-1">Consulting AI agronomist</p>
      </div>
    );
  }

  if (!cropImpact) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-5xl mb-3">🌾</p>
        {userProfile?.primary_crops?.length ? (
          <p className="text-gray-500 text-sm">Weather data loading — crop analysis will appear here</p>
        ) : (
          <p className="text-gray-500 text-sm">Complete your farmer profile to see crop-specific weather impacts</p>
        )}
      </div>
    );
  }

  const overallRisk = cropImpact.overall_risk || "low";
  const bgGradient = OVERALL_BG[overallRisk] || OVERALL_BG.low;

  return (
    <div className="p-4">
      {/* Overall risk banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r ${bgGradient} rounded-2xl p-4 mb-5 text-white shadow-lg`}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/80">Overall Farm Risk</p>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{overallRisk}</span>
        </div>
        <p className="text-white text-sm leading-relaxed">{cropImpact.summary}</p>
      </motion.div>

      {/* Per-crop cards */}
      <h3 className="text-base font-bold text-[#1a5c2a] mb-3">Crop-by-Crop Analysis</h3>
      <div className="flex flex-col gap-4">
        {(cropImpact.crop_impacts || []).map((crop, i) => {
          const risk = RISK_CONFIG[crop.risk_level] || RISK_CONFIG.low;
          const RiskIcon = risk.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{crop.crop}</h4>
                  <p className="text-sm text-gray-500 mt-0.5 leading-snug">{crop.impact_summary}</p>
                </div>
                <span className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${risk.color}`}>
                  <RiskIcon className="w-3 h-3" /> {risk.label}
                </span>
              </div>

              {/* Irrigation badge */}
              <div className="mb-3">
                <IrrigationBadge change={crop.irrigation_change} pct={crop.irrigation_pct} />
              </div>

              {/* Immediate actions */}
              {crop.immediate_actions?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">⚡ Immediate Actions</p>
                  {crop.immediate_actions.map((action, j) => (
                    <div key={j} className="flex gap-2 text-xs text-gray-700 mb-1">
                      <span className="text-[#4ade80] font-bold flex-shrink-0">→</span>
                      {action}
                    </div>
                  ))}
                </div>
              )}

              {/* Best activities */}
              {crop.best_activities?.length > 0 && (
                <div className="bg-[#f0faf2] rounded-xl p-2.5">
                  <p className="text-xs font-semibold text-[#1a5c2a] mb-1">✅ Best activities today</p>
                  {crop.best_activities.map((act, j) => (
                    <p key={j} className="text-xs text-gray-600">• {act}</p>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}