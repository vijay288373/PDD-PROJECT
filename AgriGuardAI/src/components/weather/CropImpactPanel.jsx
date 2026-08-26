import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react-native';

const RISK_CONFIG = {
  low: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0", icon: CheckCircle, label: "Low Risk" },
  medium: { bg: "#fef3c7", text: "#b45309", border: "#fde68a", icon: AlertTriangle, label: "Medium Risk" },
  high: { bg: "#ffedd5", text: "#c2410c", border: "#fed7aa", icon: AlertTriangle, label: "High Risk" },
  critical: { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca", icon: AlertTriangle, label: "Critical!" },
};

const OVERALL_BG = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#dc2626",
};

function IrrigationBadge({ change, pct }) {
  if (change === "increase") return (
    <View style={[styles.irrBadge, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
      <TrendingUp size={12} color="#2563eb" />
      <Text style={[styles.irrText, { color: '#2563eb' }]}>+{pct}% water</Text>
    </View>
  );
  if (change === "decrease") return (
    <View style={[styles.irrBadge, { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }]}>
      <TrendingDown size={12} color="#0d9488" />
      <Text style={[styles.irrText, { color: '#0d9488' }]}>-{pct}% water</Text>
    </View>
  );
  return (
    <View style={[styles.irrBadge, { backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }]}>
      <Minus size={12} color="#4b5563" />
      <Text style={[styles.irrText, { color: '#4b5563' }]}>Maintain</Text>
    </View>
  );
}

export default function CropImpactPanel({ cropImpact, analyzing, userProfile }) {
  if (analyzing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Analyzing crop impacts...</Text>
        <Text style={styles.loadingSub}>Consulting AI agronomist</Text>
      </View>
    );
  }

  if (!cropImpact) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🌾</Text>
        <Text style={styles.emptyText}>
          {userProfile?.primary_crops?.length 
            ? "Weather data loading — crop analysis will appear here"
            : "Complete your farmer profile to see crop-specific weather impacts"}
        </Text>
      </View>
    );
  }

  const overallRisk = cropImpact.overall_risk || "low";
  const bgColor = OVERALL_BG[overallRisk] || OVERALL_BG.low;

  return (
    <View style={styles.container}>
      <View style={[styles.overallBanner, { backgroundColor: bgColor }]}>
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerTitle}>Overall Farm Risk</Text>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>{overallRisk}</Text>
          </View>
        </View>
        <Text style={styles.bannerSummary}>{cropImpact.summary}</Text>
      </View>

      <Text style={styles.sectionTitle}>Crop-by-Crop Analysis</Text>
      <View style={styles.cropList}>
        {(cropImpact.crop_impacts || []).map((crop, i) => {
          const risk = RISK_CONFIG[crop.risk_level] || RISK_CONFIG.low;
          const RiskIcon = risk.icon;

          return (
            <View key={i} style={styles.cropCard}>
              <View style={styles.cropCardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.cropName}>{crop.crop}</Text>
                  <Text style={styles.cropSummary}>{crop.impact_summary}</Text>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: risk.bg, borderColor: risk.border }]}>
                  <RiskIcon size={12} color={risk.text} />
                  <Text style={[styles.riskText, { color: risk.text }]}>{risk.label}</Text>
                </View>
              </View>

              <View style={styles.irrigationContainer}>
                <IrrigationBadge change={crop.irrigation_change} pct={crop.irrigation_pct} />
              </View>

              {crop.immediate_actions?.length > 0 && (
                <View style={styles.actionsContainer}>
                  <Text style={styles.actionsTitle}>⚡ Immediate Actions</Text>
                  {crop.immediate_actions.map((action, j) => (
                    <View key={j} style={styles.actionRow}>
                      <Text style={styles.actionArrow}>→</Text>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              )}

              {crop.best_activities?.length > 0 && (
                <View style={styles.bestActsContainer}>
                  <Text style={styles.bestActsTitle}>✅ Best activities today</Text>
                  {crop.best_activities.map((act, j) => (
                    <Text key={j} style={styles.bestActItem}>• {act}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  centerContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    color: '#1a5c2a',
    fontWeight: '600',
  },
  loadingSub: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  overallBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bannerBadgeText: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  bannerSummary: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5c2a',
    marginBottom: 12,
  },
  cropList: {
    gap: 16,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  cropCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropName: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  cropSummary: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
  },
  irrigationContainer: {
    marginBottom: 12,
  },
  irrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  irrText: {
    fontSize: 12,
  },
  actionsContainer: {
    marginBottom: 8,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  actionArrow: {
    color: '#4ade80',
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  bestActsContainer: {
    backgroundColor: '#f0faf2',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  bestActsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a5c2a',
    marginBottom: 4,
  },
  bestActItem: {
    fontSize: 12,
    color: '#4b5563',
  }
});
