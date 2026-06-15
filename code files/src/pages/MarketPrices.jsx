import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, TrendingUp, MapPin } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import ErrorCard from "@/components/ErrorCard";
import SkeletonCard from "@/components/SkeletonCard";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import { useLang } from "@/lib/useLang.jsx";
import { t } from "@/lib/i18n";
import PriceCard from "@/components/market/PriceCard";
import PriceTrendChart from "@/components/market/PriceTrendChart";
import AIPriceForecast from "@/components/market/AIPriceForecast";
import SetAlertModal from "@/components/market/SetAlertModal";
import { format } from "date-fns";
import { getPrecisionLocation, getGeocodedLocation } from "@/lib/location";

const CROP_KEYS = {
  "Rice": "crop_rice",
  "Wheat": "crop_wheat",
  "Tomato": "crop_tomato",
  "Potato": "crop_potato",
  "Onion": "crop_onion",
  "Maize / Corn": "crop_maize",
  "Cotton": "crop_cotton",
  "Sugarcane": "crop_sugarcane",
  "Pepper (Bell/Chili)": "crop_chili",
  "Banana / Plantain": "crop_banana"
};

const DEPRECATED_LOCAL_LABELS = {
  prices_near: { en: "Prices near", hi: "मंडी भाव यहाँ के:", ta: "விலைகள் அருகில்", te: "ధరలు దగ్గరగా", es: "Precios cerca de" },
  btn_change: { en: "Change", hi: "बदलें", ta: "மாற்று", te: "మార్చండి", es: "Cambiar" },
  updated_at: { en: "Updated at", hi: "अद्यतित किया गया", ta: "புதுப்பிக்கப்பட்டது", te: "నవీకరించబడింది", es: "Actualizado a las" },
  refresh: { en: "Refresh", hi: "ताज़ा करें", ta: "புதுப்பி", te: "రిఫ్రెష్", es: "Actualizar" },
  live_prices: { en: "Live Prices", hi: "लाइव मंडी भाव", ta: "நேரடி விலைகள்", te: "లైవ్ ధరలు", es: "Precios en vivo" },
  tap_forecast_hint: { en: "Tap a crop card to view AI price forecast →", hi: "मूल्य पूर्वानुमान देखने के लिए कार्ड पर टैप करें →", ta: "முன்னறிவிப்பைக் காண பயிர் கார்டைத் தட்டவும் →", te: "ధర అంచనాను చూడటానికి కార్డ్‌ను నొక్కండి →", es: "Toque una tarjeta para ver el pronóstico →" },
  no_crop_selected: { en: "No crop selected", hi: "कोई फसल नहीं चुनी गई", ta: "பயிர் எதுவும் தேர்ந்தெடுக்கப்படவில்லை", te: "ఏ పంట ఎంచుకోలేదు", es: "Ningún cultivo seleccionado" },
  no_crop_selected_desc: { en: "Go to Live Prices and tap a crop to analyze", hi: "लाइव मंडी भाव में जाएं और विश्लेषण के लिए एक फसल पर टैप करें", ta: "நேரடி விலைகளுக்குச் சென்று பகுப்பாய்வு செய்ய பயிரைத் தட்டவும்", te: "లైవ్ ధరలకు వెళ్లి విశ్లేషించడానికి ఒక పంటపై నొక్కండి", es: "Vaya a Precios en vivo y toque un cultivo para analizar" },
  ai_intelligence: { en: "AI Market Intelligence", hi: "एआई बाजार विश्लेषण", ta: "AI சந்தை நுண்ணறிவு", te: "AI మార్కెట్ ఇంటెలిజెన్స్", es: "Inteligencia de mercado de IA" },
  change_prompt: { en: "Enter market or city name:", hi: "मंडी या शहर का नाम दर्ज करें:", ta: "சந்தை அல்லது நகரத்தின் பெயரை உள்ளிடவும்:", te: "మండి లేదా నగరం పేరును నమోదు చేయండి:", es: "Ingrese el nombre del mercado o ciudad:" }
};

export default function MarketPrices() {
  const [userProfile, setUserProfile] = useState(null);
  const [crops, setCrops] = useState([]);
  const [priceData, setPriceData] = useState({});
  const [trendData, setTrendData] = useState(null);
  const [aiForecast, setAiForecast] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alertModal, setAlertModal] = useState(null); // { crop, priceData }
  const [activeTab, setActiveTab] = useState("prices"); // prices | forecast
  const [priceError, setPriceError] = useState(false);
  const { langCode } = useLang();

  // Load user profile + determine crops to show + fetch location
  useEffect(() => {
    const init = async () => {
      let cropList = ["Rice", "Wheat", "Tomato", "Onion", "Potato"];
      let regionVal = "India";
      let profileObj = null;

      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.FarmerProfile.filter({ uid: user.email });
        if (profiles.length > 0) {
          profileObj = profiles[0];
          cropList = profiles[0].primary_crops?.length ? profiles[0].primary_crops : cropList;
          regionVal = profiles[0].region || profiles[0].country || regionVal;
        }
      } catch (err) {
        console.warn("Failed to fetch profile in market prices:", err);
      }

      // Overwrite with precision current location if available!
      try {
        const coords = await getPrecisionLocation();
        if (coords) {
          const geo = await getGeocodedLocation(coords.latitude, coords.longitude);
          if (geo && geo.formatted) {
            regionVal = geo.formatted;
          }
        }
      } catch (err) {
        console.warn("Failed to get precision location, falling back:", err);
      }

      setUserProfile({ ...profileObj, region: regionVal });
      setCrops(cropList);
    };
    init();
  }, []);

  const fetchPrices = useCallback(async (cropList, region) => {
    if (!cropList.length) return;
    setLoading(true);
    setPriceError(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an agricultural market data service for India.
Region: ${region || "India"}
Crops: ${cropList.join(", ")}
Today's date: ${new Date().toDateString()}

Provide realistic wholesale mandi (market) prices for each crop. 
Base prices on actual Indian mandi data and current seasonal trends.
Use Agmarknet-style data for Indian markets.

Return ONLY this JSON:
{
  "market_name": "<nearest major mandi>",
  "prices": {
    "<crop_name>": {
      "modal_price": <number in INR per quintal>,
      "min_price": <number>,
      "max_price": <number>,
      "change_pct": <number, positive=up, negative=down>,
      "unit": "quintal",
      "estimated": true
    }
  }
}

Be realistic. Rice ~1800-2200, Wheat ~2000-2500, Tomato ~800-3000 (volatile), Onion ~1000-2500, Potato ~800-1500, Cotton ~6000-7500.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_name: { type: "string" },
            prices: { type: "object" }
          }
        }
      });
      setPriceData(result.prices || {});
      setLastUpdated(new Date());
      if (result.market_name && !userProfile?.region) {
        setUserProfile(p => ({ ...p, _market: result.market_name }));
      }
    } catch { setPriceError(true); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (crops.length) {
      const region = userProfile?.region || userProfile?.country || "India";
      fetchPrices(crops, region);
    }
  }, [crops, userProfile?.region]);

  const handleSelectCrop = async (crop) => {
    setSelectedCrop(crop);
    setActiveTab("forecast");
    setTrendLoading(true);
    setForecastLoading(true);
    setTrendData(null);
    setAiForecast(null);

    const region = userProfile?.region || userProfile?.country || "India";
    const language = userProfile?.language || "English";
    const currentPrice = priceData[crop]?.modal_price;
    const month = format(new Date(), "MMMM yyyy");

    try {
      // Fetch trend data + AI forecast in parallel
      const [trendResult, forecastResult] = await Promise.all([
        base44.integrations.Core.InvokeLLM({
          prompt: `Generate realistic 90-day historical price data and 7-day forecast for ${crop} in ${region}.
Today: ${new Date().toDateString()}. Current modal price: ₹${currentPrice || "unknown"}/quintal.

Return ONLY this JSON:
{
  "historical": [
    { "date": "<e.g. May 1>", "price": <number> }
  ],
  "forecast": [
    { "date": "<e.g. Jun 14>", "price": <number> }
  ]
}
historical must have exactly 90 entries, forecast exactly 7. Prices should show realistic seasonal movement.`,
          response_json_schema: {
            type: "object",
            properties: {
              historical: { type: "array", items: { type: "object" } },
              forecast: { type: "array", items: { type: "object" } }
            }
          }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `You are an agricultural commodity analyst.
Crop: ${crop}
Region: ${region}
Current price: ₹${currentPrice || "unknown"}/quintal
Month: ${month}
Language for output text: ${language}

Provide market intelligence in this EXACT JSON format:
{
  "recommendation": "SELL" | "HOLD" | "WAIT",
  "recommendation_reason": "<one sentence>",
  "best_sell_window": {
    "dates": "<e.g. Jun 14–17>",
    "reason": "<short reason>"
  },
  "scenarios": {
    "optimistic": <price number>,
    "likely": <price number>,
    "pessimistic": <price number>
  },
  "price_factors": ["<factor 1 as short label>", "<factor 2>", "<factor 3>"],
  "nearby_markets": [
    {
      "market_name": "<market name>",
      "distance": "<e.g. 45 km away>",
      "price_diff": <positive number = higher price there>
    },
    {
      "market_name": "<market name>",
      "distance": "<e.g. 80 km away>",
      "price_diff": <number>
    }
  ]
}`,
          response_json_schema: {
            type: "object",
            properties: {
              recommendation: { type: "string" },
              recommendation_reason: { type: "string" },
              best_sell_window: { type: "object" },
              scenarios: { type: "object" },
              price_factors: { type: "array", items: { type: "string" } },
              nearby_markets: { type: "array", items: { type: "object" } }
            }
          }
        })
      ]);

      setTrendData(trendResult);
      setAiForecast(forecastResult);
    } catch {}

    setTrendLoading(false);
    setForecastLoading(false);
  };

  const region = userProfile?.region || userProfile?.country || userProfile?._market || "India";
  const filteredCrops = crops.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const { refreshing, containerRef } = usePullToRefresh(() => fetchPrices(crops, region));

  const pricesNearStr = t("prices_near", langCode);
  const changeStr = t("btn_change", langCode);
  const updatedAtStr = t("updated_at", langCode);
  const refreshStr = t("refresh", langCode);
  const livePricesStr = t("live_prices", langCode);

  return (
    <div className="min-h-screen bg-[#f5f8f0]">
      {/* Header */}
      <div className="bg-[#1a5c2a] px-4 pt-4 pb-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4ade80]" />
                <h1 className="text-white font-bold text-lg">{t("market_prices", langCode)}</h1>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#4ade80]" />
                <p className="text-[#a7f3c8] text-xs">{pricesNearStr} {region}</p>
                <button
                  onClick={() => {
                    const promptText = t("change_prompt", langCode);
                    const m = prompt(promptText);
                    if (m) setUserProfile(p => ({ ...p, region: m }));
                  }}
                  className="text-[#4ade80] text-xs ml-1 underline"
                >
                  {changeStr}
                </button>
              </div>
            </div>
            <div className="text-right">
              {lastUpdated && (
                <p className="text-[#a7f3c8] text-xs">{updatedAtStr} {format(lastUpdated, "h:mm a")}</p>
              )}
              <button
                onClick={() => fetchPrices(crops, region)}
                className="mt-1 flex items-center gap-1 text-[#4ade80] text-xs"
              >
                <RefreshCw className="w-3 h-3" /> {refreshStr}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t("commodity_search", langCode)}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white border-0 rounded-xl h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-[#1a5c2a] px-4 sticky top-0 z-10">
        <div className="flex gap-1 pb-3 max-w-lg mx-auto">
          {["prices", "forecast"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-[#4ade80] text-[#0d1f3c] shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab === "prices" ? `📊 ${livePricesStr}` : `📈 ${selectedCrop ? t(CROP_KEYS[selectedCrop] || selectedCrop, langCode) : t("price_forecast", langCode)}`}
            </button>
          ))}
        </div>
      </div>

      <BottomNav />

      {refreshing && (
        <div className="flex justify-center py-3 bg-[#1a5c2a]">
          <div className="w-5 h-5 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div ref={containerRef} className="max-w-lg mx-auto pb-20 min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "prices" && (
              <div className="p-4 space-y-3">
                {loading ? (
                  [1, 2, 3].map(i => <SkeletonCard key={i} height="h-28" lines={3} />)
                ) : priceError ? (
                  <ErrorCard label={t("market_prices", langCode)} onRetry={() => fetchPrices(crops, region)} />
                ) : filteredCrops.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p>{t("no_crops_found", langCode)} "{search}"</p>
                  </div>
                ) : (
                  filteredCrops.map((crop, i) => (
                    <PriceCard
                      key={crop}
                      crop={t(CROP_KEYS[crop] || crop, langCode)}
                      priceData={priceData[crop]}
                      isSelected={selectedCrop === crop}
                      onSelect={() => handleSelectCrop(crop)}
                      onSetAlert={(c, data) => setAlertModal({ crop: c, priceData: data })}
                      index={i}
                    />
                  ))
                )}

                {!loading && filteredCrops.length > 0 && (
                  <p className="text-center text-xs text-gray-400 pt-2">
                    {t("tap_forecast_hint", langCode)}
                  </p>
                )}
              </div>
            )}

            {activeTab === "forecast" && (
              <div className="p-4 space-y-4">
                {!selectedCrop ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="font-medium text-gray-600">
                      {t("no_crop_selected", langCode)}
                    </p>
                    <p className="text-sm mt-1">
                      {t("no_crop_selected_desc", langCode)}
                    </p>
                  </div>
                ) : (
                  <>
                    <PriceTrendChart
                      crop={t(CROP_KEYS[selectedCrop] || selectedCrop, langCode)}
                      trendData={trendData}
                      loading={trendLoading}
                    />
                    <div>
                      <p className="text-sm font-bold text-[#1a5c2a] mb-3 px-1">
                        {t("ai_intelligence", langCode)}
                      </p>
                      <AIPriceForecast
                        crop={t(CROP_KEYS[selectedCrop] || selectedCrop, langCode)}
                        forecast={aiForecast}
                        loading={forecastLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <SetAlertModal
          crop={t(CROP_KEYS[alertModal.crop] || alertModal.crop, langCode)}
          currentPrice={alertModal.priceData?.modal_price}
          unit={alertModal.priceData?.unit}
          region={region}
          onClose={() => setAlertModal(null)}
        />
      )}
    </div>
  );
}