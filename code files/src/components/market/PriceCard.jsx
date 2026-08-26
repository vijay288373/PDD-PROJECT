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

  const changeColor = change > 0 ? "text-emerald-500" : change < 0 ? "text-rose-500" : "text-slate-400";
  const changeBg = change > 0 ? "bg-emerald-500/10 border-emerald-500/20" : change < 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-500/10 border-slate-500/20";
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onSelect(crop)}
      className={`glass-card-interactive p-4 border-2 cursor-pointer ${
        isSelected
          ? "border-emerald-400 shadow-lg shadow-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/60"
          : "border-white/40 dark:border-emerald-500/20"
      }`}
    >
      {isEstimated && (
        <div className="mb-2">
          <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Estimated — verify locally
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-emerald-900/40 backdrop-blur-md flex items-center justify-center border border-white/60 dark:border-emerald-500/30 shadow-sm text-2xl">
            {emoji}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">{crop}</p>
            {price ? (
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight mt-0.5">
                ₹{price?.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-400 dark:text-slate-400 ml-1">/ {priceData?.unit || "quintal"}</span>
              </p>
            ) : (
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mt-1" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {change !== undefined && change !== null ? (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border backdrop-blur-md ${changeBg}`}>
              <ChangeIcon className={`w-3.5 h-3.5 ${changeColor}`} />
              <span className={`text-xs font-bold ${changeColor}`}>
                {change > 0 ? "+" : ""}{change?.toFixed(1)}%
              </span>
            </div>
          ) : null}
          <button
            onClick={e => { e.stopPropagation(); onSetAlert(crop, priceData); }}
            className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 flex items-center justify-center border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 transition-all duration-200 active:scale-95"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Min / Max / Modal stats */}
      {priceData?.min_price && (
        <div className="mt-3.5 grid grid-cols-3 gap-1 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          {[
            { label: "Min", val: priceData.min_price },
            { label: "Max", val: priceData.max_price },
            { label: "Modal", val: priceData.modal_price },
          ].map(s => (
            <div key={s.label} className="text-center bg-white/40 dark:bg-slate-900/40 rounded-lg py-1 backdrop-blur-xs">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400">{s.label}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">₹{s.val?.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}