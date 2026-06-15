import { motion } from "framer-motion";
import { MapPin, Calendar, Zap, Loader2 } from "lucide-react";
import ReadAloudButton from "@/components/ReadAloudButton";

const REC_CONFIG = {
  SELL: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", emoji: "💰" },
  HOLD: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", emoji: "⏳" },
  WAIT: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", emoji: "🔮" },
};

const FACTOR_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
];

export default function AIPriceForecast({ forecast, loading, crop }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8f5e9] flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="w-8 h-8 text-[#4ade80] animate-spin" />
        <p className="text-gray-500 text-sm">AI analyzing {crop} market...</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8f5e9] text-center py-8">
        <Zap className="w-8 h-8 text-gray-200 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Select a crop for AI market forecast</p>
      </div>
    );
  }

  const rec = REC_CONFIG[forecast.recommendation] || REC_CONFIG.HOLD;

  const readText = [
    forecast.recommendation,
    forecast.recommendation_reason,
    forecast.best_sell_window ? `Best sell window: ${forecast.best_sell_window.dates}. ${forecast.best_sell_window.reason}` : "",
    ...(forecast.price_factors || []),
  ].filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Recommendation badge */}
      <div className={`rounded-2xl p-4 border-2 ${rec.bg} ${rec.border}`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{rec.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-2xl font-black ${rec.text}`}>{forecast.recommendation}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${rec.bg} ${rec.border} ${rec.text} font-medium`}>
                AI Recommendation
              </span>
              <ReadAloudButton text={readText} />
            </div>
            <p className={`text-sm mt-0.5 ${rec.text} opacity-80`}>{forecast.recommendation_reason}</p>
          </div>
        </div>
      </div>

      {/* Best sell window */}
      {forecast.best_sell_window && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#1a5c2a]" />
            <p className="font-semibold text-[#1a5c2a] text-sm">Best Sell Window</p>
          </div>
          <p className="text-base font-bold text-gray-800">{forecast.best_sell_window.dates}</p>
          <p className="text-xs text-gray-500 mt-1">{forecast.best_sell_window.reason}</p>
        </div>
      )}

      {/* 3 scenarios */}
      {forecast.scenarios && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]">
          <p className="font-semibold text-gray-700 text-sm mb-3">7-Day Price Scenarios</p>
          <div className="space-y-2.5">
            {[
              { label: "Optimistic", key: "optimistic", color: "bg-green-500", textColor: "text-green-700" },
              { label: "Likely", key: "likely", color: "bg-blue-500", textColor: "text-blue-700" },
              { label: "Pessimistic", key: "pessimistic", color: "bg-red-400", textColor: "text-red-600" },
            ].map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <span className={`text-xs font-medium ${s.textColor} w-20 flex-shrink-0`}>{s.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${s.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((forecast.scenarios[s.key] || 0) / (forecast.scenarios.optimistic * 1.1)) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className={`text-xs font-bold ${s.textColor} w-20 text-right flex-shrink-0`}>
                  ₹{forecast.scenarios[s.key]?.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factor chips */}
      {forecast.price_factors?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]">
          <p className="font-semibold text-gray-700 text-sm mb-2">Key Price Drivers</p>
          <div className="flex flex-wrap gap-2">
            {forecast.price_factors.map((factor, i) => (
              <span key={i} className={`text-xs px-3 py-1.5 rounded-full font-medium ${FACTOR_COLORS[i % FACTOR_COLORS.length]}`}>
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nearby markets */}
      {forecast.nearby_markets?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#1a5c2a]" />
            <p className="font-semibold text-gray-700 text-sm">Nearby Better Markets</p>
          </div>
          <div className="space-y-2">
            {forecast.nearby_markets.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-[#f0faf2] rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.market_name}</p>
                  <p className="text-xs text-gray-400">{m.distance || ""}</p>
                </div>
                <div className={`text-sm font-bold ${m.price_diff > 0 ? "text-green-600" : "text-red-500"}`}>
                  {m.price_diff > 0 ? "+" : ""}₹{m.price_diff?.toLocaleString("en-IN")} / quintal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}