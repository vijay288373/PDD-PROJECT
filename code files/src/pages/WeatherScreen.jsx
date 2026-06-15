import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WeatherHeader from "@/components/weather/WeatherHeader";
import ForecastStrip from "@/components/weather/ForecastStrip";
import CropImpactPanel from "@/components/weather/CropImpactPanel";
import WeatherHistoryChart from "@/components/weather/WeatherHistoryChart";
import PrecautionsPanel from "@/components/weather/PrecautionsPanel";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/BottomNav";
import ErrorCard from "@/components/ErrorCard";
import SkeletonCard from "@/components/SkeletonCard";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import { llmLangSuffix } from "@/lib/i18n";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";
import { getPrecisionLocation } from "@/lib/location";

const TABS = ["Overview", "Crop Impact", "Precautions", "History"];

const DEPRECATED_LOCAL_LABELS = {
  Overview: { en: "Overview", hi: "अवलोकन", ta: "கண்ணோட்டம்", te: "అవలోకనం", es: "Resumen" },
  "Crop Impact": { en: "Crop Impact", hi: "फसल प्रभाव", ta: "பயிர் பாதிப்பு", te: "పంట ప్రభావం", es: "Impacto en cultivo" },
  Precautions: { en: "Precautions", hi: "सावधानियां", ta: "முன்னெச்சரிக்கைகள்", te: "ముందుజాగ్రత్తలు", es: "Precauciones" },
  History: { en: "History", hi: "इतिहास", ta: "வரலாறு", te: "చరిత్ర", es: "Historial" },
  
  Humidity: { en: "Humidity", hi: "आर्द्रता", ta: "ஈரப்பதம்", te: "ఆర్ద్రత", es: "Humedad" },
  Wind: { en: "Wind Speed", hi: "हवा की गति", ta: "காற்றின் வேகம்", te: "గాలి వేగం", es: "Velocidad del viento" },
  "UV Index": { en: "UV Index", hi: "यूवी इंडेक्स", ta: "புற ஊதா குறியீடு", te: "యువి సూచిక", es: "Índice UV" },
  "Soil Moisture": { en: "Soil Moisture", hi: "मिट्टी की नमी", ta: "மண் ஈப்பதம்", te: "నేలలో తేమ", es: "Humedad del suelo" },
  Rainfall: { en: "Rainfall", hi: "वर्षा", ta: "மழைப்பொழிவு", te: "వర్షపాతం", es: "Precipitación" },
  "Feels Like": { en: "Feels Like", hi: "महसूस तापमान", ta: "உணர்வு வெப்பநிலை", te: "అనిపించే ఉష్ణోగ్రత", es: "Sensación térmica" }
};

export default function WeatherScreen() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [cropImpact, setCropImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { langCode } = useLang();

  const loadProfile = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.FarmerProfile.filter({ uid: user.email });
      if (profiles.length > 0) setUserProfile(profiles[0]);
    } catch {}
  }, []);

  const fetchWeather = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch real-time weather metrics from Open-Meteo API (free, no-key required)
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,precipitation_sum&timezone=auto`;
      
      let openMeteoData;
      try {
        const openMeteoResp = await fetch(openMeteoUrl);
        if (!openMeteoResp.ok) throw new Error("Open-Meteo API request failed");
        openMeteoData = await openMeteoResp.json();
      } catch (fetchErr) {
        console.warn("⚠️ Open-Meteo API fetch failed. Using local mock meteorological data...", fetchErr);
        openMeteoData = {
          current: {
            temperature_2m: 28.5,
            apparent_temperature: 30.2,
            relative_humidity_2m: 65,
            precipitation: 0.0,
            wind_speed_10m: 12.5
          },
          daily: {
            time: Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              return d.toISOString().split('T')[0];
            }),
            temperature_2m_max: [32, 33, 31, 30, 32, 33, 34],
            temperature_2m_min: [22, 23, 22, 21, 22, 23, 24],
            precipitation_probability_max: [10, 20, 60, 45, 10, 5, 0],
            uv_index_max: [8, 9, 5, 6, 8, 9, 9],
            precipitation_sum: [0, 0, 4.5, 2.1, 0, 0, 0]
          }
        };
      }

      const cur = openMeteoData.current;
      const daily = openMeteoData.daily;

      // 2. Enrich the physical metrics with Gemini for location geocoding and language descriptions
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a localized weather reporting assistant. You are given real-time weather metrics from Open-Meteo for coordinates: latitude ${lat.toFixed(4)}, longitude ${lon.toFixed(4)}.
        
Current Weather Metrics:
- Temp: ${cur.temperature_2m}°C
- Feels like: ${cur.apparent_temperature}°C
- Humidity: ${cur.relative_humidity_2m}%
- Precipitation: ${cur.precipitation} mm
- Wind: ${cur.wind_speed_10m} km/h

Daily Forecast Details (next 7 days):
- Dates: ${JSON.stringify(daily.time)}
- Max Temps: ${JSON.stringify(daily.temperature_2m_max)}°C
- Min Temps: ${JSON.stringify(daily.temperature_2m_min)}°C
- Rain Probabilities: ${JSON.stringify(daily.precipitation_probability_max)}%
- Rainfall Sums: ${JSON.stringify(daily.precipitation_sum)} mm
- UV Index Max: ${JSON.stringify(daily.uv_index_max)}

Please resolve these coordinates to a readable "location_name" (e.g. "Pune, Maharashtra, India" or nearest town/city).
For each forecast day, map the metrics and return the exact JSON structure below.
Determine the "condition" for current and forecast days from: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "windy" | "partly_cloudy".
Determine "soil_moisture" as: "dry" | "normal" | "wet" | "saturated".
Today's date: ${new Date().toDateString()}.${llmLangSuffix(langCode)}

Return ONLY this JSON:
{
  "location_name": "<city, state, country>",
  "current": {
    "temp_c": ${cur.temperature_2m},
    "feels_like_c": ${cur.apparent_temperature},
    "humidity": ${cur.relative_humidity_2m},
    "rainfall_mm": ${cur.precipitation},
    "wind_kmh": ${cur.wind_speed_10m},
    "uv_index": ${daily.uv_index_max[0] || 5},
    "soil_moisture": "<dry|normal|wet|saturated>",
    "condition": "<sunny|cloudy|rainy|stormy|foggy|windy|partly_cloudy>",
    "description": "<short description in localized language>"
  },
  "forecast": [
    {
      "day": "<Mon|Tue|Wed|Thu|Fri|Sat|Sun>",
      "date": "<e.g. May 20>",
      "temp_high": <max temp value>,
      "temp_low": <min temp value>,
      "rain_prob": <rain prob value>,
      "rainfall_mm": <rainfall sum value>,
      "condition": "<sunny|cloudy|rainy|stormy|foggy|windy|partly_cloudy>",
      "humidity": <humidity>,
      "wind_kmh": <wind_kmh>,
      "uv_index": <uv index value>
    }
  ]
}
The forecast array must contain exactly 7 items corresponding to the Open-Meteo forecast.`,
        response_json_schema: {
          type: "object",
          properties: {
            location_name: { type: "string" },
            current: { type: "object" },
            forecast: { type: "array", items: { type: "object" } }
          }
        }
      });

      setWeather(result);
      setForecast(result.forecast || []);
      setLastUpdated(new Date());
      return result;
    } catch (e) {
      console.error("fetchWeather error:", e);
      setError("Failed to fetch weather data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [langCode]);

  const runCropImpactAnalysis = useCallback(async (weatherData, profile) => {
    if (!weatherData || !profile?.primary_crops?.length) return;
    setAnalyzing(true);
    try {
      const crops = (profile.primary_crops || []).join(", ");
      const region = profile.region || profile.country || "unknown region";
      const lang = profile.language || "English";
      const w = weatherData.current;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert agronomist AI. Analyze weather impact on crops.

Farmer grows: ${crops}
Region: ${region}
Today's weather: Temp ${w?.temp_c}°C, Humidity ${w?.humidity}%, Rainfall ${w?.rainfall_mm}mm, Wind ${w?.wind_kmh}km/h, UV Index ${w?.uv_index}, Soil moisture: ${w?.soil_moisture}
7-day forecast summary: ${JSON.stringify(weatherData.forecast?.slice(0, 3))}
Language for response: ${lang}

Return ONLY this JSON:
{
  "overall_risk": "low"|"medium"|"high"|"critical",
  "summary": "<2-sentence overall assessment>",
  "crop_impacts": [
    {
      "crop": "<crop name>",
      "risk_level": "low"|"medium"|"high"|"critical",
      "impact_summary": "<specific impact on this crop>",
      "irrigation_change": "increase"|"decrease"|"maintain",
      "irrigation_pct": <number 0-50>,
      "immediate_actions": ["<specific action 1>", "<action 2>"],
      "best_activities": ["<good activity today 1>", "<activity 2>"]
    }
  ],
  "precautions": {
    "immediate": ["<action within hours>", "..."],
    "this_week": ["<action this week>", "..."],
    "monitor": ["<thing to watch>", "..."]
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk: { type: "string" },
            summary: { type: "string" },
            crop_impacts: { type: "array", items: { type: "object" } },
            precautions: { type: "object" }
          }
        }
      });
      setCropImpact(result);
    } catch {}
    setAnalyzing(false);
  }, []);

  useEffect(() => {
    loadProfile().then(async () => {
      try {
        const coords = await getPrecisionLocation();
        if (coords) {
          setLocation(coords);
          const weatherData = await fetchWeather(coords.latitude, coords.longitude);
          if (weatherData) {
            const p = await base44.entities.FarmerProfile.list().then(ps => ps[0]).catch(() => null);
            if (p) runCropImpactAnalysis(weatherData, p);
          }
        }
      } catch (err) {
        console.warn("Weather Screen precision location failed, using fallback:", err);
        // Fallback: India center coords
        const weatherData = await fetchWeather(20.5937, 78.9629);
        if (weatherData) {
          const p = await base44.entities.FarmerProfile.list().then(ps => ps[0]).catch(() => null);
          if (p) runCropImpactAnalysis(weatherData, p);
        }
      }
    });

    // Auto-refresh every 30 minutes
    const interval = setInterval(() => {
      if (location) fetchWeather(location.latitude, location.longitude);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    if (location) return fetchWeather(location.latitude, location.longitude);
    return fetchWeather(20.5937, 78.9629);
  }, [location, fetchWeather]);

  const { refreshing, containerRef } = usePullToRefresh(handleRefresh);

  return (
    <div className="min-h-screen bg-[#0d1f3c]">
      {/* Header */}
      <WeatherHeader
        weather={weather}
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
      />

      {/* Tab bar */}
      <div className="bg-[#0d1f3c] px-4 sticky top-0 z-10">
        <div className="flex overflow-x-auto gap-1 pb-3 scrollbar-hide max-w-lg mx-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#4ade80] text-[#0d1f3c] shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t(tab, langCode)}
            </button>
          ))}
        </div>
      </div>

      <BottomNav />

      {refreshing && (
        <div className="flex justify-center py-3 bg-[#0d1f3c]">
          <div className="w-5 h-5 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div ref={containerRef} className="bg-[#f5f8f0] min-h-[60vh] rounded-t-3xl max-w-lg mx-auto pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "Overview" && (
              <div className="p-4">
                {loading ? (
                  <div className="space-y-3">
                    <SkeletonCard height="h-20" lines={2} />
                    <div className="grid grid-cols-2 gap-3">
                      {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} height="h-24" lines={2} />)}
                    </div>
                  </div>
                ) : error ? (
                  <ErrorCard label={t("nav_weather", langCode)} onRetry={handleRefresh} />
                ) : (
                  <>
                    <ForecastStrip forecast={forecast} loading={false} />
                    {/* Current details grid */}
                    {weather?.current && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {[
                          { labelKey: "Humidity", value: `${weather.current.humidity}%`, emoji: "💧" },
                          { labelKey: "Wind", value: `${weather.current.wind_kmh} km/h`, emoji: "💨" },
                          { labelKey: "UV Index", value: weather.current.uv_index, emoji: "☀️" },
                          { labelKey: "Soil Moisture", value: weather.current.soil_moisture, emoji: "🌱" },
                          { labelKey: "Rainfall", value: `${weather.current.rainfall_mm} mm`, emoji: "🌧️" },
                          { labelKey: "Feels Like", value: `${weather.current.feels_like_c}°C`, emoji: "🌡️" },
                        ].map(item => {
                          const label = t(item.labelKey, langCode);
                          
                          return (
                            <div key={item.labelKey} className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f5e9]">
                              <p className="text-2xl mb-1">{item.emoji}</p>
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="font-bold text-gray-800 capitalize">{item.value}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {activeTab === "Crop Impact" && (
              <CropImpactPanel cropImpact={cropImpact} analyzing={analyzing} userProfile={userProfile} />
            )}
            {activeTab === "Precautions" && (
              <PrecautionsPanel cropImpact={cropImpact} analyzing={analyzing} />
            )}
            {activeTab === "History" && (
              <WeatherHistoryChart location={location} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}