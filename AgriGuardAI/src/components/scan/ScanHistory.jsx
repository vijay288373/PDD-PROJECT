import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { CheckCircle, AlertTriangle, Clock, Leaf } from 'lucide-react-native';
import { base44 } from '../../api/base44Client';
import { useLang } from '../../lib/useLang';
import { t } from '../../lib/i18n';

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

const SEVERITY_LABELS = {
  mild: { en: "Mild", hi: "हल्का", ta: "லேசான", te: "తేలికపాటి", es: "Leve" },
  moderate: { en: "Moderate", hi: "मध्यम", ta: "மிதமான", te: "మితమైన", es: "Moderado" },
  severe: { en: "Severe", hi: "गंभीर", ta: "கடுமையான", te: "తీవ్రమైన", es: "Grave" },
  none: { en: "None", hi: "कोई नहीं", ta: "ஏதுமில்லை", te: "ఏమీ లేదు", es: "Ninguna" }
};

const LOCAL_TEXTS = {
  no_scans: { en: "No Scans Yet", hi: "अभी तक कोई स्कैन नहीं", ta: "இன்னும் ஸ்கேன்கள் இல்லை", te: "ఇంకా స్కాన్‌లు లేవు", es: "No hay escaneos todavía" },
  no_scans_desc: { en: "Start scanning your crops to build your history", hi: "इतिहास बनाने के लिए अपनी फसलों को स्कैन करना शुरू करें", ta: "வரலாற்றை உருவாக்க உங்கள் பயிர்களை ஸ்கேன் செய்யத் தொடங்குங்கள்", te: "మీ చరిత్రను రూపొందించడానికి మీ పంటలను స్కాన్ చేయడం ప్రారంభించండి", es: "Comience a escanear sus cultivos para crear su historial" },
  healthy: { en: "Healthy", hi: "स्वस्थ", ta: "ஆரோக்கியமானது", te: "ఆరోగ్యకరమైనది", es: "Sana" }
};

export default function ScanHistory({ onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { langCode } = useLang();

  useEffect(() => {
    const loadScans = async () => {
      try {
        const data = await base44.entities.ScanHistory.list("-created_date", 20);
        setScans(data);
      } catch {}
      setLoading(false);
    };
    loadScans();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Leaf width={64} height={64} color="#e5e7eb" style={{ marginBottom: 16 }} />
        <Text style={styles.emptyTitle}>
          {LOCAL_TEXTS.no_scans[langCode] || LOCAL_TEXTS.no_scans["en"]}
        </Text>
        <Text style={styles.emptyDesc}>
          {LOCAL_TEXTS.no_scans_desc[langCode] || LOCAL_TEXTS.no_scans_desc["en"]}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item: scan }) => {
    const cropVal = scan.crop_name || scan.crop || "Unknown";
    const translatedCrop = t(CROP_KEYS[cropVal] || cropVal, langCode);
    const severityText = SEVERITY_LABELS[scan.severity]?.[langCode] || SEVERITY_LABELS[scan.severity]?.["en"] || scan.severity;

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectScan?.(scan)}
      >
        {scan.image_url ? (
          <Image source={{ uri: scan.image_url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder} />
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropName}>{translatedCrop}</Text>
              {scan.is_healthy ? (
                <View style={styles.statusRow}>
                  <CheckCircle width={12} height={12} color="#22c55e" />
                  <Text style={styles.healthyText}>{LOCAL_TEXTS.healthy[langCode] || LOCAL_TEXTS.healthy["en"]}</Text>
                </View>
              ) : (
                <View style={styles.statusRow}>
                  <AlertTriangle width={12} height={12} color="#f97316" />
                  <Text style={styles.diseaseText} numberOfLines={1}>{scan.disease_name}</Text>
                </View>
              )}
            </View>
            
            {scan.severity && !scan.is_healthy && (
              <View style={[styles.severityBadge, 
                scan.severity === "severe" ? styles.sevSevere :
                scan.severity === "moderate" ? styles.sevMod : styles.sevMild
              ]}>
                <Text style={[styles.severityBadgeText,
                  scan.severity === "severe" ? styles.sevTextSevere :
                  scan.severity === "moderate" ? styles.sevTextMod : styles.sevTextMild
                ]}>
                  {severityText}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.timeRow}>
            <Clock width={12} height={12} color="#9ca3af" />
            <Text style={styles.timeText}>{formatDate(scan.created_date)}</Text>
          </View>

          {scan.confidence > 0 && (
            <View style={styles.confidenceRow}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${scan.confidence}%` }]} />
              </View>
              <Text style={styles.confidenceText}>{scan.confidence}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("history_title", langCode)}</Text>
      <FlatList
        data={scans}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  skeletonCard: {
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a5c2a',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  cardImage: {
    width: 80,
    height: 80,
  },
  cardImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  healthyText: {
    color: '#16a34a',
    fontSize: 12,
  },
  diseaseText: {
    color: '#ea580c',
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sevMild: { backgroundColor: '#fef9c3' },
  sevTextMild: { color: '#854d0e', fontSize: 10 },
  sevMod: { backgroundColor: '#ffedd5' },
  sevTextMod: { color: '#9a3412', fontSize: 10 },
  sevSevere: { backgroundColor: '#fee2e2' },
  sevTextSevere: { color: '#991b1b', fontSize: 10 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#4ade80',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
