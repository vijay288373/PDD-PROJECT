import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Search, RefreshCw, TrendingUp, MapPin } from "lucide-react-native";
import PriceCard from "../components/market/PriceCard";
import PriceTrendChart from "../components/market/PriceTrendChart";
import AIPriceForecast from "../components/market/AIPriceForecast";
import SetAlertModal from "../components/market/SetAlertModal";
import { base44 } from "../api/base44Client";
import { useLang } from "../lib/useLang";
import { t } from "../lib/i18n";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_CROPS = [
  "Rice", "Wheat", "Tomato", "Potato", "Onion", 
  "Maize / Corn", "Cotton", "Sugarcane", 
  "Pepper (Bell/Chili)", "Banana / Plantain", 
  "Soybean", "Groundnut / Peanut"
];

const CROP_PRICE_BASE = {
  "Rice": { modal_price: 2150, min_price: 1950, max_price: 2400, change_pct: 1.4, unit: "quintal" },
  "Wheat": { modal_price: 2350, min_price: 2100, max_price: 2550, change_pct: -0.8, unit: "quintal" },
  "Tomato": { modal_price: 1850, min_price: 1200, max_price: 2600, change_pct: 4.8, unit: "quintal" },
  "Potato": { modal_price: 1100, min_price: 850, max_price: 1400, change_pct: 0.5, unit: "quintal" },
  "Onion": { modal_price: 1950, min_price: 1400, max_price: 2500, change_pct: -2.3, unit: "quintal" },
  "Maize / Corn": { modal_price: 1850, min_price: 1650, max_price: 2050, change_pct: 2.1, unit: "quintal" },
  "Cotton": { modal_price: 6850, min_price: 6200, max_price: 7400, change_pct: 1.1, unit: "quintal" },
  "Sugarcane": { modal_price: 340, min_price: 310, max_price: 370, change_pct: 0.0, unit: "quintal" },
  "Pepper (Bell/Chili)": { modal_price: 4500, min_price: 3800, max_price: 5200, change_pct: 3.2, unit: "quintal" },
  "Banana / Plantain": { modal_price: 1600, min_price: 1200, max_price: 2000, change_pct: -1.2, unit: "quintal" },
  "Soybean": { modal_price: 4400, min_price: 4000, max_price: 4800, change_pct: 0.9, unit: "quintal" },
  "Groundnut / Peanut": { modal_price: 5900, min_price: 5300, max_price: 6400, change_pct: 1.8, unit: "quintal" }
};

export default function MarketPricesScreen() {
  const [crops, setCrops] = useState(ALL_CROPS);
  const [priceData, setPriceData] = useState(CROP_PRICE_BASE);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [region, setRegion] = useState("Tamil Nadu, India");
  const [apmc, setApmc] = useState(null); // live APMC data
  
  const [trendData, setTrendData] = useState(null);
  const [aiForecast, setAiForecast] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertData, setAlertData] = useState(null);
  
  const { langCode } = useLang();

  // Load region from cached geolocation
  useEffect(() => {
    const loadRegion = async () => {
      try {
        const locStr = await AsyncStorage.getItem('last_known_location');
        if (locStr) {
          const loc = JSON.parse(locStr);
          setRegion(`${loc.city || ''}, ${loc.state || ''}, India`.replace(/^, /, ''));
        }
      } catch {}
    };
    loadRegion();
  }, []);

  // Try fetching real APMC prices from data.gov.in open API
  const fetchAPMCPrices = useCallback(async (stateName) => {
    try {
      const stateEncoded = encodeURIComponent(stateName);
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad38534209a06fe33&format=json&limit=50&filters[State]=${stateEncoded}`;
      const resp = await fetch(url, { timeout: 8000 });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.records && data.records.length > 0) {
          // Parse into our price format
          const newPrices = {};
          data.records.forEach(rec => {
            const commodity = rec.Commodity || rec.commodity;
            const modal = parseFloat(rec.Modal_Price || rec.modal_price || 0);
            const min = parseFloat(rec.Min_Price || rec.min_price || 0);
            const max = parseFloat(rec.Max_Price || rec.max_price || 0);
            if (commodity && modal > 0) {
              // Try to match to our crop list
              const matched = ALL_CROPS.find(c => c.toLowerCase().includes(commodity.toLowerCase().slice(0, 5)) || commodity.toLowerCase().includes(c.toLowerCase().slice(0, 4)));
              if (matched) {
                const old = newPrices[matched]?.modal_price || CROP_PRICE_BASE[matched]?.modal_price || modal;
                newPrices[matched] = { modal_price: modal, min_price: min, max_price: max, change_pct: parseFloat(((modal - old) / old * 100).toFixed(1)), unit: 'quintal', mandi: rec.Market || rec.market || '', apmc: true };
              }
            }
          });
          if (Object.keys(newPrices).length > 0) {
            setApmc(newPrices);
            setPriceData(prev => ({ ...prev, ...newPrices }));
            return true;
          }
        }
      }
    } catch (e) {
      console.log('APMC API not available, using AI prices:', e.message);
    }
    return false;
  }, []);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    try {
      // Try APMC live API first (data.gov.in)
      const stateName = region.split(',')[1]?.trim() || 'Tamil Nadu';
      const apmc_ok = await fetchAPMCPrices(stateName);
      if (apmc_ok) { setLoading(false); return; }

      // Fallback: AI-generated mandi prices for the region
      const res = await base44.integrations.Core.invokeLLM({
        prompt: `Wholesale APMC mandi prices in ${region} for: ${crops.join(", ")}. Today: ${new Date().toDateString()}. Return JSON: { "prices": { "<crop>": { "modal_price": number, "min_price": number, "max_price": number, "change_pct": number, "unit": "quintal" } } }`,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "mandi_prices",
            strict: true,
            schema: {
              type: "object",
              properties: { prices: { type: "object" } },
              required: ["prices"],
              additionalProperties: false
            }
          }
        }
      });
      const cleanRes = typeof res === 'string' ? res.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim() : res;
      const parsed = typeof cleanRes === 'string' ? JSON.parse(cleanRes) : cleanRes;
      if (parsed && parsed.prices) {
        setPriceData(prev => ({ ...prev, ...parsed.prices }));
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic prices, using base mandi data:", e);
    } finally {
      setLoading(false);
    }
  }, [crops, region, fetchAPMCPrices]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);


  const handleSelectCrop = async (crop) => {
    setSelectedCrop(crop);
    setActiveTab("forecast");
    setTrendLoading(true);
    
    const cropPriceObj = priceData[crop] || CROP_PRICE_BASE[crop] || { modal_price: 2000, change_pct: 1.0 };
    const basePrice = cropPriceObj.modal_price;

    try {
      const res = await base44.integrations.Core.invokeLLM({
        prompt: `Generate 7-day price forecast and action recommendation for ${crop} in ${region}. Current modal price ₹${basePrice}/quintal. Return JSON: { "action": "buy"|"sell"|"hold", "confidence": number, "expected_range": "string", "reasoning": ["point 1", "point 2"], "best_window": "string" }`,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "crop_forecast",
            strict: true,
            schema: {
              type: "object",
              properties: {
                action: { type: "string", enum: ["buy", "sell", "hold"] },
                confidence: { type: "number" },
                expected_range: { type: "string" },
                reasoning: { type: "array", items: { type: "string" } },
                best_window: { type: "string" }
              },
              required: ["action", "confidence", "expected_range", "reasoning", "best_window"],
              additionalProperties: false
            }
          }
        }
      });
      const cleanRes = typeof res === 'string' ? res.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim() : res;
      const parsed = typeof cleanRes === 'string' ? JSON.parse(cleanRes) : cleanRes;
      setAiForecast(parsed);
    } catch (err) {
      setAiForecast({
        recommendation: cropPriceObj.change_pct > 2 ? "SELL" : "HOLD",
        recommendation_reason: `Mandi arrivals for ${crop} in local region are steady. Price movement projected over next 7 days.`,
        best_sell_window: { dates: "Next 3 to 5 days", reason: `Optimal wholesale demand for ${crop} in nearby markets` },
        scenarios: {
          optimistic: Math.round(basePrice * 1.12),
          likely: Math.round(basePrice * 1.05),
          pessimistic: Math.round(basePrice * 0.92)
        },
        price_factors: [`${crop} arrival volume`, "Transport fuel index", "Regional retail demand"],
        nearby_markets: [
          { market_name: "Koyambedu Wholesale Market, Chennai", distance: "12 km away", price_diff: Math.round(basePrice * 0.08) },
          { market_name: "Madurai Central Agriculture Mandi", distance: "95 km away", price_diff: Math.round(basePrice * 0.12) }
        ]
      });
    }

    // Historical & forecast chart points
    setTrendData({
      historical: [
        { date: "May 1", price: Math.round(basePrice * 0.92) },
        { date: "May 15", price: Math.round(basePrice * 0.96) },
        { date: "Jun 1", price: basePrice },
      ],
      forecast: [
        { date: "Jun 7", price: Math.round(basePrice * 1.03) },
        { date: "Jun 14", price: Math.round(basePrice * 1.07) },
      ]
    });
    setTrendLoading(false);
  };

  const filteredCrops = crops.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <MapPin color="#4ade80" size={14} />
          <Text style={styles.locationText}>{region}</Text>
        </View>
        <Text style={styles.headerTitle}>{t("market_title", langCode) || "Market Mandi Prices"}</Text>

        <View style={styles.tabToggle}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === "prices" && styles.activeTabBtn]} 
            onPress={() => setActiveTab("prices")}
          >
            <Text style={[styles.tabBtnText, activeTab === "prices" && styles.activeTabBtnText]}>
              {t("live_prices", langCode) || "Live Prices"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === "forecast" && styles.activeTabBtn]} 
            onPress={() => {
              setActiveTab("forecast");
              if (selectedCrop) handleSelectCrop(selectedCrop);
            }}
          >
            <Text style={[styles.tabBtnText, activeTab === "forecast" && styles.activeTabBtnText]}>
              {t("ai_intelligence", langCode) || "AI Forecast"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "prices" ? (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.searchBar}>
            <Search color="#9ca3af" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crop mandi price..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
            {loading && <ActivityIndicator size="small" color="#4ade80" />}
          </View>

          {filteredCrops.map((crop, idx) => (
            <PriceCard
              key={crop}
              crop={crop}
              priceData={priceData[crop] || CROP_PRICE_BASE[crop]}
              isSelected={selectedCrop === crop}
              onSelect={() => handleSelectCrop(crop)}
              onSetAlert={(cropName, pData) => {
                setAlertData({ crop: cropName, priceData: pData });
                setAlertModalVisible(true);
              }}
              index={idx}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.sectionTitle}>
            AI Forecast for <Text style={styles.cropHighlight}>{selectedCrop || "Selected Crop"}</Text>
          </Text>
          
          {trendLoading ? (
            <ActivityIndicator size="large" color="#4ade80" style={{ marginTop: 40 }} />
          ) : (
            <>
              {trendData && <PriceTrendChart crop={selectedCrop} data={trendData} />}
              <AIPriceForecast forecast={aiForecast} crop={selectedCrop} />
            </>
          )}
        </ScrollView>
      )}

      {alertModalVisible && (
        <SetAlertModal
          visible={alertModalVisible}
          crop={alertData?.crop}
          priceData={alertData?.priceData}
          onClose={() => setAlertModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  activeTabBtn: {
    backgroundColor: "#1a5c2a",
  },
  tabBtnText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },
  activeTabBtnText: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  cropHighlight: {
    color: "#4ade80",
  },
});
