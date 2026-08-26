import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { MapPin, Calendar, Zap } from "lucide-react-native";

const REC_CONFIG = {
  SELL: { bg: "#dcfce7", text: "#166534", border: "#86efac", emoji: "💰" },
  HOLD: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", emoji: "⏳" },
  WAIT: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd", emoji: "🔮" },
};

const FACTOR_COLORS = [
  { bg: "#f3e8ff", text: "#7e22ce" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#ccfbf1", text: "#0f766e" },
  { bg: "#fce7f3", text: "#be185d" },
];

export default function AIPriceForecast({ forecast, loading, crop }) {
  if (loading) {
    return (
      <View style={[styles.card, styles.centerCard]}>
        <ActivityIndicator size="large" color="#4ade80" style={{ marginBottom: 12 }} />
        <Text style={styles.loadingText}>AI analyzing {crop} market...</Text>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={[styles.card, styles.centerCard]}>
        <Zap color="#e5e7eb" size={32} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyText}>Select a crop for AI market forecast</Text>
      </View>
    );
  }

  const rec = REC_CONFIG[forecast.recommendation] || REC_CONFIG.HOLD;

  return (
    <View style={styles.container}>
      {/* Recommendation badge */}
      <View style={[styles.recCard, { backgroundColor: rec.bg, borderColor: rec.border }]}>
        <View style={styles.recContent}>
          <Text style={styles.emoji}>{rec.emoji}</Text>
          <View style={styles.recTextContainer}>
            <View style={styles.recHeaderRow}>
              <Text style={[styles.recTitle, { color: rec.text }]}>{forecast.recommendation}</Text>
              <View style={[styles.badge, { backgroundColor: rec.bg, borderColor: rec.border }]}>
                <Text style={[styles.badgeText, { color: rec.text }]}>AI Recommendation</Text>
              </View>
            </View>
            <Text style={[styles.recReason, { color: rec.text }]}>{forecast.recommendation_reason}</Text>
          </View>
        </View>
      </View>

      {/* Best sell window */}
      {forecast.best_sell_window && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar color="#1a5c2a" size={16} />
            <Text style={styles.cardTitle}>Best Sell Window</Text>
          </View>
          <Text style={styles.sellDates}>{forecast.best_sell_window.dates}</Text>
          <Text style={styles.sellReason}>{forecast.best_sell_window.reason}</Text>
        </View>
      )}

      {/* 3 scenarios */}
      {forecast.scenarios && (
        <View style={styles.card}>
          <Text style={styles.cardTitleText}>7-Day Price Scenarios</Text>
          <View style={styles.scenariosContainer}>
            {[
              { label: "Optimistic", key: "optimistic", color: "#22c55e", textColor: "#15803d" },
              { label: "Likely", key: "likely", color: "#3b82f6", textColor: "#1d4ed8" },
              { label: "Pessimistic", key: "pessimistic", color: "#f87171", textColor: "#dc2626" },
            ].map(s => {
              const maxVal = forecast.scenarios.optimistic * 1.1;
              const val = forecast.scenarios[s.key] || 0;
              const pct = Math.min(100, (val / maxVal) * 100);

              return (
                <View key={s.key} style={styles.scenarioRow}>
                  <Text style={[styles.scenarioLabel, { color: s.textColor }]}>{s.label}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: s.color }]} />
                  </View>
                  <Text style={[styles.scenarioValue, { color: s.textColor }]}>
                    ₹{val?.toLocaleString("en-IN")}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Factor chips */}
      {forecast.price_factors?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitleText}>Key Price Drivers</Text>
          <View style={styles.factorsContainer}>
            {forecast.price_factors.map((factor, i) => {
              const colorConfig = FACTOR_COLORS[i % FACTOR_COLORS.length];
              return (
                <View key={i} style={[styles.factorChip, { backgroundColor: colorConfig.bg }]}>
                  <Text style={[styles.factorText, { color: colorConfig.text }]}>{factor}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Nearby markets */}
      {forecast.nearby_markets?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin color="#1a5c2a" size={16} />
            <Text style={styles.cardTitle}>Nearby Better Markets</Text>
          </View>
          <View style={styles.marketsContainer}>
            {forecast.nearby_markets.map((m, i) => (
              <View key={i} style={styles.marketRow}>
                <View>
                  <Text style={styles.marketName}>{m.market_name}</Text>
                  <Text style={styles.marketDistance}>{m.distance || ""}</Text>
                </View>
                <Text style={[styles.marketDiff, { color: m.price_diff > 0 ? "#16a34a" : "#ef4444" }]}>
                  {m.price_diff > 0 ? "+₹" : "-₹"}{Math.abs(m.price_diff)?.toLocaleString("en-IN")} / quintal
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8f5e9",
  },
  centerCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  recCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },
  recContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  recTextContainer: {
    flex: 1,
  },
  recHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  recTitle: {
    fontSize: 24,
    fontWeight: "900",
  },
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  recReason: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a5c2a",
  },
  sellDates: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  sellReason: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  scenariosContainer: {
    gap: 10,
  },
  scenarioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scenarioLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  scenarioValue: {
    width: 80,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  factorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  factorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  factorText: {
    fontSize: 12,
    fontWeight: "500",
  },
  marketsContainer: {
    gap: 8,
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0faf2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  marketName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  marketDistance: {
    fontSize: 12,
    color: "#9ca3af",
  },
  marketDiff: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
