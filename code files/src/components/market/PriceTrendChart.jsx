import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

const RANGE_LABELS = { "7": "7 Days", "30": "30 Days", "90": "90 Days" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const isForecast = payload.find(pp => pp.dataKey === "forecast")?.value;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#e8f5e9] p-3 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      {p?.value && <p className="font-bold text-[#1a5c2a]">₹{p.value.toLocaleString("en-IN")}</p>}
      {isForecast && <p className="text-blue-500 font-semibold">Forecast: ₹{isForecast.toLocaleString("en-IN")}</p>}
    </div>
  );
};

export default function PriceTrendChart({ crop, trendData, loading }) {
  const [range, setRange] = useState("30");

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!trendData?.historical?.length) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9] text-center py-8 text-gray-400 text-sm">
        Select a crop to view price trend
      </div>
    );
  }

  const days = parseInt(range);
  const historical = trendData.historical.slice(-days);
  const forecast = trendData.forecast || [];

  // Merge: historical + dashed forecast
  const chartData = [
    ...historical.map(d => ({ date: d.date, price: d.price })),
    ...forecast.map(d => ({ date: d.date, forecast: d.price })),
  ];

  // Find where forecast starts
  const forecastStartDate = forecast[0]?.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">Price Trend</p>
          <p className="font-bold text-[#1a5c2a] text-sm">{crop}</p>
        </div>
        <div className="flex gap-1">
          {Object.entries(RANGE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                range === key ? "bg-[#1a5c2a] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          {forecastStartDate && (
            <ReferenceLine x={forecastStartDate} stroke="#6366f1" strokeDasharray="4 2" label={{ value: "Forecast", fontSize: 9, fill: "#6366f1" }} />
          )}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1a5c2a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#4ade80" }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-[#1a5c2a] rounded" />
          <span className="text-xs text-gray-500">Historical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-indigo-500 rounded border-dashed" style={{ borderTop: "2px dashed #6366f1", background: "none" }} />
          <span className="text-xs text-gray-500">AI Forecast</span>
        </div>
      </div>
    </motion.div>
  );
}