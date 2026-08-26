import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sprout, MapPin, TrendingUp, Droplets, Sun, RefreshCw, CheckCircle, Info, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { base44 } from "@/api/base44Client";
import { getPrecisionLocation, getGeocodedLocation } from "@/lib/location";
import { useLang } from "@/lib/useLang.jsx";

const ICAR_ZONE_CROPS = {
  'Tamil Nadu': { zone: 'South Zone', soilType: 'Red Laterite & Black Cotton', avgRainfall: '945mm', crops: ['Rice', 'Groundnut', 'Cotton', 'Sugarcane', 'Banana', 'Coconut', 'Turmeric', 'Tomato', 'Onion', 'Maize'] },
  'Andhra Pradesh': { zone: 'South Zone', soilType: 'Black Cotton & Red Sandy', avgRainfall: '1000mm', crops: ['Rice', 'Cotton', 'Groundnut', 'Tobacco', 'Chili', 'Maize', 'Sunflower', 'Sugarcane', 'Onion', 'Turmeric'] },
  'Telangana': { zone: 'South Zone', soilType: 'Black Cotton', avgRainfall: '915mm', crops: ['Cotton', 'Rice', 'Maize', 'Soybean', 'Groundnut', 'Red Gram', 'Sunflower', 'Chili', 'Turmeric'] },
  'Karnataka': { zone: 'South Zone', soilType: 'Red & Black Laterite', avgRainfall: '1135mm', crops: ['Rice', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Ragi', 'Soybean', 'Sunflower', 'Coconut'] },
  'Kerala': { zone: 'South Zone', soilType: 'Laterite & Alluvial', avgRainfall: '3055mm', crops: ['Rice', 'Coconut', 'Banana', 'Rubber', 'Pepper', 'Cardamom', 'Ginger', 'Turmeric', 'Tapioca'] },
  'Maharashtra': { zone: 'West Zone', soilType: 'Deep Black Cotton', avgRainfall: '1000mm', crops: ['Cotton', 'Soybean', 'Sugarcane', 'Onion', 'Grape', 'Wheat', 'Jowar', 'Bajra', 'Tur Dal', 'Maize'] },
  'Gujarat': { zone: 'West Zone', soilType: 'Black Cotton & Alluvial', avgRainfall: '800mm', crops: ['Cotton', 'Groundnut', 'Wheat', 'Rice', 'Castor', 'Bajra', 'Mustard', 'Cumin', 'Sugarcane'] },
  'Rajasthan': { zone: 'North West Zone', soilType: 'Sandy Loam & Arid', avgRainfall: '530mm', crops: ['Wheat', 'Bajra', 'Jowar', 'Mustard', 'Cumin', 'Coriander', 'Gram', 'Pomegranate', 'Moth Bean'] },
  'Punjab': { zone: 'North Zone', soilType: 'Sandy Loam & Alluvial', avgRainfall: '700mm', crops: ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Sunflower', 'Moong Dal'] },
  'Haryana': { zone: 'North Zone', soilType: 'Alluvial & Loam', avgRainfall: '645mm', crops: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Bajra', 'Maize', 'Sunflower', 'Potato', 'Mustard'] },
  'Uttar Pradesh': { zone: 'North Zone', soilType: 'Alluvial', avgRainfall: '900mm', crops: ['Wheat', 'Rice', 'Sugarcane', 'Potato', 'Maize', 'Pulses', 'Mustard', 'Mentha', 'Mango'] },
  'Madhya Pradesh': { zone: 'Central Zone', soilType: 'Black Cotton & Red', avgRainfall: '1100mm', crops: ['Soybean', 'Wheat', 'Gram', 'Maize', 'Cotton', 'Rice', 'Lentil', 'Mustard', 'Groundnut'] },
  'West Bengal': { zone: 'East Zone', soilType: 'Alluvial & Laterite', avgRainfall: '1750mm', crops: ['Rice', 'Jute', 'Potato', 'Wheat', 'Mustard', 'Pulses', 'Vegetables', 'Tea', 'Mango'] },
  'Bihar': { zone: 'East Zone', soilType: 'Alluvial', avgRainfall: '1200mm', crops: ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Potato', 'Lentil', 'Mustard', 'Mango', 'Litchi'] },
};

const CROP_EMOJI = { 'Rice': '🌾', 'Wheat': '🌾', 'Tomato': '🍅', 'Potato': '🥔', 'Onion': '🧅', 'Cotton': '☁️', 'Sugarcane': '🎋', 'Groundnut': '🥜', 'Maize': '🌽', 'Banana': '🍌', 'Coconut': '🥥', 'Soybean': '🌿', 'Mustard': '🌼', 'Chili': '🌶️', 'Turmeric': '💛' };

const MANDI_PRICES = {
  'Rice': 2150, 'Wheat': 2380, 'Tomato': 1850, 'Potato': 1100, 'Onion': 1950,
  'Cotton': 6850, 'Sugarcane': 350, 'Groundnut': 5900, 'Maize': 1800, 'Banana': 1600,
  'Coconut': 1200, 'Soybean': 4400, 'Mustard': 5500, 'Chili': 4500, 'Turmeric': 7800,
};

const DEFAULT_STATE = 'Tamil Nadu';

export default function CropAdvisor() {
  const [location, setLocation] = useState(null);
  const [state, setState] = useState(DEFAULT_STATE);
  const [zoneInfo, setZoneInfo] = useState(ICAR_ZONE_CROPS[DEFAULT_STATE]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldSize, setFieldSize] = useState('2');
  const [savedCrops, setSavedCrops] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const { langCode } = useLang();

  useEffect(() => {
    detectLocationAndLoad();
    const saved = JSON.parse(localStorage.getItem('agriguard_my_crops') || '[]');
    setSavedCrops(saved);
    const fs = localStorage.getItem('agriguard_field_size');
    if (fs) setFieldSize(fs);
  }, []);

  const detectLocationAndLoad = useCallback(async () => {
    setLoading(true);
    setLocationError(null);
    try {
      const coords = await getPrecisionLocation();
      const geo = await getGeocodedLocation(coords.latitude, coords.longitude);
      if (geo) {
        setLocation(geo);
        const detectedState = geo.state || DEFAULT_STATE;
        setState(detectedState);
        const zone = ICAR_ZONE_CROPS[detectedState] || ICAR_ZONE_CROPS[DEFAULT_STATE];
        setZoneInfo(zone);
        await buildRecommendations(zone, geo);
      }
    } catch (e) {
      setLocationError('Location access denied. Showing default recommendations for Tamil Nadu.');
      const zone = ICAR_ZONE_CROPS[DEFAULT_STATE];
      setZoneInfo(zone);
      await buildRecommendations(zone, null);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildRecommendations = async (zone, geo) => {
    const cropList = zone.crops.slice(0, 8);
    const month = new Date().getMonth() + 1;
    const season = month >= 6 && month <= 11 ? 'Kharif (Monsoon)' : 'Rabi (Winter)';
    try {
      const prompt = `You are an expert ICAR agronomist for Indian small farmers (0-10 acres).
Location: ${geo ? geo.formatted : 'Tamil Nadu, India'}
Soil type: ${zone.soilType}
ICER Agro-climatic Zone: ${zone.zone}
Avg annual rainfall: ${zone.avgRainfall}
Current season: ${season} (Month: ${month})
Available crops: ${cropList.join(', ')}

Return JSON: { "recommendations": [ { "crop": "name", "suitability_score": 85, "why_suitable": "Provide a detailed, unique reason why this specific crop thrives here", "best_sowing_month": "June-July", "expected_yield_per_acre": "20-25 quintal", "water_requirement": "High/Medium/Low", "market_opportunity": "High/Medium/Low", "key_risk": "Give a highly specific and unique risk for THIS exact crop in THIS region", "nearby_mandis": ["mandi1", "mandi2"] } ] }`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const cleanRes = typeof res === 'string' ? res.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim() : res;
      const parsed = typeof cleanRes === 'string' ? JSON.parse(cleanRes) : cleanRes;
      if (parsed?.recommendations) { setRecommendations(parsed.recommendations); return; }
    } catch {}
    const fallback = cropList.map(cropName => ({
      crop: cropName,
      suitability_score: Math.floor(70 + Math.random() * 25),
      why_suitable: `${cropName} thrives well in ${zone.soilType} soil of ${zone.zone}. Ideal for local climate conditions.`,
      best_sowing_month: month >= 6 ? 'June-July' : 'October-November',
      expected_yield_per_acre: '15-20 quintal',
      water_requirement: 'Medium',
      market_opportunity: MANDI_PRICES[cropName] > 4000 ? 'High' : MANDI_PRICES[cropName] > 2000 ? 'Medium' : 'Low',
      key_risk: 'Monitor for pests and diseases',
      nearby_mandis: ['Local APMC Mandi', 'District Agricultural Market'],
    })).sort((a, b) => b.suitability_score - a.suitability_score);
    setRecommendations(fallback);
  };

  const toggleSaveCrop = (cropName) => {
    const updated = savedCrops.includes(cropName) ? savedCrops.filter(c => c !== cropName) : [...savedCrops, cropName];
    setSavedCrops(updated);
    localStorage.setItem('agriguard_my_crops', JSON.stringify(updated));
  };

  const saveFieldSize = (val) => { setFieldSize(val); localStorage.setItem('agriguard_field_size', val); };

  const getOpportunityColor = (opp) => opp === 'High' ? '#16a34a' : opp === 'Medium' ? '#d97706' : '#9ca3af';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-green-800">
      <div ref={null} className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <div className="px-4 pt-12 pb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white">🌱 Crop Advisor</h1>
              <p className="text-green-300 text-sm mt-1">Smart crop selection based on your location</p>
            </div>
            <button onClick={detectLocationAndLoad} className="p-2 rounded-full bg-white/10 text-green-300 hover:bg-white/20">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Location card */}
          <div className="bg-white/10 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="text-green-100 text-sm">{location ? location.formatted : `${state}, India`}</span>
            </div>
            {locationError && <p className="text-yellow-300 text-xs mb-2">{locationError}</p>}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-white/10 text-green-200 rounded-full px-2 py-1">🪨 {zoneInfo?.soilType}</span>
              <span className="text-xs bg-white/10 text-green-200 rounded-full px-2 py-1">💧 {zoneInfo?.avgRainfall}/yr</span>
              <span className="text-xs bg-white/10 text-green-200 rounded-full px-2 py-1">🗺️ {zoneInfo?.zone}</span>
            </div>
          </div>

          {/* Field size */}
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="text-green-200 text-sm font-medium">📐 Field Size (acres):</span>
            <input
              type="number"
              value={fieldSize}
              onChange={e => saveFieldSize(e.target.value)}
              className="bg-white/20 text-white font-bold rounded-lg px-3 py-1 w-20 text-center border border-green-400/30 focus:outline-none"
              placeholder="2.5"
            />
          </div>
        </div>

        <div className="px-4">
          <h2 className="text-lg font-bold text-white mb-1">Recommended Crops for Your Region</h2>
          <p className="text-green-300 text-xs mb-4">Based on ICAR agro-climatic zones, soil type & current season</p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin mb-4"></div>
              <p className="text-green-300">🌍 Detecting your location...</p>
            </div>
          ) : (
            recommendations.map((rec, idx) => {
              const isSaved = savedCrops.includes(rec.crop);
              const price = MANDI_PRICES[rec.crop] || 2000;
              const acres = parseFloat(fieldSize) || 1;
              const emoji = CROP_EMOJI[rec.crop] || '🌿';
              return (
                <motion.div
                  key={rec.crop}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl p-4 mb-4 shadow-lg ${
                    idx === 0 ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  {idx === 0 && (
                    <div className="inline-block bg-green-800 text-green-300 text-xs font-bold px-3 py-1 rounded-lg mb-3 tracking-wider">⭐ BEST PICK FOR YOU</div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-4xl">{emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900">{rec.crop}</h3>
                      <p className="text-xs text-gray-500">{rec.best_sowing_month}</p>
                    </div>
                    <div className="text-center bg-green-50 rounded-xl px-3 py-2">
                      <div className="text-2xl font-black text-green-600">{rec.suitability_score}</div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                    <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${rec.suitability_score}%` }}></div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{rec.why_suitable}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Yield/Acre</p>
                      <p className="text-xs font-bold text-gray-700">{rec.expected_yield_per_acre}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Water</p>
                      <p className="text-xs font-bold" style={{ color: rec.water_requirement === 'High' ? '#2563eb' : '#059669' }}>{rec.water_requirement}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Market</p>
                      <p className="text-xs font-bold" style={{ color: getOpportunityColor(rec.market_opportunity) }}>{rec.market_opportunity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      APMC: ₹{price}/quintal · {acres} acre est: ₹{(price * 15 * acres).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {rec.nearby_mandis?.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{rec.nearby_mandis.join(' · ')}</span>
                    </div>
                  )}
                  {rec.key_risk && (
                    <div className="flex items-center gap-1 mb-3">
                      <Info className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600">Risk: {rec.key_risk}</span>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSaveCrop(rec.crop)}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isSaved
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSaved ? <CheckCircle className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                    {isSaved ? 'Saved to My Crops' : 'Grow This Crop'}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
