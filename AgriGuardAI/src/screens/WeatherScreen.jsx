import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import WeatherHeader from '../components/weather/WeatherHeader';
import ForecastStrip from '../components/weather/ForecastStrip';
import CropImpactPanel from '../components/weather/CropImpactPanel';
import WeatherHistoryChart from '../components/weather/WeatherHistoryChart';
import PrecautionsPanel from '../components/weather/PrecautionsPanel';
import { base44 } from '../api/base44Client';
import { useLang } from '../lib/useLang';
import { t } from '../lib/i18n';
import { getPrecisionLocation, getGeocodedLocation } from '../lib/location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TABS = ["Overview", "Crop Impact", "Precautions", "History"];

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

  // 1. Check Mobile Profile Key ('agriguard_profile')
  try {
    const profStr = await AsyncStorage.getItem('agriguard_profile');
    if (profStr) {
      const prof = JSON.parse(profStr);
      const extracted = extractNames(prof.myCrops || prof.primary_crops || prof.crops);
      if (extracted.length > 0) crops = extracted;
    }
  } catch {}

  // 2. Check Web Profile Key ('agriguard_farmer_profile')
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

  // 3. Check 'agriguard_my_crops'
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

  // 4. Query Supabase Cloud FarmerProfile
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

export default function WeatherScreen() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [cropImpact, setCropImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState(null);
  const [userCrops, setUserCrops] = useState(["Rice", "Tomato", "Potato"]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { langCode } = useLang();

  const fetchRealWeather = useCallback(async (lat = 13.0827, lon = 80.2707, locName = "Chennai District, Tamil Nadu, India") => {
    setLoading(true);
    let openMeteoData = null;

    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,precipitation_sum&timezone=auto`;
      const openMeteoResp = await fetch(openMeteoUrl);
      if (openMeteoResp.ok) {
        openMeteoData = await openMeteoResp.json();
      }
    } catch {}

    const cur = openMeteoData?.current || {
      temperature_2m: 30.5,
      apparent_temperature: 33.0,
      relative_humidity_2m: 63,
      precipitation: 0.0,
      wind_speed_10m: 12.5
    };
    const daily = openMeteoData?.daily || {
      time: Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0];
      }),
      temperature_2m_max: [32, 33, 31, 30, 32, 33, 34],
      temperature_2m_min: [22, 23, 22, 21, 22, 23, 24],
      precipitation_probability_max: [10, 20, 60, 45, 10, 5, 0],
      uv_index_max: [7.5, 8.0, 5.5, 6.0, 7.5, 8.5, 9.0],
      precipitation_sum: [0, 0, 4.5, 2.1, 0, 0, 0]
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    const constructedForecast = (daily.time || []).map((tStr, i) => {
      const d = new Date(tStr || today);
      const prob = daily.precipitation_probability_max?.[i] || 10;
      return {
        day: daysOfWeek[d.getDay()],
        date: `${months[d.getMonth()]} ${d.getDate()}`,
        temp_high: Math.round(daily.temperature_2m_max?.[i] || 32),
        temp_low: Math.round(daily.temperature_2m_min?.[i] || 22),
        rain_prob: prob,
        rainfall_mm: daily.precipitation_sum?.[i] || 0,
        condition: prob > 50 ? "rainy" : prob > 30 ? "cloudy" : "sunny",
        humidity: Math.round(cur.relative_humidity_2m || 63),
        wind_kmh: Math.round(cur.wind_speed_10m || 12.5),
        uv_index: daily.uv_index_max?.[i] || 7.5
      };
    });

    const weatherResult = {
      location_name: locName,
      current: {
        temp_c: Math.round(cur.temperature_2m * 10) / 10,
        feels_like_c: Math.round(cur.apparent_temperature * 10) / 10,
        humidity: Math.round(cur.relative_humidity_2m),
        wind_kmh: Math.round(cur.wind_speed_10m * 10) / 10,
        uv_index: daily.uv_index_max?.[0] || 7.5,
        rainfall_mm: cur.precipitation || 0,
        soil_moisture: "normal",
        condition: (daily.precipitation_probability_max?.[0] || 0) > 50 ? "rainy" : "sunny",
        description: "Clear Sky And Comfortable. Optimal Weather For Agronomic Field Operations."
      },
      forecast: constructedForecast
    };

    setWeather(weatherResult);
    setForecast(constructedForecast);
    setLastUpdated(new Date());
    setLoading(false);
    return weatherResult;
  }, []);

  const runCropImpactAnalysis = useCallback((weatherData, crops) => {
    setAnalyzing(true);
    const region = location?.formatted || "Chennai District, Tamil Nadu, India";
    const w = weatherData?.current;

    const impacts = crops.map(crop => {
      let riskLevel = "low";
      let summary = `Favorable weather (Temp ${w?.temp_c || 30}°C, Humidity ${w?.humidity || 63}%) supports healthy vegetative growth for ${crop}.`;
      let actions = [`Inspect lower leaves of ${crop} for early fungal/pest signs`, "Verify soil moisture at root zone before morning watering"];
      let best = ["Weed removal along plot borders", "Apply organic vermicompost or foliar nourishment"];
      let waterChange = "maintain";

      if ((w?.humidity || 63) > 75 || (w?.rainfall_mm || 0) > 5) {
        riskLevel = "medium";
        summary = `High humidity/rainfall increases blight and fungal spore risk for ${crop}. Ensure field drainage.`;
        actions = [`Spray organic Neem oil (1%) to prevent fungal spores on ${crop}`, "Ensure drainage channels are clear"];
        waterChange = "decrease";
      }

      return {
        crop,
        risk_level: riskLevel,
        impact_summary: summary,
        irrigation_change: waterChange,
        irrigation_pct: waterChange === "decrease" ? 20 : 0,
        immediate_actions: actions,
        best_activities: best,
      };
    });

    setCropImpact({
      overall_risk: "low",
      summary: `Current weather conditions in ${region} are optimal for your active crops (${crops.join(', ')}).`,
      crop_impacts: impacts,
      precautions: {
        immediate: ["Ensure field furrows are clear to handle potential rainfall", "Inspect yellow sticky traps for insect pest vectors"],
        this_week: ["Apply organic Neem oil spray (1%) on vulnerable crop leaves", "Maintain balanced N-P-K fertigation schedule"],
        monitor: ["Watch for humidity spikes above 80% which encourage fungal spores", "Track 7-day weather forecast daily"]
      }
    });
    setAnalyzing(false);
  }, [location]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadScreenData = async () => {
        let lat = 13.0827;
        let lon = 80.2707;
        let locName = "Chennai District, Tamil Nadu, India";

        try {
          const coords = await getPrecisionLocation();
          if (coords) {
            lat = coords.latitude;
            lon = coords.longitude;
            const geo = await getGeocodedLocation(lat, lon);
            if (geo && isMounted) {
              locName = geo.formatted;
              setLocation(geo);
            }
          }
        } catch {}

        let userEmail = null;
        try {
          const u = await base44.auth.me();
          userEmail = u.email;
        } catch {}

        const crops = await getUserMyCrops(userEmail);
        if (isMounted) setUserCrops(crops);

        const wData = await fetchRealWeather(lat, lon, locName);
        if (wData && isMounted) {
          runCropImpactAnalysis(wData, crops);
        }
      };
      loadScreenData();
      return () => { isMounted = false; };
    }, [fetchRealWeather, runCropImpactAnalysis])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const lat = location?.latitude || 13.0827;
    const lon = location?.longitude || 80.2707;
    const locName = location?.formatted || "Chennai District, Tamil Nadu, India";
    const wData = await fetchRealWeather(lat, lon, locName);
    if (wData) runCropImpactAnalysis(wData, userCrops);
    setRefreshing(false);
  }, [location, userCrops, fetchRealWeather, runCropImpactAnalysis]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4ade80" />
        }
      >
        {/* Header */}
        <WeatherHeader
          weather={weather}
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
        />

        {/* Tab bar */}
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content based on tab */}
        <View style={styles.content}>
          {activeTab === "Overview" && (
            <ForecastStrip forecast={forecast} loading={loading} />
          )}

          {activeTab === "Crop Impact" && (
            <CropImpactPanel
              cropImpact={cropImpact}
              analyzing={analyzing}
              userProfile={{ primary_crops: userCrops }}
            />
          )}

          {activeTab === "Precautions" && (
            <PrecautionsPanel
              cropImpact={cropImpact}
              precautions={cropImpact?.precautions}
              analyzing={analyzing}
            />
          )}

          {activeTab === "History" && (
            <WeatherHistoryChart />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#052e16',
  },
  tabBar: {
    backgroundColor: '#052e16',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  activeTab: {
    backgroundColor: '#4ade80',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#052e16',
    fontWeight: 'bold',
  },
  content: {
    paddingBottom: 100,
  },
});
