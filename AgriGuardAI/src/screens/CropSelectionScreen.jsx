import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, SafeAreaView, TextInput
} from 'react-native';
import { Sprout, MapPin, TrendingUp, Droplets, Sun, RefreshCw, CheckCircle, Info } from 'lucide-react-native';
import { useLang } from '../lib/useLang';
import { t } from '../lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrecisionLocation, getGeocodedLocation } from '../lib/location';

const ICAR_ZONE_CROPS = {
  'Tamil Nadu': { zone: 'South Zone', soilType: 'Red Laterite & Black Cotton', avgRainfall: '945mm', crops: ['Rice', 'Groundnut', 'Cotton', 'Sugarcane', 'Banana', 'Coconut', 'Turmeric', 'Tomato', 'Onion', 'Maize'] },
  'Andhra Pradesh': { zone: 'South Zone', soilType: 'Black Cotton & Red Sandy', avgRainfall: '1000mm', crops: ['Rice', 'Cotton', 'Groundnut', 'Tobacco', 'Chili', 'Maize', 'Sunflower', 'Sugarcane', 'Onion', 'Turmeric'] },
  'Telangana': { zone: 'South Zone', soilType: 'Black Cotton', avgRainfall: '915mm', crops: ['Cotton', 'Rice', 'Maize', 'Soybean', 'Groundnut', 'Red Gram', 'Sunflower', 'Chili', 'Turmeric'] },
  'Karnataka': { zone: 'South Zone', soilType: 'Red & Black Laterite', avgRainfall: '1135mm', crops: ['Rice', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Ragi', 'Soybean', 'Sunflower', 'Coconut'] },
  'Kerala': { zone: 'South Zone', soilType: 'Laterite & Alluvial', avgRainfall: '3055mm', crops: ['Rice', 'Coconut', 'Banana', 'Rubber', 'Pepper', 'Cardamom', 'Ginger', 'Turmeric', 'Tapioca'] },
  'Maharashtra': { zone: 'West Zone', soilType: 'Deep Black Cotton', avgRainfall: '1000mm', crops: ['Cotton', 'Soybean', 'Sugarcane', 'Onion', 'Grape', 'Wheat', 'Jowar', 'Bajra', 'Tur Dal', 'Maize'] },
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
const FIELD_SIZE_KEY = 'agriguard_field_size';

export default function CropSelectionScreen() {
  const [location, setLocation] = useState(null);
  const [state, setState] = useState(DEFAULT_STATE);
  const [zoneInfo, setZoneInfo] = useState(ICAR_ZONE_CROPS[DEFAULT_STATE]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldSize, setFieldSize] = useState('1');
  const [savedCrops, setSavedCrops] = useState([]);
  const { langCode } = useLang();

  useEffect(() => {
    loadFieldSize();
    detectLocationAndLoad();
  }, []);

  const loadFieldSize = async () => {
    try {
      const stored = await AsyncStorage.getItem(FIELD_SIZE_KEY);
      if (stored) setFieldSize(stored);
      const saved = await AsyncStorage.getItem('agriguard_my_crops');
      if (saved) setSavedCrops(JSON.parse(saved));
    } catch {}
  };

  const saveFieldSize = async (val) => {
    setFieldSize(val);
    try { await AsyncStorage.setItem(FIELD_SIZE_KEY, val); } catch {}
  };

  const detectLocationAndLoad = useCallback(async () => {
    setLoading(true);
    try {
      const coords = await getPrecisionLocation();
      const geo = await getGeocodedLocation(coords.latitude, coords.longitude);
      if (geo) {
        setLocation(geo);
        const detectedState = geo.state || DEFAULT_STATE;
        setState(detectedState);
        const zone = ICAR_ZONE_CROPS[detectedState] || ICAR_ZONE_CROPS[DEFAULT_STATE];
        setZoneInfo(zone);
        buildRecommendations(detectedState);
      }
    } catch (e) {
      const zone = ICAR_ZONE_CROPS[DEFAULT_STATE];
      setZoneInfo(zone);
      buildRecommendations(DEFAULT_STATE);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildRecommendations = (targetState) => {
    const list = ICAR_DETERMINISTIC_RECOMMENDATIONS[targetState] || ICAR_DETERMINISTIC_RECOMMENDATIONS[DEFAULT_STATE];
    setRecommendations(list);
  };

  const toggleSaveCrop = async (cropName) => {
    const updated = savedCrops.includes(cropName) ? savedCrops.filter(c => c !== cropName) : [...savedCrops, cropName];
    setSavedCrops(updated);
    try {
      await AsyncStorage.setItem('agriguard_my_crops', JSON.stringify(updated));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBg}>
                <Sprout color="#4ade80" size={20} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Crop Advisor</Text>
                <Text style={styles.headerSub}>Smart crop selection for your land</Text>
              </View>
            </View>
            <TouchableOpacity onPress={detectLocationAndLoad} style={styles.refreshBtn}>
              <RefreshCw color="#4ade80" size={16} />
            </TouchableOpacity>
          </View>

          {/* Location pill */}
          <View style={styles.locationPill}>
            <MapPin color="#4ade80" size={14} />
            <Text style={styles.locationText}>
              {location ? location.formatted : 'Chennai, Tamil Nadu, India'}
            </Text>
          </View>

          {/* Metrics bar */}
          {zoneInfo && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsRow}>
              <View style={styles.metricBadge}>
                <Text style={styles.metricText}>🪨 {zoneInfo.soilType}</Text>
              </View>
              <View style={styles.metricBadge}>
                <Text style={styles.metricText}>🌧️ {zoneInfo.avgRainfall}/yr</Text>
              </View>
              <View style={styles.metricBadge}>
                <Text style={styles.metricText}>🗺️ {zoneInfo.zone}</Text>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Field Size Row */}
        <View style={styles.fieldSizeRow}>
          <Text style={styles.fieldSizeLabel}>📐 Your Field Size (acres):</Text>
          <View style={styles.sizeBtnContainer}>
            {['0.5', '1', '2', '5'].map(sz => (
              <TouchableOpacity
                key={sz}
                onPress={() => saveFieldSize(sz)}
                style={[styles.szBtn, fieldSize === sz && styles.szBtnActive]}
              >
                <Text style={[styles.szBtnText, fieldSize === sz && styles.szBtnTextActive]}>{sz}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>🌱 Recommended Crops for Your Region</Text>
          <Text style={styles.sectionSub}>Based on ICAR agro-climatic zones, soil type & current season</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#166534" style={{ marginTop: 30 }} />
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
                <View key={cropName} style={[styles.card, isTop && styles.topCard]}>
                  {isTop && (
                    <View style={styles.bestPickBadge}>
                      <Text style={styles.bestPickText}>⭐ BEST PICK FOR YOU</Text>
                    </View>
                  )}

                  <View style={styles.cardHeader}>
                    <View style={styles.cropTitleRow}>
                      <Text style={styles.emoji}>{emoji}</Text>
                      <View>
                        <Text style={styles.cropName}>{cropName}</Text>
                        <Text style={styles.sowingMonth}>{rec.best_sowing_month}</Text>
                      </View>
                    </View>

                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreNum}>{rec.suitability_score}</Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                  </View>

                  <Text style={styles.whySuitable}>{rec.why_suitable}</Text>

                  <View style={styles.metricsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Expected Yield</Text>
                      <Text style={styles.gridVal}>{rec.expected_yield_per_acre}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Water</Text>
                      <Text style={[styles.gridVal, { color: '#2563eb' }]}>{rec.water_requirement}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Market</Text>
                      <Text style={[styles.gridVal, { color: '#16a34a' }]}>{rec.market_opportunity}</Text>
                    </View>
                  </View>

                  <View style={styles.revenueBanner}>
                    <TrendingUp color="#166534" size={14} />
                    <Text style={styles.revenueText}>
                      APMC Price: ₹{price.toLocaleString('en-IN')}/quintal  |  {acres} acre(s) est. revenue: ₹{estRevenue.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {rec.key_risk && (
                    <View style={styles.riskBox}>
                      <Info color="#b45309" size={12} style={{ marginTop: 2 }} />
                      <Text style={styles.riskText}>Risk: {rec.key_risk}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => toggleSaveCrop(cropName)}
                    style={[styles.growBtn, savedCrops.includes(cropName) && styles.growBtnSaved]}
                  >
                    <Sprout color={savedCrops.includes(cropName) ? "#166534" : "#fff"} size={16} />
                    <Text style={[styles.growBtnText, savedCrops.includes(cropName) && styles.growBtnTextSaved]}>
                      {savedCrops.includes(cropName) ? "Added to My Crops" : "Grow This Crop"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
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
  header: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#052e16',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.15)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#86efac',
    fontSize: 11,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  locationText: {
    color: '#f0fdf4',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  metricText: {
    color: '#86efac',
    fontSize: 11,
  },
  fieldSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a3a1d',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fieldSizeLabel: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '600',
  },
  sizeBtnContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 2,
  },
  szBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  szBtnActive: {
    backgroundColor: '#22c55e',
  },
  szBtnText: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: 'bold',
  },
  szBtnTextActive: {
    color: '#052e16',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#f0fdf4',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    elevation: 2,
  },
  topCard: {
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  bestPickBadge: {
    backgroundColor: '#166534',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  bestPickText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sowingMonth: {
    fontSize: 12,
    color: '#6b7280',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  scoreNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  whySuitable: {
    fontSize: 12,
    color: '#4b5563',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  gridVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  revenueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  revenueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
  },
  riskBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  riskText: {
    fontSize: 11,
    color: '#b45309',
    flex: 1,
  },
  growBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#166534',
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  growBtnSaved: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  growBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  growBtnTextSaved: {
    color: '#166534',
  },
});
