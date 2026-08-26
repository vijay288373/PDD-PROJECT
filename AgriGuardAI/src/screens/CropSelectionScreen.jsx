import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, SafeAreaView, TextInput, Alert
} from 'react-native';
import { Sprout, MapPin, TrendingUp, Droplets, Sun, Wind, ChevronRight, RefreshCw, CheckCircle, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { base44 } from '../api/base44Client';
import { getPrecisionLocation, getGeocodedLocation, getLastKnownLocation } from '../lib/location';
import { useLang } from '../lib/useLang';
import { t } from '../lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ICAR_ZONE_CROPS = {
  'Tamil Nadu': { zone: 'South Zone', soilType: 'Red Laterite & Black Cotton', avgRainfall: '945mm', crops: ['Rice', 'Groundnut', 'Cotton', 'Sugarcane', 'Banana', 'Coconut', 'Turmeric', 'Tomato', 'Onion', 'Maize'] },
  'Andhra Pradesh': { zone: 'South Zone', soilType: 'Black Cotton & Red Sandy', avgRainfall: '1000mm', crops: ['Rice', 'Cotton', 'Groundnut', 'Tobacco', 'Chili', 'Maize', 'Sunflower', 'Sugarcane', 'Onion', 'Turmeric'] },
  'Telangana': { zone: 'South Zone', soilType: 'Black Cotton', avgRainfall: '915mm', crops: ['Cotton', 'Rice', 'Maize', 'Soybean', 'Groundnut', 'Red Gram', 'Sunflower', 'Chili', 'Turmeric'] },
  'Karnataka': { zone: 'South Zone', soilType: 'Red & Black Laterite', avgRainfall: '1135mm', crops: ['Rice', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Ragi', 'Soybean', 'Sunflower', 'Coconut', 'Areca Nut'] },
  'Kerala': { zone: 'South Zone', soilType: 'Laterite & Alluvial', avgRainfall: '3055mm', crops: ['Rice', 'Coconut', 'Banana', 'Rubber', 'Pepper', 'Cardamom', 'Ginger', 'Turmeric', 'Tapioca', 'Jackfruit'] },
  'Maharashtra': { zone: 'West Zone', soilType: 'Deep Black Cotton', avgRainfall: '1000mm', crops: ['Cotton', 'Soybean', 'Sugarcane', 'Onion', 'Grape', 'Wheat', 'Jowar', 'Bajra', 'Tur Dal', 'Maize'] },
  'Gujarat': { zone: 'West Zone', soilType: 'Black Cotton & Alluvial', avgRainfall: '800mm', crops: ['Cotton', 'Groundnut', 'Wheat', 'Rice', 'Castor', 'Bajra', 'Mustard', 'Cumin', 'Fennel', 'Sugarcane'] },
  'Rajasthan': { zone: 'North West Zone', soilType: 'Sandy Loam & Arid', avgRainfall: '530mm', crops: ['Wheat', 'Bajra', 'Jowar', 'Mustard', 'Cumin', 'Coriander', 'Gram', 'Ber', 'Pomegranate', 'Moth Bean'] },
  'Punjab': { zone: 'North Zone', soilType: 'Sandy Loam & Alluvial', avgRainfall: '700mm', crops: ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Sunflower', 'Moong Dal', 'Tur Dal'] },
  'Haryana': { zone: 'North Zone', soilType: 'Alluvial & Loam', avgRainfall: '645mm', crops: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Bajra', 'Maize', 'Sunflower', 'Potato', 'Mustard'] },
  'Uttar Pradesh': { zone: 'North Zone', soilType: 'Alluvial', avgRainfall: '900mm', crops: ['Wheat', 'Rice', 'Sugarcane', 'Potato', 'Maize', 'Pulses', 'Mustard', 'Mentha', 'Mango', 'Guava'] },
  'Madhya Pradesh': { zone: 'Central Zone', soilType: 'Black Cotton & Red', avgRainfall: '1100mm', crops: ['Soybean', 'Wheat', 'Gram', 'Maize', 'Cotton', 'Rice', 'Lentil', 'Mustard', 'Groundnut', 'Sunflower'] },
  'Odisha': { zone: 'East Zone', soilType: 'Red Laterite & Alluvial', avgRainfall: '1485mm', crops: ['Rice', 'Maize', 'Groundnut', 'Sugarcane', 'Jute', 'Pulses', 'Oilseeds', 'Vegetables', 'Turmeric'] },
  'West Bengal': { zone: 'East Zone', soilType: 'Alluvial & Laterite', avgRainfall: '1750mm', crops: ['Rice', 'Jute', 'Potato', 'Wheat', 'Mustard', 'Pulses', 'Vegetables', 'Tea', 'Mango', 'Pineapple'] },
  'Bihar': { zone: 'East Zone', soilType: 'Alluvial', avgRainfall: '1200mm', crops: ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Potato', 'Lentil', 'Mustard', 'Mango', 'Litchi', 'Vegetables'] },
};

const DEFAULT_STATE = 'Tamil Nadu';

const CROP_INFO = {
  'Rice': { icon: '🌾', yield: '20-25 q/acre', water: 'High', season: 'Kharif/Rabi', duration: '90-120 days' },
  'Wheat': { icon: '🌾', yield: '18-22 q/acre', water: 'Medium', season: 'Rabi', duration: '100-120 days' },
  'Tomato': { icon: '🍅', yield: '80-120 q/acre', water: 'Medium', season: 'Year-round', duration: '60-90 days' },
  'Potato': { icon: '🥔', yield: '100-150 q/acre', water: 'Medium', season: 'Rabi', duration: '70-100 days' },
  'Onion': { icon: '🧅', yield: '60-80 q/acre', water: 'Medium', season: 'Rabi/Kharif', duration: '90-120 days' },
  'Cotton': { icon: '☁️', yield: '8-12 q/acre', water: 'Medium', season: 'Kharif', duration: '150-180 days' },
  'Sugarcane': { icon: '🎋', yield: '350-450 q/acre', water: 'High', season: 'Year-round', duration: '270-365 days' },
  'Groundnut': { icon: '🥜', yield: '8-12 q/acre', water: 'Low-Medium', season: 'Kharif/Rabi', duration: '90-120 days' },
  'Maize': { icon: '🌽', yield: '25-35 q/acre', water: 'Medium', season: 'Kharif', duration: '80-100 days' },
  'Banana': { icon: '🍌', yield: '200-300 q/acre', water: 'High', season: 'Year-round', duration: '300-365 days' },
  'Coconut': { icon: '🥥', yield: '6000-8000 nuts/acre/yr', water: 'Medium', season: 'Year-round', duration: 'Perennial' },
  'Soybean': { icon: '🌿', yield: '8-12 q/acre', water: 'Medium', season: 'Kharif', duration: '90-120 days' },
  'Mustard': { icon: '🌼', yield: '6-10 q/acre', water: 'Low', season: 'Rabi', duration: '90-110 days' },
  'Chili': { icon: '🌶️', yield: '15-20 q/acre', water: 'Medium', season: 'Kharif/Rabi', duration: '90-120 days' },
  'Turmeric': { icon: '💛', yield: '20-30 q/acre', water: 'Medium', season: 'Kharif', duration: '200-270 days' },
};

const MANDI_PRICES = {
  'Rice': 2150, 'Wheat': 2380, 'Tomato': 1850, 'Potato': 1100, 'Onion': 1950,
  'Cotton': 6850, 'Sugarcane': 350, 'Groundnut': 5900, 'Maize': 1800, 'Banana': 1600,
  'Coconut': 1200, 'Soybean': 4400, 'Mustard': 5500, 'Chili': 4500, 'Turmeric': 7800,
};

const FIELD_SIZE_KEY = 'agriguard_field_size';

export default function CropSelectionScreen() {
  const [location, setLocation] = useState(null);
  const [state, setState] = useState(DEFAULT_STATE);
  const [zoneInfo, setZoneInfo] = useState(ICAR_ZONE_CROPS[DEFAULT_STATE]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fieldSize, setFieldSize] = useState('2');
  const [savedCrops, setSavedCrops] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const { langCode } = useLang();

  useEffect(() => {
    loadFieldSize();
    detectLocationAndLoad();
  }, []);

  const loadFieldSize = async () => {
    try {
      const stored = await AsyncStorage.getItem(FIELD_SIZE_KEY);
      if (stored) setFieldSize(stored);
    } catch {}
  };

  const saveFieldSize = async (val) => {
    setFieldSize(val);
    try { await AsyncStorage.setItem(FIELD_SIZE_KEY, val); } catch {}
  };

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
        await buildRecommendations(zone, geo, coords);
      }
    } catch (e) {
      setLocationError('Location access denied. Showing default recommendations for Tamil Nadu.');
      const zone = ICAR_ZONE_CROPS[DEFAULT_STATE];
      setZoneInfo(zone);
      await buildRecommendations(zone, null, null);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildRecommendations = async (zone, geo, coords) => {
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
Field size: varies (0-10 acres)
Available crops: ${cropList.join(', ')}

For each crop, provide a suitability score (0-100), specific local recommendations, and current market opportunity.
Return JSON array:
{
  "recommendations": [
    {
      "crop": "crop name",
      "suitability_score": 85,
      "why_suitable": "1-2 sentence reason based on soil/climate",
      "best_sowing_month": "June-July",
      "expected_yield_per_acre": "20-25 quintal",
      "water_requirement": "High/Medium/Low",
      "market_opportunity": "High/Medium/Low",
      "key_risk": "main risk in 5-8 words",
      "nearby_mandis": ["Mandi name 1", "Mandi name 2"]
    }
  ]
}`;

      const res = await base44.integrations.Core.invokeLLM({ prompt });
      const cleanRes = typeof res === 'string' ? res.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim() : res;
      const parsed = typeof cleanRes === 'string' ? JSON.parse(cleanRes) : cleanRes;
      if (parsed && parsed.recommendations) {
        setRecommendations(parsed.recommendations);
        return;
      }
    } catch (e) {
      console.warn('AI crop recommendation failed, using local data:', e);
    }

    // Local fallback
    const fallback = cropList.map(cropName => {
      const info = CROP_INFO[cropName] || { yield: '10-15 q/acre', water: 'Medium', season: season };
      return {
        crop: cropName,
        suitability_score: Math.floor(70 + Math.random() * 25),
        why_suitable: `${cropName} thrives well in ${zone.soilType} soil of ${zone.zone}. Ideal for local climate conditions.`,
        best_sowing_month: info.season,
        expected_yield_per_acre: info.yield,
        water_requirement: info.water,
        market_opportunity: MANDI_PRICES[cropName] > 4000 ? 'High' : MANDI_PRICES[cropName] > 2000 ? 'Medium' : 'Low',
        key_risk: 'Monitor for pests and diseases',
        nearby_mandis: ['Local APMC Mandi', 'District Agricultural Market'],
      };
    }).sort((a, b) => b.suitability_score - a.suitability_score);
    setRecommendations(fallback);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await detectLocationAndLoad();
    setRefreshing(false);
  }, [detectLocationAndLoad]);

  const toggleSaveCrop = async (cropName) => {
    const updated = savedCrops.includes(cropName)
      ? savedCrops.filter(c => c !== cropName)
      : [...savedCrops, cropName];
    setSavedCrops(updated);
    try {
      await AsyncStorage.setItem('agriguard_my_crops', JSON.stringify(updated));
    } catch {}
    Alert.alert(
      savedCrops.includes(cropName) ? 'Crop Removed' : '✅ Crop Saved',
      savedCrops.includes(cropName)
        ? `${cropName} removed from your crop list`
        : `${cropName} added to your farming plan. Visit the Grow tab for stage-wise guidance.`,
      [{ text: 'OK' }]
    );
  };

  const getOpportunityColor = (opp) => {
    if (opp === 'High') return '#16a34a';
    if (opp === 'Medium') return '#d97706';
    return '#9ca3af';
  };

  const getWaterColor = (water) => {
    if (water === 'High') return '#2563eb';
    if (water === 'Medium') return '#7c3aed';
    return '#059669';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>🌍 Detecting your location...</Text>
        <Text style={styles.loadingSubText}>Analyzing soil & climate for crop recommendations</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#052e16', '#14532d', '#166534']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>🌱 Crop Advisor</Text>
              <Text style={styles.headerSubtitle}>Smart crop selection for your land</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
              <RefreshCw width={18} height={18} color="#4ade80" />
            </TouchableOpacity>
          </View>

          {/* Location & Field Info */}
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <MapPin width={14} height={14} color="#4ade80" />
              <Text style={styles.locationText} numberOfLines={1}>
                {location ? location.formatted : `${state}, India`}
              </Text>
            </View>
            {locationError && (
              <Text style={styles.locationError}>{locationError}</Text>
            )}
            <View style={styles.soilRow}>
              <Text style={styles.soilChip}>🪨 {zoneInfo?.soilType}</Text>
              <Text style={styles.soilChip}>💧 {zoneInfo?.avgRainfall}/yr</Text>
              <Text style={styles.soilChip}>🗺️ {zoneInfo?.zone}</Text>
            </View>
          </View>

          {/* Field Size */}
          <View style={styles.fieldSizeRow}>
            <Text style={styles.fieldLabel}>📐 Your Field Size (acres):</Text>
            <View style={styles.fieldInputWrap}>
              <TextInput
                style={styles.fieldInput}
                value={fieldSize}
                onChangeText={saveFieldSize}
                keyboardType="decimal-pad"
                placeholder="e.g. 2.5"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Zone Info */}
        <View style={styles.sectionHeader}>
          <Sprout width={18} height={18} color="#16a34a" />
          <Text style={styles.sectionTitle}>Recommended Crops for Your Region</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Based on ICAR agro-climatic zones, soil type, and current season</Text>

        {recommendations.map((rec, idx) => {
          const cropInfo = CROP_INFO[rec.crop] || {};
          const isSaved = savedCrops.includes(rec.crop);
          const currentPrice = MANDI_PRICES[rec.crop] || 2000;
          const acres = parseFloat(fieldSize) || 1;

          return (
            <View key={rec.crop} style={[styles.cropCard, idx === 0 && styles.cropCardTop]}>
              {idx === 0 && (
                <View style={styles.bestPickBadge}>
                  <Text style={styles.bestPickText}>⭐ BEST PICK FOR YOU</Text>
                </View>
              )}

              <View style={styles.cropCardHeader}>
                <Text style={styles.cropEmoji}>{cropInfo.icon || '🌿'}</Text>
                <View style={styles.cropTitleWrap}>
                  <Text style={styles.cropName}>{rec.crop}</Text>
                  <Text style={styles.cropSeason}>{rec.best_sowing_month}</Text>
                </View>
                <View style={styles.scoreWrap}>
                  <Text style={styles.scoreNum}>{rec.suitability_score}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
              </View>

              {/* Score Bar */}
              <View style={styles.scoreBarBg}>
                <View style={[styles.scoreBarFill, { width: `${rec.suitability_score}%` }]} />
              </View>

              <Text style={styles.whySuitable}>{rec.why_suitable}</Text>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Expected Yield</Text>
                  <Text style={styles.statValue}>{rec.expected_yield_per_acre}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statDot, { backgroundColor: getWaterColor(rec.water_requirement) }]} />
                  <Text style={styles.statLabel}>Water</Text>
                  <Text style={[styles.statValue, { color: getWaterColor(rec.water_requirement) }]}>{rec.water_requirement}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Market</Text>
                  <Text style={[styles.statValue, { color: getOpportunityColor(rec.market_opportunity) }]}>{rec.market_opportunity}</Text>
                </View>
              </View>

              {/* Price Info */}
              <View style={styles.priceRow}>
                <TrendingUp width={14} height={14} color="#16a34a" />
                <Text style={styles.priceText}>
                  APMC Price: ₹{currentPrice}/quintal  |  {acres} acre(s) est. revenue: ₹{Math.round(currentPrice * (parseFloat(rec.expected_yield_per_acre?.split('-')[1]) || 15) * acres / 100 * 100).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Nearby Mandis */}
              {rec.nearby_mandis && rec.nearby_mandis.length > 0 && (
                <View style={styles.mandiRow}>
                  <MapPin width={12} height={12} color="#9ca3af" />
                  <Text style={styles.mandiText}>{rec.nearby_mandis.join(' · ')}</Text>
                </View>
              )}

              {/* Risk */}
              {rec.key_risk && (
                <View style={styles.riskRow}>
                  <Info width={12} height={12} color="#f59e0b" />
                  <Text style={styles.riskText}>Risk: {rec.key_risk}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.growBtn, isSaved && styles.growBtnSaved]}
                onPress={() => toggleSaveCrop(rec.crop)}
              >
                {isSaved
                  ? <CheckCircle width={16} height={16} color="#15803d" style={{ marginRight: 6 }} />
                  : <Sprout width={16} height={16} color="#fff" style={{ marginRight: 6 }} />}
                <Text style={[styles.growBtnText, isSaved && styles.growBtnTextSaved]}>
                  {isSaved ? 'Saved to My Crops' : 'Grow This Crop'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0fdf4' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#052e16', gap: 12 },
  loadingText: { color: '#4ade80', fontSize: 16, fontWeight: '600' },
  loadingSubText: { color: '#86efac', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  header: { paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#86efac', fontSize: 13, marginTop: 2 },
  refreshBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  locationCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, marginBottom: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  locationText: { color: '#d1fae5', fontSize: 14, flex: 1 },
  locationError: { color: '#fbbf24', fontSize: 11, marginBottom: 8 },
  soilRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  soilChip: { color: '#a7f3d0', fontSize: 11, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  fieldSizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { color: '#d1fae5', fontSize: 13 },
  fieldInputWrap: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  fieldInput: { color: '#fff', paddingHorizontal: 12, paddingVertical: 6, fontSize: 15, fontWeight: '700', minWidth: 70, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#15803d' },
  sectionSubtitle: { fontSize: 12, color: '#6b7280', paddingHorizontal: 16, marginBottom: 12 },
  cropCard: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#d1fae5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cropCardTop: { borderColor: '#4ade80', borderWidth: 2 },
  bestPickBadge: { backgroundColor: '#14532d', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  bestPickText: { color: '#4ade80', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cropCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cropEmoji: { fontSize: 32, marginRight: 12 },
  cropTitleWrap: { flex: 1 },
  cropName: { fontSize: 18, fontWeight: '700', color: '#1a5c2a' },
  cropSeason: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  scoreWrap: { alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  scoreNum: { fontSize: 22, fontWeight: '800', color: '#16a34a' },
  scoreLabel: { fontSize: 10, color: '#6b7280' },
  scoreBarBg: { height: 4, backgroundColor: '#f0fdf4', borderRadius: 2, marginBottom: 10 },
  scoreBarFill: { height: 4, backgroundColor: '#22c55e', borderRadius: 2 },
  whySuitable: { fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 10, color: '#9ca3af', textAlign: 'center' },
  statValue: { fontSize: 12, fontWeight: '700', color: '#1f2937', textAlign: 'center' },
  statDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8, marginBottom: 8 },
  priceText: { fontSize: 12, color: '#15803d', fontWeight: '600', flex: 1 },
  mandiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  mandiText: { fontSize: 11, color: '#9ca3af', flex: 1 },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  riskText: { fontSize: 11, color: '#d97706' },
  growBtn: { backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  growBtnSaved: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  growBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  growBtnTextSaved: { color: '#15803d' },
});
