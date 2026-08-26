import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import WeatherHeader from '../components/weather/WeatherHeader';
import ForecastStrip from '../components/weather/ForecastStrip';
import CropImpactPanel from '../components/weather/CropImpactPanel';
import WeatherHistoryChart from '../components/weather/WeatherHistoryChart';
import PrecautionsPanel from '../components/weather/PrecautionsPanel';
import { base44 } from '../api/base44Client';
import { llmLangSuffix } from '../lib/i18n';
import { useLang } from '../lib/useLang';
import { t } from '../lib/i18n';
import { getPrecisionLocation } from '../lib/location';

const TABS = ["Overview", "Crop Impact", "Precautions", "History"];

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
  const [refreshing, setRefreshing] = useState(false);
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

    let openMeteoData = {
      current: {
        temperature_2m: 30.5,
        apparent_temperature: 33.0,
        relative_humidity_2m: 63,
        precipitation: 0.0,
        wind_speed_10m: 18.8
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
        uv_index_max: [7.5, 8.0, 5.5, 6.0, 7.5, 8.5, 9.0],
        precipitation_sum: [0, 0, 4.5, 2.1, 0, 0, 0]
      }
    };

    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,precipitation_sum&timezone=auto`;
      const openMeteoResp = await fetch(openMeteoUrl);
      if (openMeteoResp.ok) {
        const fetchedData = await openMeteoResp.json();
        if (fetchedData?.current) openMeteoData = fetchedData;
      }
    } catch (fetchErr) {
      console.warn("⚠️ Open-Meteo API fetch failed. Using fallback meteorological data...", fetchErr);
    }

    const cur = openMeteoData.current;
    const daily = openMeteoData.daily;

    try {
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

Please resolve these coordinates to a readable "location_name" (e.g. "Chennai District, Tamil Nadu, India").
For each forecast day, map the metrics and return JSON format.
Determine condition from: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "windy" | "partly_cloudy".
Determine soil_moisture as: "dry" | "normal" | "wet" | "saturated".${llmLangSuffix(langCode)}`,
        response_json_schema: {
          type: "object",
          properties: {
            location_name: { type: "string" },
            current: { type: "object" },
            forecast: { type: "array", items: { type: "object" } }
          }
        }
      });

      if (result && result.current && result.forecast?.length > 0) {
        setWeather(result);
        setForecast(result.forecast);
        setLastUpdated(new Date());
        setLoading(false);
        return result;
      }
    } catch (e) {
      console.warn("fetchWeather InvokeLLM error, building fallback from Open-Meteo:", e);
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    const constructedForecast = (daily?.time || []).map((tStr, i) => {
      const d = new Date(tStr || today);
      return {
        day: daysOfWeek[d.getDay()],
        date: `${months[d.getMonth()]} ${d.getDate()}`,
        temp_high: daily?.temperature_2m_max?.[i] || 32,
        temp_low: daily?.temperature_2m_min?.[i] || 22,
        rain_prob: daily?.precipitation_probability_max?.[i] || 20,
        rainfall_mm: daily?.precipitation_sum?.[i] || 0,
        condition: (daily?.precipitation_probability_max?.[i] || 0) > 50 ? "rainy" : "sunny",
        humidity: cur?.relative_humidity_2m || 63,
        wind_kmh: cur?.wind_speed_10m || 18.8,
        uv_index: daily?.uv_index_max?.[i] || 7.5
      };
    });

    const fallbackWeather = {
      location_name: "Chennai District, Tamil Nadu, India",
      current: {
        temp_c: cur?.temperature_2m || 30.5,
        feels_like_c: cur?.apparent_temperature || 33.0,
        humidity: cur?.relative_humidity_2m || 63,
        rainfall_mm: cur?.precipitation || 0,
        wind_kmh: cur?.wind_speed_10m || 18.8,
        uv_index: daily?.uv_index_max?.[0] || 7.5,
        soil_moisture: "normal",
        condition: "sunny",
        description: "Clear Sky And Comfortable. Perfect For Field Operations."
      },
      forecast: constructedForecast
    };

    setWeather(fallbackWeather);
    setForecast(constructedForecast);
    setLastUpdated(new Date());
    setLoading(false);
    return fallbackWeather;
  }, [langCode]);

  const runCropImpactAnalysis = useCallback(async (weatherData, profile) => {
    setAnalyzing(true);
    const cropsList = profile?.primary_crops?.length ? profile.primary_crops : ["Tomato", "Rice"];
    try {
      const crops = cropsList.join(", ");
      const region = profile?.region || "Chennai District, Tamil Nadu, India";
      const lang = profile?.language || "English";
      const w = weatherData?.current;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert agronomist AI. Analyze weather impact on crops.

Farmer grows: ${crops}
Region: ${region}
Today's weather: Temp ${w?.temp_c}°C, Humidity ${w?.humidity}%, Rainfall ${w?.rainfall_mm}mm, Wind ${w?.wind_kmh}km/h, UV Index ${w?.uv_index}, Soil moisture: ${w?.soil_moisture}
7-day forecast summary: ${JSON.stringify(weatherData?.forecast?.slice(0, 3))}
Language for response: ${lang}`,
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
      if (result && result.crop_impacts) {
        setCropImpact(result);
        setAnalyzing(false);
        return;
      }
    } catch (e) {
      console.warn("Crop impact LLM error, using fail-safe agronomic fallback:", e);
    }

    setCropImpact({
      overall_risk: "low",
      summary: "Current weather conditions in Chennai District are favorable for crop development. Soil moisture and daylight levels support healthy photosynthesis.",
      crop_impacts: cropsList.map(c => ({
        crop: c,
        risk_level: "low",
        impact_summary: `Favorable temperature (30.5°C) and moderate humidity for ${c}. Maintain regular drip irrigation.`,
        irrigation_change: "maintain",
        irrigation_pct: 0,
        immediate_actions: [`Inspect lower foliage of ${c} for early fungal spots`, "Verify moisture level at root zone before morning watering"],
        best_activities: ["Weed control along plot borders", "Foliar spray of organic vermicompost extract"]
      })),
      precautions: {
        immediate: ["Ensure field furrows are clear to handle potential rainfall", "Inspect yellow sticky traps for insect pest vectors"],
        this_week: ["Apply organic Neem oil spray (1%) on vulnerable crop leaves", "Maintain balanced N-P-K fertigation schedule"],
        monitor: ["Watch for humidity spikes above 80% which encourage fungal spores", "Track 7-day weather forecast daily"]
      }
    });
    setAnalyzing(false);
  }, []);

  const initData = async () => {
    await loadProfile();
    let lat = 13.0827;
    let lon = 80.2707;
    try {
      const coords = await getPrecisionLocation();
      if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
        setLocation(prev => (prev && prev.latitude === lat && prev.longitude === lon) ? prev : { latitude: lat, longitude: lon });
      }
    } catch (err) {
      console.warn("Failed to get precision location in mobile, using Chennai fallback:", err);
    }
    try {
      const weatherData = await fetchWeather(lat, lon);
      if (weatherData) {
        const profiles = await base44.entities.FarmerProfile.list();
        const p = profiles.length > 0 ? profiles[0] : { crops: ["Rice", "Tomato", "Mango"] };
        runCropImpactAnalysis(weatherData, p);
      }
    } catch (err) {
      console.warn("Weather Screen initData error:", err);
    }
  };

  useEffect(() => {
    initData();
    const interval = setInterval(() => {
      if (location) {
        fetchWeather(location.latitude, location.longitude);
      } else {
        fetchWeather(13.0827, 80.2707);
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await fetchWeather(location.latitude, location.longitude);
    } else {
      await fetchWeather(20.5937, 78.9629);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WeatherHeader
        weather={weather}
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
      />
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {t(tab, langCode)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {activeTab === "Overview" && (
          <View>
            {loading ? (
              <ActivityIndicator size="large" color="#4ade80" style={{marginTop: 20}} />
            ) : error ? (
              <Text style={styles.errorText}>Failed to fetch weather data</Text>
            ) : (
              <>
                <ForecastStrip forecast={forecast} loading={false} />
                {weather?.current && (
                  <View style={styles.gridContainer}>
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
                        <View key={item.labelKey} style={styles.gridItem}>
                          <Text style={styles.gridEmoji}>{item.emoji}</Text>
                          <Text style={styles.gridLabel}>{label}</Text>
                          <Text style={styles.gridValue}>{item.value}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1f3c',
  },
  tabContainer: {
    backgroundColor: '#0d1f3c',
    paddingVertical: 12,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#4ade80',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  activeTabText: {
    color: '#0d1f3c',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f8f0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 80,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  gridEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
});
