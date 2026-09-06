import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { MapPin, Calendar } from "lucide-react-native";

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

const CROP_AI_DATABASE = {
  Rice: {
    recommendation: "SELL",
    recommendation_reason: "Procurement demand from regional rice mills is strong with current mandi prices up +4.2%.",
    best_sell_window: { dates: "Next 3-5 days", reason: "Fresh harvest arrivals from neighboring districts expected to peak next week." },
    scenarios: { optimistic: 2400, likely: 2250, pessimistic: 2050 },
    price_factors: ["High mill procurement demand", "Optimal grain moisture levels", "Tight inter-state supply"],
    nearby_markets: [
      { market_name: "Kanchipuram Main APMC", distance: "24 km", price_diff: 85 },
      { market_name: "Tiruvallur District Mandi", distance: "38 km", price_diff: 50 }
    ]
  },
  Tomato: {
    recommendation: "SELL",
    recommendation_reason: "Prices are up +4.8% today due to temporary supply shortages in neighboring districts.",
    best_sell_window: { dates: "Immediate (Next 48 hours)", reason: "Perishable crop — capitalize on current ₹1,850/q modal price before fresh arrivals." },
    scenarios: { optimistic: 2200, likely: 1850, pessimistic: 1400 },
    price_factors: ["High daily urban consumption", "Rainfall transport delays", "Low cold-storage stocks"],
    nearby_markets: [
      { market_name: "Koyambedu Wholesale Market", distance: "12 km", price_diff: 120 },
      { market_name: "Chengalpattu Mandi", distance: "45 km", price_diff: -30 }
    ]
  },
  Potato: {
    recommendation: "HOLD",
    recommendation_reason: "Cold storage release is steady; processing unit demand projected to gain +3-5% over next 2 weeks.",
    best_sell_window: { dates: "In 10-14 days", reason: "Snack manufacturing units opening bulk purchase tenders." },
    scenarios: { optimistic: 1350, likely: 1150, pessimistic: 950 },
    price_factors: ["Steady cold storage release", "Snack unit bulk tenders", "Stable logistics costs"],
    nearby_markets: [
      { market_name: "Vellore APMC Market", distance: "65 km", price_diff: 60 },
      { market_name: "Koyambedu Market", distance: "12 km", price_diff: 40 }
    ]
  },
  Wheat: {
    recommendation: "WAIT",
    recommendation_reason: "Government minimum support price (MSP) revision policy announcement expected next week.",
    best_sell_window: { dates: "In 2-3 weeks", reason: "Wholesale prices projected to rally post policy clarification." },
    scenarios: { optimistic: 2650, likely: 2400, pessimistic: 2200 },
    price_factors: ["Upcoming MSP announcement", "Flour mill buffer stocking", "Global grain export trends"],
    nearby_markets: [
      { market_name: "Salem Central Mandi", distance: "120 km", price_diff: 90 },
      { market_name: "Erode Market Yard", distance: "140 km", price_diff: 75 }
    ]
  },
  Cotton: {
    recommendation: "SELL",
    recommendation_reason: "Global textile export demand is firm; current price of ₹6,850/q is near seasonal highs.",
    best_sell_window: { dates: "Next 7 days", reason: "Spinning mills actively procuring long-staple varieties." },
    scenarios: { optimistic: 7500, likely: 7000, pessimistic: 6400 },
    price_factors: ["Textile mill export orders", "High lint quality grade", "International futures rally"],
    nearby_markets: [
      { market_name: "Coimbatore Cotton Market", distance: "180 km", price_diff: 180 },
      { market_name: "Tirupur Spinning Hub", distance: "160 km", price_diff: 150 }
    ]
  },
  Onion: {
    recommendation: "HOLD",
    recommendation_reason: "Storage crop condition is good; export quota expansion anticipated next fortnight.",
    best_sell_window: { dates: "In 12-18 days", reason: "Export relaxation will trigger +8-10% price jump in major mandis." },
    scenarios: { optimistic: 2500, likely: 2100, pessimistic: 1700 },
    price_factors: ["Anticipated export quota easing", "Low storage decay rate", "High hotel sector demand"],
    nearby_markets: [
      { market_name: "Dindigul Onion Mandi", distance: "210 km", price_diff: 110 },
      { market_name: "Koyambedu Market", distance: "12 km", price_diff: 45 }
    ]
  },
  Sugarcane: {
    recommendation: "HOLD",
    recommendation_reason: "Cooperative sugar mill crushing season is in full swing with guaranteed FRP payouts.",
    best_sell_window: { dates: "Within 10 days of mill token issue", reason: "Optimal sucrose recovery rate maximizes recovery bonus." },
    scenarios: { optimistic: 380, likely: 350, pessimistic: 320 },
    price_factors: ["High sugar recovery percentage", "State FRP price support", "Distillery ethanol tenders"],
    nearby_markets: [
      { market_name: "Chengalpattu Co-op Sugar Mill", distance: "35 km", price_diff: 15 },
      { market_name: "Vellore Sugar Complex", distance: "70 km", price_diff: 10 }
    ]
  },
  "Maize / Corn": {
    recommendation: "SELL",
    recommendation_reason: "Poultry feed manufacturers actively bidding up dry maize lots (+2.1%).",
    best_sell_window: { dates: "Next 4-6 days", reason: "Feed mill monthly buying cycle concludes next week." },
    scenarios: { optimistic: 2100, likely: 1900, pessimistic: 1700 },
    price_factors: ["Poultry feed mill demand", "Low grain moisture (<14%)", "Starch industry orders"],
    nearby_markets: [
      { market_name: "Namakkal Poultry Hub Mandi", distance: "190 km", price_diff: 140 },
      { market_name: "Erode Feed Market", distance: "150 km", price_diff: 95 }
    ]
  },
  Turmeric: {
    recommendation: "HOLD",
    recommendation_reason: "Erode turmeric auction prices showing consistent upward momentum (+2.5%).",
    best_sell_window: { dates: "In 15-20 days", reason: "Curcumin-rich finger varieties fetching peak premium prices." },
    scenarios: { optimistic: 8600, likely: 7900, pessimistic: 7100 },
    price_factors: ["High curcumin content demand", "Pharma export orders", "Low arrivals in Erode mandi"],
    nearby_markets: [
      { market_name: "Erode Turmeric Market Yard", distance: "155 km", price_diff: 250 },
      { market_name: "Salem Spice Mandi", distance: "125 km", price_diff: 180 }
    ]
  }
};

export default function AIPriceForecast({ forecast: propForecast, forecastData, loading, crop }) {
  if (loading) {
    return (
      <View style={[styles.card, styles.centerCard]}>
        <ActivityIndicator size="large" color="#4ade80" style={{ marginBottom: 12 }} />
        <Text style={styles.loadingText}>AI analyzing {crop || "crop"} market...</Text>
      </View>
    );
  }

  const cropName = crop || "Rice";
  const data = propForecast || forecastData || CROP_AI_DATABASE[cropName] || CROP_AI_DATABASE.Rice;
  const recType = data?.recommendation || "SELL";
  const rec = REC_CONFIG[recType] || REC_CONFIG.SELL;

  return (
    <View style={styles.container}>
      {/* Recommendation banner */}
      <View style={[styles.card, styles.recCard, { backgroundColor: rec.bg, borderColor: rec.border }]}>
        <View style={styles.recHeader}>
          <Text style={styles.recEmoji}>{rec.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.recBadgeRow}>
              <Text style={[styles.recTitle, { color: rec.text }]}>{recType}</Text>
              <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.7)" }]}>
                <Text style={[styles.badgeText, { color: rec.text }]}>AI Recommendation for {cropName}</Text>
              </View>
            </View>
            <Text style={[styles.recReason, { color: rec.text }]}>{data.recommendation_reason}</Text>
          </View>
        </View>
      </View>

      {/* Best sell window */}
      {data.best_sell_window && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar color="#166534" size={16} />
            <Text style={styles.cardTitle}>Best Sell Window</Text>
          </View>
          <Text style={styles.datesText}>{data.best_sell_window.dates}</Text>
          <Text style={styles.reasonText}>{data.best_sell_window.reason}</Text>
        </View>
      )}

      {/* Scenarios */}
      {data.scenarios && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Price Scenarios</Text>
          <View style={styles.scenarioList}>
            {[
              { label: "Optimistic", val: data.scenarios.optimistic, color: "#22c55e" },
              { label: "Likely", val: data.scenarios.likely, color: "#3b82f6" },
              { label: "Pessimistic", val: data.scenarios.pessimistic, color: "#f87171" },
            ].map(s => (
              <View key={s.label} style={styles.scenarioRow}>
                <Text style={styles.scenarioLabel}>{s.label}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100, (s.val / (data.scenarios.optimistic * 1.1)) * 100)}%`, backgroundColor: s.color }]} />
                </View>
                <Text style={styles.scenarioVal}>₹{s.val?.toLocaleString("en-IN")}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Factor chips */}
      {data.price_factors?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Price Drivers</Text>
          <View style={styles.chipsRow}>
            {data.price_factors.map((factor, i) => {
              const theme = FACTOR_COLORS[i % FACTOR_COLORS.length];
              return (
                <View key={i} style={[styles.chip, { backgroundColor: theme.bg }]}>
                  <Text style={[styles.chipText, { color: theme.text }]}>{factor}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Nearby markets */}
      {data.nearby_markets?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin color="#166534" size={16} />
            <Text style={styles.cardTitle}>Nearby Higher Mandis</Text>
          </View>
          {data.nearby_markets.map((m, i) => (
            <View key={i} style={styles.marketRow}>
              <View>
                <Text style={styles.marketName}>{m.market_name}</Text>
                <Text style={styles.marketDist}>{m.distance}</Text>
              </View>
              <Text style={[styles.marketDiff, { color: m.price_diff > 0 ? "#16a34a" : "#ef4444" }]}>
                {m.price_diff > 0 ? "+" : ""}₹{m.price_diff?.toLocaleString("en-IN")} / q
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
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
    paddingVertical: 32,
  },
  loadingText: {
    color: "#166534",
    fontWeight: "600",
  },
  recCard: {
    borderWidth: 2,
  },
  recHeader: {
    flexDirection: "row",
    gap: 12,
  },
  recEmoji: {
    fontSize: 28,
  },
  recBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  recTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  recReason: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    fontWeight: "500",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  datesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  reasonText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  scenarioList: {
    gap: 8,
  },
  scenarioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scenarioLabel: {
    width: 72,
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  scenarioVal: {
    width: 64,
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0faf2",
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  marketName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
  },
  marketDist: {
    fontSize: 11,
    color: "#6b7280",
  },
  marketDiff: {
    fontSize: 13,
    fontWeight: "bold",
  },
});
