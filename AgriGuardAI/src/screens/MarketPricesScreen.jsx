import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, RefreshControl } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { Search, MapPin, RefreshCw } from "lucide-react-native";
import PriceCard from "../components/market/PriceCard";
import PriceTrendChart from "../components/market/PriceTrendChart";
import AIPriceForecast from "../components/market/AIPriceForecast";
import SetAlertModal from "../components/market/SetAlertModal";
import { base44 } from "../api/base44Client";
import { useLang } from "../lib/useLang";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLiveAPMCPrices } from "../api/apmcClient";

const ALL_CROPS = [
  "Rice", "Tomato", "Potato", "Wheat", "Onion", 
  "Cotton", "Maize / Corn", "Sugarcane", 
  "Turmeric", "Pepper (Bell/Chili)", "Banana / Plantain", 
  "Coconut", "Groundnut / Peanut", "Soybean", "Chickpea", "Apple", "Millet"
];

const SUPA_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';

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
    const profStr = await AsyncStorage.getItem('agriguard_profile');
    if (profStr) {
      const prof = JSON.parse(profStr);
      const extracted = extractNames(prof.myCrops || prof.primary_crops || prof.crops);
      if (extracted.length > 0) crops = extracted;
    }
  } catch {}

  if (!crops || crops.length === 0) {
    try {
      const profStr = await AsyncStorage.getItem('agriguard_farmer_profile');
      if (profStr) {
        const prof = JSON.parse(profStr);
        const extracted = extractNames(prof.primary_crops || prof.myCrops || prof.crops);
        if (extracted.length > 0) crops = extracted;
      }
    } catch {}
  }

  if (!crops || crops.length === 0) {
    try {
      const myCropsStr = await AsyncStorage.getItem('agriguard_my_crops');
      if (myCropsStr) {
        const arr = JSON.parse(myCropsStr);
        const extracted = extractNames(arr);
        if (extracted.length > 0) crops = extracted;
      }
    } catch {}
  }

  if (!crops || crops.length === 0) {
    try {
      const email = userEmail || 'farmer1@test.com';
      const res = await fetch(`${SUPA_URL}/rest/v1/FarmerProfile?uid=eq.${encodeURIComponent(email)}`, { headers: supaHeaders() });
      if (res.ok) {
        const rows = await res.json();
        if (rows[0]) {
          const extracted = extractNames(rows[0].primary_crops || rows[0].myCrops || rows[0].crops);
          if (extracted.length > 0) crops = extracted;
        }
      }
    } catch {}
  }

  if (!crops || crops.length === 0) {
    crops = ["Rice", "Tomato", "Potato"];
  }

  return crops;
}

export default function MarketPricesScreen() {
  const [userCrops, setUserCrops] = useState(["Rice", "Tomato", "Potato"]);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [priceData, setPriceData] = useState({});
  const [mandiName, setMandiName] = useState("Koyambedu APMC Mandi");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [region, setRegion] = useState("Chennai, Tamil Nadu, India");
  
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertData, setAlertData] = useState(null);

  const loadMarketData = useCallback(async (regionVal, cropsList) => {
    setLoading(true);
    try {
      const apmcResult = await fetchLiveAPMCPrices(regionVal, cropsList);
      if (apmcResult && apmcResult.prices) {
        setPriceData(apmcResult.prices);
        if (apmcResult.mandi_name) setMandiName(apmcResult.mandi_name);
      }
    } catch (e) {
      console.log("Error loading APMC market prices on mobile:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const initCrops = async () => {
        let email = null;
        let reg = region;
        try {
          const user = await base44.auth.me();
          email = user?.email;
        } catch {}

        try {
          const locStr = await AsyncStorage.getItem('last_known_location');
          if (locStr) {
            const loc = JSON.parse(locStr);
            reg = `${loc.city || ''}, ${loc.state || ''}, India`.replace(/^, /, '');
            setRegion(reg);
          }
        } catch {}

        const myCropsList = await getUserMyCrops(email);
        if (isMounted) {
          setUserCrops(myCropsList);
          if (myCropsList.length > 0) setSelectedCrop(myCropsList[0]);
          loadMarketData(reg, myCropsList);
        }
      };
      initCrops();
      return () => { isMounted = false; };
    }, [loadMarketData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketData(region, showAllCrops ? ALL_CROPS : userCrops);
    setRefreshing(false);
  };

  const activeCropsList = showAllCrops || search.trim().length > 0 ? ALL_CROPS : userCrops;

  const filteredCrops = activeCropsList.filter(crop =>
    crop.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAlert = (crop, priceInfo) => {
    setAlertData({
      crop,
      currentPrice: priceInfo?.modal_price,
      unit: priceInfo?.unit || "quintal",
      region: region
    });
    setAlertModalVisible(true);
  };

  const handleSelectCropForForecast = (crop) => {
    setSelectedCrop(crop);
    setActiveTab("forecast");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <MapPin color="#4ade80" size={14} />
          <Text style={styles.locationText}>{region} • {mandiName}</Text>
        </View>
        <Text style={styles.title}>Mandi Prices (APMC Agmarknet)</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "prices" && styles.activeTabBtn]}
            onPress={() => setActiveTab("prices")}
          >
            <Text style={[styles.tabBtnText, activeTab === "prices" && styles.activeTabBtnText]}>
              Live APMC Prices
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "forecast" && styles.activeTabBtn]}
            onPress={() => setActiveTab("forecast")}
          >
            <Text style={[styles.tabBtnText, activeTab === "forecast" && styles.activeTabBtnText]}>
              AI Forecast
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {activeTab === "prices" ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4ade80" />}
        >
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Search color="#9ca3af" size={18} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crop mandi price..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* My Crops / All Crops Toggle Bar */}
          <View style={styles.toggleBar}>
            <Text style={styles.toggleLabel}>
              {showAllCrops ? "Showing All Mandi Crops (APMC)" : `My Crops (${userCrops.length})`}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const next = !showAllCrops;
                setShowAllCrops(next);
                loadMarketData(region, next ? ALL_CROPS : userCrops);
              }}
              style={styles.toggleBtn}
            >
              <Text style={styles.toggleBtnText}>
                {showAllCrops ? "Show My Crops Only" : "Show All Crops"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cards List */}
          {loading ? (
            <ActivityIndicator size="large" color="#4ade80" style={{ marginTop: 40 }} />
          ) : (
            filteredCrops.map(crop => (
              <PriceCard
                key={crop}
                crop={crop}
                priceInfo={priceData[crop]}
                onSetAlert={() => handleOpenAlert(crop, priceData[crop])}
                onSelect={() => handleSelectCropForForecast(crop)}
              />
            ))
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Crop Selector Strip in Mobile AI Forecast */}
          <View style={styles.cropStripContainer}>
            <Text style={styles.cropStripLabel}>SELECT CROP FOR APMC MARKET FORECAST:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropStripScroll}>
              {ALL_CROPS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCrop(c)}
                  style={[styles.cropPill, selectedCrop === c && styles.activeCropPill]}
                >
                  <Text style={[styles.cropPillText, selectedCrop === c && styles.activeCropPillText]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.forecastHeader}>
            APMC Market Forecast: <Text style={{ color: "#4ade80" }}>{selectedCrop}</Text>
          </Text>

          <PriceTrendChart crop={selectedCrop} />
          <AIPriceForecast crop={selectedCrop} />

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Set Alert Modal */}
      {alertData && (
        <SetAlertModal
          visible={alertModalVisible}
          crop={alertData.crop}
          currentPrice={alertData.currentPrice}
          unit={alertData.unit}
          region={alertData.region}
          onClose={() => setAlertModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#052e16",
  },
  header: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#052e16",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTabBtn: {
    backgroundColor: "#166534",
  },
  tabBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 13,
  },
  activeTabBtnText: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    backgroundColor: "#052e16",
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.2)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },
  toggleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  toggleLabel: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "bold",
  },
  toggleBtn: {
    backgroundColor: "rgba(74,222,128,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleBtnText: {
    color: "#86efac",
    fontSize: 11,
    fontWeight: "600",
  },
  cropStripContainer: {
    marginVertical: 12,
  },
  cropStripLabel: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cropStripScroll: {
    gap: 8,
  },
  cropPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
  },
  activeCropPill: {
    backgroundColor: "#4ade80",
    borderColor: "#86efac",
  },
  cropPillText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeCropPillText: {
    color: "#052e16",
  },
  forecastHeader: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
});
