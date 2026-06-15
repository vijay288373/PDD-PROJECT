import { motion } from "framer-motion";
import { MapPin, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const CONDITION_CONFIG = {
  sunny: { emoji: "☀️", gradient: "from-[#f59e0b] to-[#f97316]", bg: "bg-amber-400" },
  partly_cloudy: { emoji: "⛅", gradient: "from-[#60a5fa] to-[#3b82f6]", bg: "bg-blue-400" },
  cloudy: { emoji: "☁️", gradient: "from-[#94a3b8] to-[#64748b]", bg: "bg-slate-400" },
  rainy: { emoji: "🌧️", gradient: "from-[#3b82f6] to-[#1d4ed8]", bg: "bg-blue-600" },
  stormy: { emoji: "⛈️", gradient: "from-[#4b5563] to-[#1f2937]", bg: "bg-gray-700" },
  foggy: { emoji: "🌫️", gradient: "from-[#9ca3af] to-[#6b7280]", bg: "bg-gray-500" },
  windy: { emoji: "💨", gradient: "from-[#67e8f9] to-[#06b6d4]", bg: "bg-cyan-400" },
};

function WeatherEmoji({ condition, size = "text-8xl" }) {
  const config = CONDITION_CONFIG[condition] || CONDITION_CONFIG.sunny;
  return (
    <motion.div
      className={size}
      animate={{ y: [0, -8, 0], rotate: condition === "windy" ? [0, 5, -5, 0] : 0 }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {config.emoji}
    </motion.div>
  );
}

function RainDrops() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 bg-white/30 rounded-full"
          style={{ left: `${(i * 9) % 100}%`, height: `${8 + (i % 4) * 4}px` }}
          animate={{ y: [-20, 200], opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.8 + (i % 3) * 0.3, repeat: Infinity, delay: i * 0.15, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export default function WeatherHeader({ weather, loading, lastUpdated, onRefresh }) {
  const condition = weather?.current?.condition || "sunny";
  const config = CONDITION_CONFIG[condition] || CONDITION_CONFIG.sunny;
  const isRainy = condition === "rainy" || condition === "stormy";

  return (
    <div className={`relative bg-gradient-to-br ${config.gradient} px-4 pb-8 pt-safe-top pt-6 overflow-hidden`}>
      {/* Background circles */}
      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      {isRainy && <RainDrops />}

      <div className="max-w-lg mx-auto relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {loading ? "Detecting location..." : (weather?.location_name || "Your Location")}
              </span>
            </div>
            <p className="text-white/60 text-xs mt-0.5">
              {lastUpdated ? `Updated ${format(lastUpdated, "h:mm a")}` : "Updating..."}
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Main weather display */}
        <div className="flex items-center justify-between">
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-16 w-32 bg-white/20 rounded-2xl animate-pulse" />
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-start">
                  <span className="text-7xl font-thin text-white leading-none">
                    {weather?.current?.temp_c ?? "--"}
                  </span>
                  <span className="text-3xl text-white/80 mt-2">°C</span>
                </div>
                <p className="text-white/80 text-sm capitalize mt-1">
                  {weather?.current?.description || condition}
                </p>
                <p className="text-white/60 text-xs mt-0.5">
                  Feels like {weather?.current?.feels_like_c ?? "--"}°C
                </p>
              </>
            )}
          </div>
          <WeatherEmoji condition={condition} />
        </div>

        {/* Quick stats bar */}
        {!loading && weather?.current && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-6 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3"
          >
            {[
              { label: "Rain", value: `${weather.current.rainfall_mm}mm` },
              { label: "Humidity", value: `${weather.current.humidity}%` },
              { label: "Wind", value: `${weather.current.wind_kmh}km/h` },
              { label: "UV", value: weather.current.uv_index },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center">
                <p className="text-white font-semibold text-sm">{s.value}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}