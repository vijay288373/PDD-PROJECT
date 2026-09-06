import { motion } from "framer-motion";
import { MapPin, Calendar, Loader2 } from "lucide-react";
import ReadAloudButton from "@/components/ReadAloudButton";

const REC_CONFIG = {
  SELL: { bg: "bg-green-100", text: "text-green-900", border: "border-green-300", emoji: "💰" },
  HOLD: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300", emoji: "⏳" },
  WAIT: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300", emoji: "🔮" },
};

const FACTOR_COLORS = [
  "bg-purple-100 text-purple-800 border border-purple-200",
  "bg-orange-100 text-orange-800 border border-orange-200",
  "bg-teal-100 text-teal-800 border border-teal-200",
  "bg-pink-100 text-pink-800 border border-pink-200",
];

const CROP_AI_DATABASE = {
  Rice: {
    recommendation: "SELL",
    recommendation_reason: "Procurement demand from regional rice mills is strong with current mandi prices up +4.2%.",
    best_sell_window: { dates: "Next 3-5 days", reason: "Fresh harvest arrivals from neighboring districts expected to peak next week." },
    scenarios: { optimistic: 2400, likely: 2250, pessimistic: 2050 },
    price_factors: ["High mill procurement demand", "Optimal grain moisture levels", "Tight inter-state supply"],
    nearby_markets: [
      { market_name: "Kanchipuram Main APMC", distance: "24 km", price_diff: 85 },
      { market_name: "Tiruvallur District Mandi", distance: "38 km", price_diff: 50 }
    ]
  },
  Tomato: {
    recommendation: "SELL",
    recommendation_reason: "Prices are up +4.8% today due to temporary supply shortages in neighboring districts.",
    best_sell_window: { dates: "Immediate (Next 48 hours)", reason: "Perishable crop — capitalize on current ₹1,850/q modal price before fresh arrivals." },
    scenarios: { optimistic: 2200, likely: 1850, pessimistic: 1400 },
    price_factors: ["High daily urban consumption", "Rainfall transport delays", "Low cold-storage stocks"],
    nearby_markets: [
      { market_name: "Koyambedu Wholesale Market", distance: "12 km", price_diff: 120 },
      { market_name: "Chengalpattu Mandi", distance: "45 km", price_diff: -30 }
    ]
  },
  Potato: {
    recommendation: "HOLD",
    recommendation_reason: "Cold storage release is steady; processing unit demand projected to gain +3-5% over next 2 weeks.",
    best_sell_window: { dates: "In 10-14 days", reason: "Snack manufacturing units opening bulk purchase tenders." },
    scenarios: { optimistic: 1350, likely: 1150, pessimistic: 950 },
    price_factors: ["Steady cold storage release", "Snack unit bulk tenders", "Stable logistics costs"],
    nearby_markets: [
      { market_name: "Vellore APMC Market", distance: "65 km", price_diff: 60 },
      { market_name: "Koyambedu Market", distance: "12 km", price_diff: 40 }
    ]
  },
  Wheat: {
    recommendation: "WAIT",
    recommendation_reason: "Government minimum support price (MSP) revision policy announcement expected next week.",
    best_sell_window: { dates: "In 2-3 weeks", reason: "Wholesale prices projected to rally post policy clarification." },
    scenarios: { optimistic: 2650, likely: 2400, pessimistic: 2200 },
    price_factors: ["Upcoming MSP announcement", "Flour mill buffer stocking", "Global grain export trends"],
    nearby_markets: [
      { market_name: "Salem Central Mandi", distance: "120 km", price_diff: 90 },
      { market_name: "Erode Market Yard", distance: "140 km", price_diff: 75 }
    ]
  },
  Cotton: {
    recommendation: "SELL",
    recommendation_reason: "Global textile export demand is firm; current price of ₹6,850/q is near seasonal highs.",
    best_sell_window: { dates: "Next 7 days", reason: "Spinning mills actively procuring long-staple varieties." },
    scenarios: { optimistic: 7500, likely: 7000, pessimistic: 6400 },
    price_factors: ["Textile mill export orders", "High lint quality grade", "International futures rally"],
    nearby_markets: [
      { market_name: "Coimbatore Cotton Market", distance: "180 km", price_diff: 180 },
      { market_name: "Tirupur Spinning Hub", distance: "160 km", price_diff: 150 }
    ]
  },
  Onion: {
    recommendation: "HOLD",
    recommendation_reason: "Storage crop condition is good; export quota expansion anticipated next fortnight.",
    best_sell_window: { dates: "In 12-18 days", reason: "Export relaxation will trigger +8-10% price jump in major mandis." },
    scenarios: { optimistic: 2500, likely: 2100, pessimistic: 1700 },
    price_factors: ["Anticipated export quota easing", "Low storage decay rate", "High hotel sector demand"],
    nearby_markets: [
      { market_name: "Dindigul Onion Mandi", distance: "210 km", price_diff: 110 },
      { market_name: "Koyambedu Market", distance: "12 km", price_diff: 45 }
    ]
  },
  Sugarcane: {
    recommendation: "HOLD",
    recommendation_reason: "Cooperative sugar mill crushing season is in full swing with guaranteed FRP payouts.",
    best_sell_window: { dates: "Within 10 days of mill token issue", reason: "Optimal sucrose recovery rate maximizes recovery bonus." },
    scenarios: { optimistic: 380, likely: 350, pessimistic: 320 },
    price_factors: ["High sugar recovery percentage", "State FRP price support", "Distillery ethanol tenders"],
    nearby_markets: [
      { market_name: "Chengalpattu Co-op Sugar Mill", distance: "35 km", price_diff: 15 },
      { market_name: "Vellore Sugar Complex", distance: "70 km", price_diff: 10 }
    ]
  },
  "Maize / Corn": {
    recommendation: "SELL",
    recommendation_reason: "Poultry feed manufacturers actively bidding up dry maize lots (+2.1%).",
    best_sell_window: { dates: "Next 4-6 days", reason: "Feed mill monthly buying cycle concludes next week." },
    scenarios: { optimistic: 2100, likely: 1900, pessimistic: 1700 },
    price_factors: ["Poultry feed mill demand", "Low grain moisture (<14%)", "Starch industry orders"],
    nearby_markets: [
      { market_name: "Namakkal Poultry Hub Mandi", distance: "190 km", price_diff: 140 },
      { market_name: "Erode Feed Market", distance: "150 km", price_diff: 95 }
    ]
  },
  Turmeric: {
    recommendation: "HOLD",
    recommendation_reason: "Erode turmeric auction prices showing consistent upward momentum (+2.5%).",
    best_sell_window: { dates: "In 15-20 days", reason: "Curcumin-rich finger varieties fetching peak premium prices." },
    scenarios: { optimistic: 8600, likely: 7900, pessimistic: 7100 },
    price_factors: ["High curcumin content demand", "Pharma export orders", "Low arrivals in Erode mandi"],
    nearby_markets: [
      { market_name: "Erode Turmeric Market Yard", distance: "155 km", price_diff: 250 },
      { market_name: "Salem Spice Mandi", distance: "125 km", price_diff: 180 }
    ]
  }
};

export default function AIPriceForecast({ forecast: propForecast, forecastData, loading, crop }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-gray-500 text-sm font-semibold">AI analyzing {crop || "crop"} market...</p>
      </div>
    );
  }

  const cropName = crop || "Rice";
  const data = propForecast || forecastData || CROP_AI_DATABASE[cropName] || CROP_AI_DATABASE.Rice;
  const recType = data?.recommendation || "SELL";
  const rec = REC_CONFIG[recType] || REC_CONFIG.SELL;

  const readText = [
    `Recommendation: ${recType}`,
    data.recommendation_reason,
    data.best_sell_window ? `Best sell window: ${data.best_sell_window.dates}. ${data.best_sell_window.reason}` : "",
    ...(data.price_factors || []),
  ].filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Recommendation Card */}
      <div className={`rounded-3xl p-5 border-2 ${rec.bg} ${rec.border} shadow-md`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{rec.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`text-3xl font-extrabold tracking-wider ${rec.text}`}>{recType}</span>
              <span className={`text-xs px-3 py-1 rounded-full border ${rec.bg} ${rec.border} ${rec.text} font-extrabold shadow-xs`}>
                AI Recommendation for {cropName}
              </span>
              <ReadAloudButton text={readText} />
            </div>
            <p className={`text-sm mt-2 ${rec.text} font-semibold leading-relaxed`}>
              {data.recommendation_reason}
            </p>
          </div>
        </div>
      </div>

      {/* Best Sell Window */}
      {data.best_sell_window && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#1a5c2a]" />
            <p className="font-extrabold text-[#1a5c2a] text-sm">Best Sell Window</p>
          </div>
          <p className="text-base font-extrabold text-gray-900">{data.best_sell_window.dates}</p>
          <p className="text-xs text-gray-600 mt-1 font-semibold">{data.best_sell_window.reason}</p>
        </div>
      )}

      {/* 3 Price Scenarios */}
      {data.scenarios && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="font-extrabold text-gray-800 text-sm mb-3">7-Day Price Scenarios (₹/quintal)</p>
          <div className="space-y-3">
            {[
              { label: "Optimistic", key: "optimistic", color: "bg-green-500", textColor: "text-green-700" },
              { label: "Likely", key: "likely", color: "bg-blue-500", textColor: "text-blue-700" },
              { label: "Pessimistic", key: "pessimistic", color: "bg-red-400", textColor: "text-red-600" },
            ].map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <span className={`text-xs font-bold ${s.textColor} w-22 flex-shrink-0`}>{s.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    className={`h-2.5 rounded-full ${s.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((data.scenarios[s.key] || 0) / (data.scenarios.optimistic * 1.1)) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className={`text-xs font-extrabold ${s.textColor} w-20 text-right flex-shrink-0`}>
                  ₹{data.scenarios[s.key]?.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Drivers */}
      {data.price_factors?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="font-extrabold text-gray-800 text-sm mb-2">Key Price Drivers</p>
          <div className="flex flex-wrap gap-2">
            {data.price_factors.map((factor, i) => (
              <span key={i} className={`text-xs px-3 py-1.5 rounded-full font-bold ${FACTOR_COLORS[i % FACTOR_COLORS.length]}`}>
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Higher Markets */}
      {data.nearby_markets?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#1a5c2a]" />
            <p className="font-extrabold text-gray-800 text-sm">Nearby Higher Mandis</p>
          </div>
          <div className="space-y-2">
            {data.nearby_markets.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-[#f0faf2] rounded-xl px-3.5 py-2.5 border border-green-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{m.market_name}</p>
                  <p className="text-xs text-gray-500 font-semibold">{m.distance || ""}</p>
                </div>
                <div className={`text-sm font-extrabold ${m.price_diff > 0 ? "text-green-700" : "text-red-600"}`}>
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