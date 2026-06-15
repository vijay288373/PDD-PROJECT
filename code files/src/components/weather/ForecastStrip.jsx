import { motion } from "framer-motion";

const CONDITION_EMOJI = {
  sunny: "☀️",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  foggy: "🌫️",
  windy: "💨",
};

function getRainImpact(rainProb) {
  if (rainProb >= 70) return { color: "bg-red-100 text-red-600 border-red-200", label: "High Risk" };
  if (rainProb >= 40) return { color: "bg-amber-100 text-amber-600 border-amber-200", label: "Moderate" };
  return { color: "bg-green-100 text-green-600 border-green-200", label: "Good" };
}

export default function ForecastStrip({ forecast, loading }) {
  if (loading) {
    return (
      <div className="pt-4">
        <h3 className="text-base font-bold text-[#1a5c2a] mb-3">7-Day Forecast</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-36 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!forecast.length) return null;

  return (
    <div className="pt-4">
      <h3 className="text-base font-bold text-[#1a5c2a] mb-3">7-Day Forecast</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {forecast.map((day, i) => {
          const impact = getRainImpact(day.rain_prob || 0);
          const isToday = i === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex-shrink-0 w-24 rounded-2xl p-3 flex flex-col items-center gap-2 border ${
                isToday
                  ? "bg-[#1a5c2a] border-[#1a5c2a] shadow-lg"
                  : "bg-white border-[#e8f5e9] shadow-sm"
              }`}
            >
              <p className={`text-xs font-semibold ${isToday ? "text-[#4ade80]" : "text-gray-500"}`}>
                {isToday ? "Today" : day.day}
              </p>
              <span className="text-3xl">{CONDITION_EMOJI[day.condition] || "🌤️"}</span>
              <div className="text-center">
                <p className={`text-sm font-bold ${isToday ? "text-white" : "text-gray-800"}`}>
                  {day.temp_high}°
                </p>
                <p className={`text-xs ${isToday ? "text-white/60" : "text-gray-400"}`}>
                  {day.temp_low}°
                </p>
              </div>
              <div className={`w-full text-center py-1 rounded-full text-xs font-medium border ${impact.color}`}>
                {day.rain_prob}% 🌧️
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${impact.color}`}>
                {impact.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}