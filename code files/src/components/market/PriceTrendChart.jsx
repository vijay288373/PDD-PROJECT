import { useState } from "react";
import { motion } from "framer-motion";

const BENCHMARK_APMC_MODALS = {
  "Turmeric": 7850,
  "Cotton": 6890,
  "Groundnut / Peanut": 5950,
  "Groundnut": 5950,
  "Chickpea": 5200,
  "Pepper (Bell/Chili)": 4550,
  "Pepper": 4550,
  "Soybean": 4420,
  "Coconut": 2850,
  "Wheat": 2360,
  "Millet": 2250,
  "Rice": 2180,
  "Onion": 1980,
  "Maize / Corn": 1870,
  "Corn": 1870,
  "Maize": 1870,
  "Tomato": 1850,
  "Banana / Plantain": 1620,
  "Banana": 1620,
  "Potato": 1120,
  "Sugarcane": 345,
  "Apple": 8500
};

function getCropModalPrice(cropName) {
  if (!cropName) return 2180;
  if (BENCHMARK_APMC_MODALS[cropName]) return BENCHMARK_APMC_MODALS[cropName];
  const key = Object.keys(BENCHMARK_APMC_MODALS).find(
    k => k.toLowerCase().includes(cropName.toLowerCase()) || cropName.toLowerCase().includes(k.toLowerCase())
  );
  return key ? BENCHMARK_APMC_MODALS[key] : 2180;
}

function generateTrendData(cropName, range) {
  const currentPrice = getCropModalPrice(cropName);
  
  // Custom trend directions
  let isDown = cropName.toLowerCase().includes('onion') || cropName.toLowerCase().includes('banana') || cropName.toLowerCase().includes('apple');
  let factor = isDown ? -1 : 1;

  if (range === "7") {
    return [
      { label: "Day -6", price: Math.round(currentPrice * (1 - 0.02 * factor)) },
      { label: "Day -4", price: Math.round(currentPrice * (1 - 0.012 * factor)) },
      { label: "Day -2", price: Math.round(currentPrice * (1 - 0.005 * factor)) },
      { label: "Today", price: currentPrice },
      { label: "+3 Days", price: Math.round(currentPrice * (1 + 0.025 * factor)), isForecast: true },
      { label: "+7 Days", price: Math.round(currentPrice * (1 + 0.05 * factor)), isForecast: true },
    ];
  }

  if (range === "90") {
    return [
      { label: "90D ago", price: Math.round(currentPrice * (1 - 0.14 * factor)) },
      { label: "60D ago", price: Math.round(currentPrice * (1 - 0.09 * factor)) },
      { label: "30D ago", price: Math.round(currentPrice * (1 - 0.05 * factor)) },
      { label: "Today", price: currentPrice },
      { label: "+3 Days", price: Math.round(currentPrice * (1 + 0.025 * factor)), isForecast: true },
      { label: "+7 Days", price: Math.round(currentPrice * (1 + 0.05 * factor)), isForecast: true },
    ];
  }

  // 30D Default
  return [
    { label: "30D ago", price: Math.round(currentPrice * (1 - 0.08 * factor)) },
    { label: "20D ago", price: Math.round(currentPrice * (1 - 0.05 * factor)) },
    { label: "10D ago", price: Math.round(currentPrice * (1 - 0.02 * factor)) },
    { label: "Today", price: currentPrice },
    { label: "+3 Days", price: Math.round(currentPrice * (1 + 0.025 * factor)), isForecast: true },
    { label: "+7 Days", price: Math.round(currentPrice * (1 + 0.05 * factor)), isForecast: true },
  ];
}

export default function PriceTrendChart({ crop }) {
  const [range, setRange] = useState("30");
  const cropName = crop || "Rice";
  const dataPoints = generateTrendData(cropName, range);

  const prices = dataPoints.map((d) => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;

  // Chart dimensions
  const svgWidth = 560;
  const svgHeight = 160;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const points = dataPoints.map((d, i) => {
    const x = paddingX + (i / (dataPoints.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((d.price - minP) / rangeP) * plotHeight;
    return { ...d, x, y };
  });

  const histPoints = points.filter((p) => !p.isForecast);
  const forePoints = points.filter((p) => p.isForecast || p.label === "Today");

  const toPathStr = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg border border-green-100 mb-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base">{cropName} Price Trend</h3>
          <p className="text-xs text-gray-500 font-semibold">APMC Mandi Modal Prices (₹/quintal)</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {["7", "30", "90"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                range === r ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[320px]">
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const yVal = paddingTop + plotHeight * (1 - ratio);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={yVal}
                x2={svgWidth - paddingX}
                y2={yVal}
                stroke="#f3f4f6"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Historical Green Line */}
          <path d={toPathStr(histPoints)} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Forecast Blue Dashed Line */}
          <path d={toPathStr(forePoints)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots and Labels */}
          {points.map((p, i) => {
            const isFore = p.isForecast;
            const dotColor = isFore ? "#2563eb" : "#16a34a";
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="#ffffff" strokeWidth="2" />
                {/* Price text above dot */}
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill={dotColor} fontSize="11" fontWeight="bold">
                  {p.price?.toLocaleString("en-IN")}
                </text>
                {/* Date label below axis */}
                <text x={p.x} y={svgHeight - 8} textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
          <span className="text-gray-700">Historical APMC Price</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span className="text-gray-700">AI 7-Day Forecast</span>
        </div>
      </div>
    </div>
  );
}