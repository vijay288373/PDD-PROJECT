import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AlertTriangle, CheckCircle, Bug, Droplets, Leaf, FlaskConical, Phone, RefreshCw, WifiOff, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useLang } from '../../lib/useLang';
import { t } from '../../lib/i18n';

const CAUSE_CONFIG = {
  fungal: { icon: Droplets, color: "#9333ea", bg: "#faf5ff", labelKey: "fungal" },
  bacterial: { icon: Bug, color: "#dc2626", bg: "#fef2f2", labelKey: "bacterial" },
  pest: { icon: Bug, color: "#ea580c", bg: "#fff7ed", labelKey: "pest" },
  nutritional: { icon: FlaskConical, color: "#2563eb", bg: "#eff6ff", labelKey: "nutritional" },
  healthy: { icon: Leaf, color: "#16a34a", bg: "#f0fdf4", labelKey: "healthy" },
};

const SEVERITY_CONFIG = {
  mild: { bg: "#fef9c3", text: "#854d0e", border: "#fef08a", labelKey: "mild" },
  moderate: { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa", labelKey: "moderate" },
  severe: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca", labelKey: "severe" },
  none: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0", labelKey: "none" },
};

function AnalyzingLoader({ crop }) {
  const { langCode } = useLang();
  return (
    <View style={styles.loaderContainer}>
      <View style={styles.spinnerWrapper}>
        <View style={styles.spinnerCircle} />
        <Leaf width={32} height={32} color="#1a5c2a" />
      </View>
      <Text style={styles.loaderText}>{t("status_scanning", langCode)}...</Text>
    </View>
  );
}

function TreatmentCard({ step, index }) {
  return (
    <View style={styles.treatmentCard}>
      <View style={styles.treatmentIndex}>
        <Text style={styles.treatmentIndexText}>{index + 1}</Text>
      </View>
      <Text style={styles.treatmentText}>{step}</Text>
    </View>
  );
}

export default function DiagnosisResult({ result, isAnalyzing, capturedImage, selectedCrop, onScanAgain, onNewScan }) {
  const [showPrevention, setShowPrevention] = React.useState(false);
  const { langCode } = useLang();
  const handleRetry = onScanAgain || onNewScan || (() => {});

  const readAloud = (textArray) => {
    const text = textArray.join('. ');
    Speech.speak(text, { language: langCode === 'hi' ? 'hi-IN' : 'en-US' });
  };

  if (isAnalyzing || !result) {
    return <AnalyzingLoader crop={selectedCrop} />;
  }

  if (result.offline && !result.disease_name) {
    return (
      <View style={styles.errorContainer}>
        <WifiOff width={64} height={64} color="#d1d5db" style={styles.errorIcon} />
        <Text style={styles.errorTitle}>{t("offline_title", langCode)}</Text>
        <Text style={styles.errorDesc}>{t("offline_desc", langCode)}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <RefreshCw width={16} height={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryBtnText}>{t("btn_retry", langCode)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result.is_invalid_image) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle width={64} height={64} color="#f59e0b" style={styles.errorIcon} />
        <Text style={styles.errorTitle}>Invalid Image Detected</Text>
        <Text style={styles.errorDesc}>
          {result.invalid_reason || "Please scan a clear plant leaf image. Non-plant or irrelevant photos cannot be diagnosed."}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <RefreshCw width={16} height={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryBtnText}>Scan Proper Leaf Image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result.error) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle width={64} height={64} color="#fb923c" style={styles.errorIcon} />
        <Text style={styles.errorTitle}>{t("fail_title", langCode)}</Text>
        <Text style={styles.errorDesc}>{t("fail_desc", langCode)}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <RefreshCw width={16} height={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryBtnText}>{t("btn_scan_again", langCode)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const causeConfig = CAUSE_CONFIG[result.cause || (result.is_healthy ? "healthy" : "fungal")] || CAUSE_CONFIG.healthy;
  const CauseIcon = causeConfig.icon;
  const severityConfig = SEVERITY_CONFIG[result.severity || "none"] || SEVERITY_CONFIG.none;

  const causeLabel = t(causeConfig.labelKey, langCode);
  const severityLabel = t(severityConfig.labelKey, langCode);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {result.fromCache && (
        <View style={styles.cacheWarning}>
          <WifiOff width={16} height={16} color="#f97316" />
          <Text style={styles.cacheWarningText}>{t("showing_cached_result", langCode)}</Text>
        </View>
      )}

      {capturedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage.localPreview || capturedImage.url }} style={styles.capturedImage} />
        </View>
      )}

      <View style={styles.content}>
        {result.is_healthy ? (
          <View>
            <View style={[styles.mainCard, { borderColor: '#c8e6c9' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                  <CheckCircle width={32} height={32} color="#16a34a" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.label}>{t("diagnosis_title", langCode)}</Text>
                  <Text style={[styles.title, { color: '#15803d' }]}>{t("healthy_plant", langCode)}</Text>
                </View>
              </View>
              <View style={styles.confidenceRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${result.confidence || 90}%`, backgroundColor: '#22c55e' }]} />
                </View>
                <Text style={[styles.confidenceText, { color: '#15803d' }]}>{result.confidence || 90}%</Text>
              </View>
              <Text style={styles.confidenceLabel}>{t("confidence_score", langCode)}</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌿 {t("seasonal_care_tips", langCode)}</Text>
              <TouchableOpacity onPress={() => readAloud(result.seasonal_care || [])} style={styles.readAloudBtn}>
                <Text style={styles.readAloudText}>🔊</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              {(result.seasonal_care || []).map((tip, i) => (
                <TreatmentCard key={i} step={tip} index={i} />
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View style={[styles.mainCard, { borderColor: '#fee2e2' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: causeConfig.bg }]}>
                  <CauseIcon width={28} height={28} color={causeConfig.color} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.label}>{t("detected_disease", langCode)}</Text>
                  <Text style={styles.title}>{result.disease_name || t("unknown_disease", langCode)}</Text>
                  <Text style={styles.causeText}>{causeLabel}</Text>
                </View>
              </View>
              <View style={styles.severityRow}>
                <View style={[styles.severityBadge, { backgroundColor: severityConfig.bg, borderColor: severityConfig.border }]}>
                  <Text style={[styles.severityBadgeText, { color: severityConfig.text }]}>⚠️ {severityLabel} {t("severity_label", langCode)}</Text>
                </View>
                <View style={styles.confidenceWrapper}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${result.confidence || 80}%`, backgroundColor: '#4ade80' }]} />
                  </View>
                  <Text style={styles.confidenceTextSm}>{result.confidence || 80}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💊 {t("treatment_steps", langCode)}</Text>
              <TouchableOpacity onPress={() => readAloud(result.treatment_steps || [])} style={styles.readAloudBtn}>
                <Text style={styles.readAloudText}>🔊</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              {(result.treatment_steps || []).map((step, i) => (
                <TreatmentCard key={i} step={step} index={i} />
              ))}
            </View>

            {(result.prevention_tips || []).length > 0 && (
              <View>
                <TouchableOpacity
                  style={styles.collapseBtn}
                  onPress={() => setShowPrevention(!showPrevention)}
                >
                  <Text style={styles.collapseBtnText}>🛡️ {t("prevention_tips", langCode)}</Text>
                  {showPrevention ? <ChevronUp width={16} height={16} color="#9ca3af" /> : <ChevronDown width={16} height={16} color="#9ca3af" />}
                </TouchableOpacity>
                {showPrevention && (
                  <View style={styles.preventionList}>
                    {(result.prevention_tips || []).map((tip, i) => (
                      <View key={i} style={styles.preventionItem}>
                        <Text style={styles.preventionTick}>✓</Text>
                        <Text style={styles.preventionText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {result.consult_agronomist && (
              <View style={styles.consultCard}>
                <Phone width={20} height={20} color="#d97706" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.consultTitle}>{t("consult_agronomist", langCode)}</Text>
                  <Text style={styles.consultDesc}>{t("consult_agronomist_desc", langCode)}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.scanAgainBtn} onPress={handleRetry}>
          <RefreshCw width={16} height={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.scanAgainText}>{t("btn_scan_again", langCode)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinnerCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#4ade80',
    opacity: 0.5,
  },
  loaderText: {
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#1a5c2a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cacheWarning: {
    backgroundColor: '#fff7ed',
    borderBottomWidth: 1,
    borderBottomColor: '#ffedd5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cacheWarningText: {
    color: '#c2410c',
    fontSize: 12,
    marginLeft: 8,
  },
  imageContainer: {
    height: 200,
    width: '100%',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
    marginTop: -20,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  causeText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginRight: 8,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceTextSm: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5c2a',
  },
  readAloudBtn: {
    padding: 4,
  },
  readAloudText: {
    fontSize: 16,
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  treatmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    elevation: 1,
  },
  treatmentIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a5c2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  treatmentIndexText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  treatmentText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  collapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    marginBottom: 16,
  },
  collapseBtnText: {
    color: '#1a5c2a',
    fontWeight: '600',
    fontSize: 14,
  },
  preventionList: {
    marginBottom: 16,
    gap: 8,
  },
  preventionItem: {
    backgroundColor: '#f0faf2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
  },
  preventionTick: {
    color: '#22c55e',
    marginRight: 8,
  },
  preventionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  consultCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
  },
  consultTitle: {
    fontWeight: '600',
    color: '#92400e',
    fontSize: 14,
  },
  consultDesc: {
    color: '#b45309',
    fontSize: 12,
    marginTop: 2,
  },
  scanAgainBtn: {
    backgroundColor: '#1a5c2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
