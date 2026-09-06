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
import { fetchLiveAPMCPrices } from "@/api/apmcClient";

const ALL_CROPS = [
  "Rice", "Tomato", "Potato", "Wheat", "Onion", 
  "Cotton", "Maize / Corn", "Sugarcane", 
  "Turmeric", "Pepper (Bell/Chili)", "Banana / Plantain", 
  "Coconut", "Groundnut / Peanut", "Soybean", "Chickpea", "Apple", "Millet"
];

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';

function supaHeaders() {
  return {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function getUserMyCrops(userEmail) {
  let crops = [];

  const extractNames = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(c => {
      if (typeof c === 'string') return c;
      if (c && typeof c === 'object') return c.name || c.id || c.crop || c.cropName || '';
      return '';
    }).filter(Boolean);
  };

  try {
    const profStr = localStorage.getItem('agriguard_farmer_profile');
    if (profStr) {
      const prof = JSON.parse(profStr);
      const extracted = extractNames(prof.primary_crops || prof.myCrops || prof.crops);
      if (extracted.length > 0) crops = extracted;
    }
  } catch {}

  if (!crops || crops.length === 0) {
    try {
      if (userEmail) {
        const res = await fetch(`${SUPA_URL}/rest/v1/FarmerProfile?uid=eq.${encodeURIComponent(userEmail)}&order=created_date.asc&limit=1`, { headers: supaHeaders() });
        if (res.ok) {
          const rows = await res.json();
          if (rows[0]) {
            const extracted = extractNames(rows[0].primary_crops || rows[0].myCrops || rows[0].crops);
            if (extracted.length > 0) crops = extracted;
          }
        }
      }
    } catch {}
  }

  if (!crops || crops.length === 0) {
    try {
      const local = localStorage.getItem('agriguard_my_crops');
      if (local) {
        const arr = JSON.parse(local);
        const extracted = extractNames(arr);
        if (extracted.length > 0) crops = extracted;
      }
    } catch {}
  }

  if (!crops || crops.length === 0) {
    crops = ["Rice", "Tomato", "Potato"];
  }

  return crops;
}

export default function MarketPrices() {
  const [userProfile, setUserProfile] = useState(null);
  const [userCrops, setUserCrops] = useState(["Rice", "Tomato", "Potato"]);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [priceData, setPriceData] = useState({});
  const [mandiName, setMandiName] = useState("Koyambedu APMC Mandi");
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [alertModal, setAlertModal] = useState(null);
  const [activeTab, setActiveTab] = useState("prices");
  const { langCode } = useLang();

  const loadMarketData = useCallback(async (regionVal, cropsList) => {
    setLoading(true);
    try {
      const apmcResult = await fetchLiveAPMCPrices(regionVal, cropsList);
      if (apmcResult && apmcResult.prices) {
        setPriceData(apmcResult.prices);
        if (apmcResult.mandi_name) setMandiName(apmcResult.mandi_name);
        setLastUpdated(apmcResult.last_updated || new Date());
      }
    } catch (e) {
      console.log("Error loading APMC market prices:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      let regionVal = "Chennai, Tamil Nadu, India";
      let userEmail = null;
      try {
        const user = await base44.auth.me();
        userEmail = user?.email;
      } catch {}

      const cropsList = await getUserMyCrops(userEmail);
      setUserCrops(cropsList);
      if (cropsList.length > 0) setSelectedCrop(cropsList[0]);

      try {
        const coords = await getPrecisionLocation();
        if (coords) {
          const geo = await getGeocodedLocation(coords.latitude, coords.longitude);
          if (geo && geo.formatted) {
            regionVal = geo.formatted;
          }
        }
      } catch {}

      setUserProfile({ region: regionVal });
      loadMarketData(regionVal, cropsList);
    };
    init();
  }, [loadMarketData]);

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    setActiveTab("forecast");
  };

  const activeCropsList = showAllCrops || search.trim().length > 0 ? ALL_CROPS : userCrops;
  const filteredCrops = activeCropsList.filter(crop =>
    crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#052e16] pb-24 text-white">
      {/* Header */}
      <div className="bg-[#052e16] p-4 pt-6 border-b border-green-800/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{userProfile?.region || "Chennai, Tamil Nadu, India"} • {mandiName}</span>
            </div>
            <h1 className="font-bold text-2xl text-white">Mandi Market Prices (APMC Agmarknet)</h1>
          </div>
          <button
            onClick={() => loadMarketData(userProfile?.region || "Tamil Nadu, India", activeCropsList)}
            className="p-2 bg-green-900/60 rounded-xl border border-green-700/40 hover:bg-green-800/60"
          >
            <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search crop mandi price..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-white/10 border-green-800/50 text-white placeholder-gray-400 rounded-xl h-10 text-sm focus:border-green-400"
          />
        </div>

        {/* My Crops / All Crops Toggle Bar */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold text-green-400">
            {showAllCrops ? "Showing All Mandi Crops (APMC)" : `My Crops (${userCrops.length})`}
          </span>
          <button
            onClick={() => {
              const next = !showAllCrops;
              setShowAllCrops(next);
              loadMarketData(userProfile?.region || "Tamil Nadu, India", next ? ALL_CROPS : userCrops);
            }}
            className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-xl font-semibold hover:bg-green-500/30 transition-all"
          >
            {showAllCrops ? "Show My Crops Only" : "Show All Crops"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-[#052e16] px-4 py-3 border-b border-green-900/50">
        <div className="flex gap-2 bg-black/30 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("prices")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "prices" ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Live APMC Prices
          </button>
          <button
            onClick={() => setActiveTab("forecast")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "forecast" ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            AI Market Forecast
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "prices" ? (
          loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-green-950/40 rounded-3xl animate-pulse border border-green-800/30" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCrops.map(crop => (
                <PriceCard
                  key={crop}
                  crop={crop}
                  priceInfo={priceData[crop]}
                  onSetAlert={() => setAlertModal({ crop, priceData: priceData[crop] })}
                  onSelect={() => handleSelectCrop(crop)}
                />
              ))}
            </div>
          )
        ) : (
          <div>
            {/* Horizontal Crop Selection Bar inside AI Forecast Tab */}
            <div className="mb-4">
              <p className="text-xs text-green-400 font-extrabold mb-2 uppercase tracking-wider">Select Crop for APMC Market Forecast:</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {ALL_CROPS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCrop(c)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex-shrink-0 transition-all ${
                      selectedCrop === c
                        ? "bg-[#4ade80] text-[#052e16] shadow-md ring-2 ring-green-300"
                        : "bg-white/10 text-white/80 hover:bg-white/20 border border-green-800/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="font-extrabold text-lg text-white mb-3 flex items-center gap-2">
              <span>APMC Market Intelligence:</span>
              <span className="text-[#4ade80]">{selectedCrop}</span>
            </h2>

            <PriceTrendChart crop={selectedCrop} />
            <AIPriceForecast crop={selectedCrop} />
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <SetAlertModal
          crop={alertModal.crop}
          currentPrice={alertModal.priceData?.modal_price}
          unit={alertModal.priceData?.unit}
          region={userProfile?.region}
          onClose={() => setAlertModal(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}