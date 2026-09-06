import { motion } from "framer-motion";
import { Bell, TrendingUp, TrendingDown, Minus } from "lucide-react";

const CROP_EMOJI = {
  Rice: "🌾", Wheat: "🌾", "Maize / Corn": "🌽", Corn: "🌽", Maize: "🌽", Tomato: "🍅", Potato: "🥔",
  Onion: "🧅", Cotton: "🌿", Sugarcane: "🎋", Coffee: "☕", Soybean: "🌱",
  Chickpea: "🫘", "Banana / Plantain": "🍌", Banana: "🍌", Mango: "🥭", Groundnut: "🥜",
  "Groundnut / Peanut": "🥜", Turmeric: "💛", Pepper: "🫑", "Pepper (Bell/Chili)": "🫑",
  Coconut: "🥥", Apple: "🍎", Millet: "🌾", default: "🌿"
};

const BENCHMARK_APMC_PRICES = {
  "Rice": { modal_price: 2180, min_price: 1950, max_price: 2420, change_pct: 1.4, unit: "quintal" },
  "Tomato": { modal_price: 1850, min_price: 1200, max_price: 2600, change_pct: 4.8, unit: "quintal" },
  "Potato": { modal_price: 1120, min_price: 880, max_price: 1420, change_pct: 0.5, unit: "quintal" },
  "Wheat": { modal_price: 2360, min_price: 2120, max_price: 2580, change_pct: -0.8, unit: "quintal" },
  "Onion": { modal_price: 1980, min_price: 1450, max_price: 2550, change_pct: -2.3, unit: "quintal" },
  "Cotton": { modal_price: 6890, min_price: 6250, max_price: 7450, change_pct: 1.1, unit: "quintal" },
  "Maize / Corn": { modal_price: 1870, min_price: 1680, max_price: 2080, change_pct: 2.1, unit: "quintal" },
  "Corn": { modal_price: 1870, min_price: 1680, max_price: 2080, change_pct: 2.1, unit: "quintal" },
  "Maize": { modal_price: 1870, min_price: 1680, max_price: 2080, change_pct: 2.1, unit: "quintal" },
  "Sugarcane": { modal_price: 345, min_price: 315, max_price: 375, change_pct: 0.0, unit: "quintal" },
  "Turmeric": { modal_price: 7850, min_price: 7250, max_price: 8450, change_pct: 2.5, unit: "quintal" },
  "Pepper (Bell/Chili)": { modal_price: 4550, min_price: 3850, max_price: 5250, change_pct: 3.2, unit: "quintal" },
  "Pepper": { modal_price: 4550, min_price: 3850, max_price: 5250, change_pct: 3.2, unit: "quintal" },
  "Banana / Plantain": { modal_price: 1620, min_price: 1220, max_price: 2020, change_pct: -1.2, unit: "quintal" },
  "Banana": { modal_price: 1620, min_price: 1220, max_price: 2020, change_pct: -1.2, unit: "quintal" },
  "Coconut": { modal_price: 2850, min_price: 2450, max_price: 3250, change_pct: 1.8, unit: "quintal" },
  "Groundnut / Peanut": { modal_price: 5950, min_price: 5350, max_price: 6450, change_pct: 1.8, unit: "quintal" },
  "Groundnut": { modal_price: 5950, min_price: 5350, max_price: 6450, change_pct: 1.8, unit: "quintal" },
  "Soybean": { modal_price: 4420, min_price: 4020, max_price: 4820, change_pct: 0.9, unit: "quintal" },
  "Chickpea": { modal_price: 5200, min_price: 4700, max_price: 5700, change_pct: 0.6, unit: "quintal" },
  "Apple": { modal_price: 8500, min_price: 7500, max_price: 9500, change_pct: -0.5, unit: "quintal" },
  "Millet": { modal_price: 2250, min_price: 2000, max_price: 2500, change_pct: 1.2, unit: "quintal" }
};

function resolveCropData(cropName, propPriceData, priceInfo) {
  const dict = propPriceData || priceInfo;
  if (dict && typeof dict === 'object') {
    if (dict.modal_price) return dict;
    if (dict[cropName]) return dict[cropName];
    const key = Object.keys(dict).find(k => k.toLowerCase().includes(cropName.toLowerCase()) || cropName.toLowerCase().includes(k.toLowerCase()));
    if (key && dict[key]) return dict[key];
  }
  return BENCHMARK_APMC_PRICES[cropName] || BENCHMARK_APMC_PRICES["Rice"];
}

export default function PriceCard({ crop, priceData: propPriceData, priceInfo, isSelected, onSelect, onSetAlert, index }) {
  const pData = resolveCropData(crop, propPriceData, priceInfo);
  const emoji = CROP_EMOJI[crop] || CROP_EMOJI.default;
  const price = pData.modal_price;
  const change = pData.change_pct !== undefined ? pData.change_pct : 1.4;
  const isEstimated = pData.estimated;

  const changeColor = change > 0 ? "text-emerald-800 bg-emerald-100/90 border-emerald-300" : change < 0 ? "text-rose-800 bg-rose-100/90 border-rose-300" : "text-gray-700 bg-gray-100 border-gray-300";
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05, duration: 0.25 }}
      onClick={() => onSelect?.(crop)}
      className={`bg-[#eefcf2] rounded-3xl p-5 shadow-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-green-500 ring-2 ring-green-400/40 bg-[#e2f9ea]"
          : "border-[#bbf7d0] hover:border-green-400"
      }`}
    >
      {isEstimated && (
        <div className="mb-2.5">
          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
            Estimated — verify locally
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/80 flex items-center justify-center border border-green-200 shadow-sm text-3xl p-2.5">
            {emoji}
          </div>
          <div>
            <h3 className="font-extrabold text-[#064e3b] text-lg tracking-tight">{crop}</h3>
            <p className="text-2xl font-extrabold text-[#047857] tracking-tight mt-0.5">
              ₹{price?.toLocaleString("en-IN")}
              <span className="text-xs font-bold text-gray-600 ml-1">/ {pData?.unit || "quintal"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border font-extrabold text-xs ${changeColor}`}>
            <ChangeIcon className="w-3.5 h-3.5" />
            <span>{change > 0 ? "+" : ""}{change?.toFixed(1)}%</span>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onSetAlert?.(crop, pData); }}
            className="w-9 h-9 rounded-2xl bg-white/90 hover:bg-green-100 flex items-center justify-center border border-green-300 text-green-800 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Bell className="w-4 h-4 text-[#047857]" />
          </button>
        </div>
      </div>

      {/* Min / Max / Modal Stats Bar */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-green-200/80 text-center">
        <div className="bg-white/70 p-2 rounded-2xl border border-green-200">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Min</p>
          <p className="text-sm font-extrabold text-[#064e3b] mt-0.5">₹{pData.min_price?.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white/70 p-2 rounded-2xl border border-green-200">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Max</p>
          <p className="text-sm font-extrabold text-[#064e3b] mt-0.5">₹{pData.max_price?.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-green-200/60 p-2 rounded-2xl border border-green-300">
          <p className="text-[10px] font-extrabold text-[#064e3b] uppercase tracking-wider">Modal</p>
          <p className="text-sm font-extrabold text-[#047857] mt-0.5">₹{price?.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </motion.div>
  );
}