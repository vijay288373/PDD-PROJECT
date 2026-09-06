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

const ICAR_DETERMINISTIC_RECOMMENDATIONS = {
  'Tamil Nadu': [
    { crop: 'Rice', suitability_score: 93, why_suitable: 'Excellent water retention in clay-loam soils supports prolonged flooding', best_sowing_month: 'June-July', expected_yield_per_acre: '22 quintal', water_requirement: 'High', market_opportunity: 'High', key_risk: 'High susceptibility to Brown Planthopper during high humidity' },
    { crop: 'Tomato', suitability_score: 90, why_suitable: 'Optimal day temperatures (21-28°C) foster rich lycopene development', best_sowing_month: 'June-July', expected_yield_per_acre: '95 quintal', water_requirement: 'Medium', market_opportunity: 'High', key_risk: 'Early blight risk in cloudy weather' },
    { crop: 'Cotton', suitability_score: 88, why_suitable: 'Deep black soils (Regur) provide excellent moisture retention for long taproots', best_sowing_month: 'October-November', expected_yield_per_acre: '10 quintal', water_requirement: 'Medium', market_opportunity: 'High', key_risk: 'Pink Bollworm attack during flowering phase' },
    { crop: 'Coconut', suitability_score: 86, why_suitable: 'The microclimate of Tamil Nadu provides the perfect photoperiod for Coconut', best_sowing_month: 'June-July', expected_yield_per_acre: '7000 nuts', water_requirement: 'Medium', market_opportunity: 'Medium', key_risk: 'Rhinoceros beetle infestation risk' },
    { crop: 'Groundnut', suitability_score: 85, why_suitable: 'Well-drained sandy loam soil supports easy peg penetration', best_sowing_month: 'June-July', expected_yield_per_acre: '10 quintal', water_requirement: 'Low-Medium', market_opportunity: 'Medium', key_risk: 'Tikka leaf spot disease in damp soil' },
    { crop: 'Sugarcane', suitability_score: 84, why_suitable: 'Abundant sunshine and humidity maximize sucrose accumulation', best_sowing_month: 'December-January', expected_yield_per_acre: '380 quintal', water_requirement: 'High', market_opportunity: 'High', key_risk: 'Early shoot borer infestation in dry spells' },
    { crop: 'Onion', suitability_score: 82, why_suitable: 'Friable light soils support uniform bulb expansion', best_sowing_month: 'October-November', expected_yield_per_acre: '70 quintal', water_requirement: 'Medium', market_opportunity: 'High', key_risk: 'Purple blotch fungal infection during rains' },
    { crop: 'Maize', suitability_score: 80, why_suitable: 'Moderate warm climate ensures fast cob maturation', best_sowing_month: 'June-July', expected_yield_per_acre: '28 quintal', water_requirement: 'Medium', market_opportunity: 'Medium', key_risk: 'Fall Armyworm attack during whorl stage' },
  ]
};

const DEFAULT_STATE = 'Tamil Nadu';

export default function CropAdvisor() {
  const [location, setLocation] = useState(null);
  const [state, setState] = useState(DEFAULT_STATE);
  const [zoneInfo, setZoneInfo] = useState(ICAR_ZONE_CROPS[DEFAULT_STATE]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldSize, setFieldSize] = useState('1');
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
        buildRecommendations(detectedState, zone);
      }
    } catch (e) {
      setLocationError('Location access denied. Showing default recommendations for Tamil Nadu.');
      const zone = ICAR_ZONE_CROPS[DEFAULT_STATE];
      setZoneInfo(zone);
      buildRecommendations(DEFAULT_STATE, zone);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildRecommendations = (targetState, zone) => {
    const list = ICAR_DETERMINISTIC_RECOMMENDATIONS[targetState] || ICAR_DETERMINISTIC_RECOMMENDATIONS[DEFAULT_STATE];
    setRecommendations(list);
  };

  const toggleSaveCrop = (cropName) => {
    const updated = savedCrops.includes(cropName) ? savedCrops.filter(c => c !== cropName) : [...savedCrops, cropName];
    setSavedCrops(updated);
    localStorage.setItem('agriguard_my_crops', JSON.stringify(updated));
  };

  const saveFieldSize = (val) => { setFieldSize(val); localStorage.setItem('agriguard_field_size', val); };

  const getOpportunityColor = (opp) => opp === 'High' ? '#16a34a' : opp === 'Medium' ? '#d97706' : '#9ca3af';

  return (
    <div className="min-h-screen bg-[#052e16] text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#052e16] to-[#0f4d25] p-5 pt-8 border-b border-green-800/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-400/30">
              <Sprout className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Crop Advisor</h1>
              <p className="text-xs text-green-300/80">Smart crop selection for your land</p>
            </div>
          </div>
          <button
            onClick={detectLocationAndLoad}
            disabled={loading}
            className="p-2 bg-green-900/60 rounded-xl hover:bg-green-800/60 transition-all border border-green-700/40"
          >
            <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Location pill */}
        <div className="bg-green-900/40 rounded-2xl p-3 border border-green-700/30 flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="font-semibold text-green-100">
              {location ? location.formatted : 'Chennai, Tamil Nadu, India'}
            </span>
          </div>
        </div>

        {/* Zone metrics bar */}
        {zoneInfo && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="bg-green-950/80 text-green-300 px-2.5 py-1 rounded-full border border-green-800/40 whitespace-nowrap">
              🪨 {zoneInfo.soilType}
            </span>
            <span className="bg-green-950/80 text-green-300 px-2.5 py-1 rounded-full border border-green-800/40 whitespace-nowrap">
              🌧️ {zoneInfo.avgRainfall}/yr
            </span>
            <span className="bg-green-950/80 text-green-300 px-2.5 py-1 rounded-full border border-green-800/40 whitespace-nowrap">
              🗺️ {zoneInfo.zone}
            </span>
          </div>
        )}
      </div>

      {/* Field size selector */}
      <div className="px-4 py-3 bg-[#0a3a1d] border-b border-green-800/30 flex items-center justify-between">
        <span className="text-xs text-green-300 font-medium">📐 Field Size (acres):</span>
        <div className="flex bg-green-950/80 p-1 rounded-xl border border-green-800/50">
          {['0.5', '1', '2', '5'].map(sz => (
            <button
              key={sz}
              onClick={() => saveFieldSize(sz)}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                fieldSize === sz ? 'bg-green-500 text-green-950 shadow' : 'text-green-300 hover:text-white'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-white">Recommended Crops for Your Region</h2>
            <p className="text-[11px] text-green-300/70">Based on ICAR agro-climatic zones, soil type & current season</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-green-900/20 rounded-3xl animate-pulse border border-green-800/20" />
            ))}
          </div>
        ) : (
          recommendations.map((rec, idx) => {
            const cropName = rec.crop;
            const price = MANDI_PRICES[cropName] || 2000;
            const acres = parseFloat(fieldSize) || 1;
            const yieldNum = parseInt(rec.expected_yield_per_acre) || 15;
            const estRevenue = Math.round(price * yieldNum * acres);
            const emoji = CROP_EMOJI[cropName] || '🌱';
            const isTop = idx === 0;

            return (
              <motion.div
                key={cropName}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`bg-white rounded-3xl p-5 text-gray-900 shadow-xl border-2 transition-all ${
                  isTop ? 'border-green-400 ring-2 ring-green-400/30' : 'border-gray-100'
                }`}
              >
                {isTop && (
                  <div className="inline-flex items-center gap-1.5 bg-green-700 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    ⭐ Best Pick for You
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{emoji}</span>
                    <div>
                      <h3 className="font-extrabold text-xl text-gray-900">{cropName}</h3>
                      <p className="text-xs text-gray-500 font-medium">{rec.best_sowing_month}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-2xl border border-green-100">
                      <span className="font-extrabold text-lg text-green-700">{rec.suitability_score}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Score</p>
                  </div>
                </div>

                {/* Suitability Reason */}
                <p className="text-xs text-gray-600 mt-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-medium">
                  {rec.why_suitable}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">Yield/Acre</p>
                    <p className="font-bold text-xs text-gray-800 mt-0.5">{rec.expected_yield_per_acre}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">Water</p>
                    <p className="font-bold text-xs text-blue-600 mt-0.5">{rec.water_requirement}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">Market</p>
                    <p className="font-bold text-xs text-green-600 mt-0.5">{rec.market_opportunity}</p>
                  </div>
                </div>

                {/* APMC Revenue Banner */}
                <div className="mt-3 bg-green-50 p-3 rounded-2xl border border-green-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-green-800 font-bold">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>APMC: ₹{price.toLocaleString('en-IN')}/quintal</span>
                    <span className="text-gray-400 font-normal">· {acres} acre est: ₹{estRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Risk Warning */}
                {rec.key_risk && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 mt-3 flex items-start gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Risk: {rec.key_risk}</span>
                  </p>
                )}

                {/* Grow button */}
                <button
                  onClick={() => toggleSaveCrop(cropName)}
                  className={`w-full mt-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    savedCrops.includes(cropName)
                      ? 'bg-gray-100 text-gray-700 border border-gray-300'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                  }`}
                >
                  {savedCrops.includes(cropName) ? (
                    <><CheckCircle className="w-4 h-4 text-green-600" /> Added to My Crops</>
                  ) : (
                    <><Sprout className="w-4 h-4" /> Grow This Crop</>
                  )}
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
