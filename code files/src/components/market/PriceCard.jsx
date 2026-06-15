import { motion } from "framer-motion";
import { Bell, TrendingUp, TrendingDown, Minus } from "lucide-react";

const CROP_EMOJI = {
  Rice: "🌾", Wheat: "🌾", "Maize / Corn": "🌽", Tomato: "🍅", Potato: "🥔",
  Onion: "🧅", Cotton: "🌿", Sugarcane: "🎋", Coffee: "☕", Soybean: "🌱",
  Chickpea: "🫘", "Banana / Plantain": "🍌", Mango: "🥭", Groundnut: "🥜",
  "Groundnut / Peanut": "🥜", Sorghum: "🌾", Millet: "🌾", Barley: "🌾",
  default: "🌿"
};

export default function PriceCard({ crop, priceData, isSelected, onSelect, onSetAlert, index }) {
  const emoji = CROP_EMOJI[crop] || CROP_EMOJI.default;
  const price = priceData?.modal_price;
  const change = priceData?.change_pct;
  const isEstimated = priceData?.estimated;

  const changeColor = change > 0 ? "text-green-600" : change < 0 ? "text-red-500" : "text-gray-400";
  const changeBg = change > 0 ? "bg-green-50" : change < 0 ? "bg-red-50" : "bg-gray-50";
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => onSelect(crop)}
      className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all ${
        isSelected ? "border-[#4ade80] shadow-md shadow-[#4ade80]/20" : "border-[#e8f5e9] hover:border-[#4caf50]"
      }`}
    >
      {isEstimated && (
        <div className="mb-2">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Estimated — verify locally</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{crop}</p>
            {price ? (
              <p className="text-xl font-bold text-[#1a5c2a]">
                ₹{price?.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-gray-400 ml-1">/ {priceData?.unit || "quintal"}</span>
              </p>
            ) : (
              <div className="h-6 w-24 bg-gray-100 rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {change !== undefined && change !== null ? (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${changeBg}`}>
              <ChangeIcon className={`w-3 h-3 ${changeColor}`} />
              <span className={`text-xs font-semibold ${changeColor}`}>
                {change > 0 ? "+" : ""}{change?.toFixed(1)}%
              </span>
            </div>
          ) : null}
          <button
            onClick={e => { e.stopPropagation(); onSetAlert(crop, priceData); }}
            className="w-8 h-8 rounded-full bg-[#f0faf2] flex items-center justify-center border border-[#c8e6c9] hover:bg-[#4ade80]/20 transition-colors"
          >
            <Bell className="w-4 h-4 text-[#1a5c2a]" />
          </button>
        </div>
      </div>

      {/* Min / Max / Modal stats */}
      {priceData?.min_price && (
        <div className="mt-3 grid grid-cols-3 gap-1 pt-3 border-t border-gray-50">
          {[
            { label: "Min", val: priceData.min_price },
            { label: "Max", val: priceData.max_price },
            { label: "Modal", val: priceData.modal_price },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xs font-bold text-gray-700">₹{s.val?.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}