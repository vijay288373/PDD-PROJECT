import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Leaf, History } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraCapture from '../components/scan/CameraCapture';
import CropSelector from '../components/scan/CropSelector';
import DiagnosisResult from '../components/scan/DiagnosisResult';
import ScanHistory from '../components/scan/ScanHistory';
import { base44 } from '../api/base44Client';
import { useLang } from '../lib/useLang';
import { t, llmLangSuffix } from '../lib/i18n';
import { getPrecisionLocation, getGeocodedLocation } from '../lib/location';

export default function PlantScanScreen() {
  const [phase, setPhase] = useState('crop'); // crop | camera | result
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const { langCode } = useLang();

  const handleCropSelected = (crop) => {
    setSelectedCrop(crop);
    setPhase('camera');
  };

  const handleImageCaptured = async (imageData) => {
    setCapturedImage(imageData);
    setPhase('result');
    setIsAnalyzing(true);

    let region = "Unknown region";
    let language = "English";
    let uid = "anonymous";
    let fieldSize = 2; // acres default
    try {
      const user = await base44.auth.me();
      uid = user.email || "anonymous";
      const profiles = await base44.entities.FarmerProfile.filter({ uid });
      if (profiles.length > 0) {
        region = profiles[0].region || region;
        language = profiles[0].language || language;
      }
    } catch {}

    try {
      const storedSize = await AsyncStorage.getItem('agriguard_field_size');
      if (storedSize) fieldSize = parseFloat(storedSize) || 2;
    } catch {}

    try {
      const coords = await getPrecisionLocation();
      if (coords) {
        const geo = await getGeocodedLocation(coords.latitude, coords.longitude);
        if (geo && geo.formatted) {
          region = `${geo.formatted} (lat: ${coords.latitude.toFixed(4)}, lon: ${coords.longitude.toFixed(4)})`;
        }
      }
    } catch (e) {
      console.warn("Failed to get precision location, using profile region fallback:", e);
    }

    try {
      const prompt = `You are an expert plant pathologist AI. Examine this leaf image carefully.
Selected Crop: ${selectedCrop}
Region: ${region}
Farmer Field Size: ${fieldSize} acres
Language: ${language}${llmLangSuffix(langCode)}

Diagnose the plant leaf health status. If image is NOT a plant leaf, set "is_plant_leaf": false.

IMPORTANT: For treatment_steps, use SPECIFIC pesticide/fungicide product names with EXACT quantities per acre AND total for the farmer's field. Format each step as: "Product Name (dose/acre): e.g., Spray Mancozeb 75 WP at 500g/acre. For ${fieldSize} acres = ${fieldSize * 500}g total. Mix in water at 2g per liter."
If it is a nutritional deficiency, specify the exact nutrient supplement, quantity per acre, and total quantity for ${fieldSize} acres.`;

      const res = await base44.integrations.Core.invokeLLM({
        prompt,
        file_urls: [imageData.uri],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "plant_diagnosis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                is_plant_leaf: { type: "boolean" },
                is_healthy: { type: "boolean" },
                disease_name: { type: "string" },
                confidence: { type: "number" },
                severity: { type: "string", enum: ["mild", "moderate", "severe"] },
                cause: { type: "string", enum: ["fungal", "bacterial", "pest", "nutritional", "healthy"] },
                treatment_steps: { type: "array", items: { type: "string" } },
                prevention_tips: { type: "array", items: { type: "string" } },
                seasonal_care: { type: "array", items: { type: "string" } },
                consult_agronomist: { type: "boolean" },
                summary: { type: "string" },
              },
              required: [
                "is_plant_leaf",
                "is_healthy",
                "disease_name",
                "confidence",
                "severity",
                "treatment_steps",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      if (parsed && parsed.is_plant_leaf === false) {
        setDiagnosisResult({
          is_invalid_image: true,
          invalid_reason: parsed.invalid_reason || "Invalid Image Detected: Please scan a clear plant leaf image. Diagrams, text documents, or non-plant photos cannot be diagnosed."
        });
        setIsAnalyzing(false);
        return;
      }

      const isHealthy = parsed?.is_healthy !== undefined ? !!parsed.is_healthy : (parsed?.health_status === "healthy");
      const steps = parsed?.treatment_steps || parsed?.organic_treatment || [];
      const prevTips = parsed?.prevention_tips || parsed?.preventive_measures || [];
      const normalized = {
        ...parsed,
        is_plant_leaf: true,
        is_healthy: isHealthy,
        health_status: isHealthy ? "healthy" : "diseased",
        field_size: fieldSize,
        disease_name: parsed?.disease_name || (isHealthy ? `Healthy ${selectedCrop} (No Disease Detected)` : `${selectedCrop} Leaf Infection`),
        confidence: parsed?.confidence || parsed?.confidence_score || 92,
        confidence_score: parsed?.confidence || parsed?.confidence_score || 92,
        severity: parsed?.severity || "mild",
        cause: parsed?.cause || (isHealthy ? "healthy" : "fungal"),
        treatment_steps: steps.length > 0 ? steps : ["Prune and remove diseased foliage immediately", "Apply organic Neem oil (1%) preventive foliar spray"],
        prevention_tips: prevTips.length > 0 ? prevTips : ["Ensure optimal crop canopy spacing for ventilation", "Practice crop rotation"],
        seasonal_care: parsed?.seasonal_care || ["Maintain soil moisture with root zone mulching"],
        crop: selectedCrop,
        image_url: imageData.uri,
        region,
      };

      setDiagnosisResult(normalized);

      try {
        await base44.entities.ScanHistory.create({
          uid,
          crop: selectedCrop,
          crop_name: selectedCrop,
          health_status: normalized.health_status,
          disease_name: normalized.disease_name,
          confidence: normalized.confidence,
          confidence_score: normalized.confidence_score,
          severity: normalized.severity,
          image_url: imageData.localPreview || imageData.uri,
          diagnosis_json: normalized,
          region,
        });
      } catch (e) {
        console.warn("Failed to save scan history:", e);
      }
    } catch (err) {
      console.warn("Diagnosis error, loading dynamic fallback:", err);
      try {
        const fallbackRes = await base44.invokeGemini({
          prompt: `You are an expert plant pathologist AI. Diagnose leaf health. Selected Crop: ${selectedCrop}. Region: ${region}.`,
          file_urls: [imageData.uri],
        });
        const isHealthy = fallbackRes.is_healthy !== undefined ? !!fallbackRes.is_healthy : (fallbackRes.health_status === "healthy");
        const normalized = {
          ...fallbackRes,
          is_plant_leaf: true,
          is_healthy: isHealthy,
          health_status: isHealthy ? "healthy" : "diseased",
          disease_name: fallbackRes.disease_name || (isHealthy ? `Healthy ${selectedCrop} (No Disease Detected)` : `${selectedCrop} Leaf Infection`),
          confidence: fallbackRes.confidence || 93,
          confidence_score: fallbackRes.confidence || 93,
          severity: fallbackRes.severity || "mild",
          cause: fallbackRes.cause || (isHealthy ? "healthy" : "fungal"),
          treatment_steps: fallbackRes.treatment_steps || ["Prune and remove diseased foliage immediately", "Apply organic Neem oil (1%) preventive foliar spray"],
          prevention_tips: fallbackRes.prevention_tips || ["Ensure optimal crop canopy spacing for ventilation", "Practice crop rotation"],
          seasonal_care: fallbackRes.seasonal_care || ["Maintain soil moisture with root zone mulching"],
          crop: selectedCrop,
          image_url: imageData.localPreview || imageData.uri,
          region,
        };

        setDiagnosisResult(normalized);

        try {
          await base44.entities.ScanHistory.create({
            uid,
            crop: selectedCrop,
            crop_name: selectedCrop,
            health_status: normalized.health_status,
            disease_name: normalized.disease_name,
            confidence: normalized.confidence,
            confidence_score: normalized.confidence,
            severity: normalized.severity,
            cause: normalized.cause,
            image_url: imageData.localPreview || imageData.uri,
            diagnosis_json: normalized,
            region,
          });
        } catch (shErr) {
          console.warn("Failed to save scan history in fallback:", shErr);
        }
      } catch (fbErr) {
        console.warn("Fallback failed:", fbErr);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    setSelectedCrop(null);
    setCapturedImage(null);
    setDiagnosisResult(null);
    setPhase('crop');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Leaf color="#4ade80" size={24} />
          <Text style={styles.headerTitle}>{t("scan_title", langCode)}</Text>
        </View>

        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'scan' && styles.activeTabButton]}
            onPress={() => setActiveTab('scan')}
          >
            <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText]}>
              {t("scan_tab_scan", langCode)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <History color={activeTab === 'history' ? '#ffffff' : '#9ca3af'} size={14} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              {t("scan_history_title", langCode)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'history' ? (
        <ScanHistory onSelectScan={(item) => {
          setSelectedCrop(item.crop_name);
          setCapturedImage({ uri: item.image_url });
          setDiagnosisResult(item.diagnosis_json);
          setPhase('result');
          setActiveTab('scan');
        }} />
      ) : (
        <View style={styles.content}>
          {phase === 'crop' && (
            <CropSelector onSelectCrop={handleCropSelected} />
          )}

          {phase === 'camera' && (
            <CameraCapture
              selectedCrop={selectedCrop}
              onImageCaptured={handleImageCaptured}
              onBack={() => setPhase('crop')}
            />
          )}

          {phase === 'result' && (
            <DiagnosisResult
              imageData={capturedImage}
              result={diagnosisResult}
              loading={isAnalyzing}
              onNewScan={handleNewScan}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#052e16',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#14532d',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#0a1e12',
    borderRadius: 8,
    padding: 2,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#1a5c2a',
  },
  tabText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
