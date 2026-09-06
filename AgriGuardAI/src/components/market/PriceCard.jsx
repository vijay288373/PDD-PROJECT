import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bell, TrendingUp, TrendingDown, Minus } from "lucide-react-native";

const CROP_EMOJI = {
  Rice: "🌾", Wheat: "🌾", "Maize / Corn": "🌽", Corn: "🌽", Maize: "🌽", Tomato: "🍅", Potato: "🥔",
  Onion: "🧅", Cotton: "🌿", Sugarcane: "🎋", Coffee: "☕", Soybean: "🌱",
  Chickpea: "🫘", "Banana / Plantain": "🍌", Banana: "🍌", Mango: "🥭", Groundnut: "🥜",
  "Groundnut / Peanut": "🥜", Turmeric: "💛", Pepper: "🫑", "Pepper (Bell/Chili)": "🫑",
  Coconut: "🥥", Apple: "🍎", Millet: "🌾", default: "🌿"
};

const BENCHMARK_APMC_PRICES = {
  "Rice": { modal_price: 2180, min_price: 1950, max_price: 2420, change_pct: 1.4, unit: "quintal" },
  "Tomato": { modal_price: 1850, min_price: 1200, max_price: 2600, change_pct: 4.8, unit: "quintal" },
  "Potato": { modal_price: 1120, min_price: 880, max_price: 1420, change_pct: 0.5, unit: "quintal" },
  "Wheat": { modal_price: 2360, min_price: 2120, max_price: 2580, change_pct: -0.8, unit: "quintal" },
  "Onion": { modal_price: 1980, min_price: 1450, max_price: 2550, change_pct: -2.3, unit: "quintal" },
  "Cotton": { modal_price: 6890, min_price: 6250, max_price: 7450, change_pct: 1.1, unit: "quintal" },
  "Maize / Corn": { modal_price: 1870, min_price: 1680, max_price: 2080, change_pct: 2.1, unit: "quintal" },
  "Corn": { modal_price: 1870, min_price: 1680, max_price: 2080, change_pct: 2.1, unit: "quintal" },
  "Maize": { modal_price: 1870, min_price: 1680, max_price: 2080, change_pct: 2.1, unit: "quintal" },
  "Sugarcane": { modal_price: 345, min_price: 315, max_price: 375, change_pct: 0.0, unit: "quintal" },
  "Turmeric": { modal_price: 7850, min_price: 7250, max_price: 8450, change_pct: 2.5, unit: "quintal" },
  "Pepper (Bell/Chili)": { modal_price: 4550, min_price: 3850, max_price: 5250, change_pct: 3.2, unit: "quintal" },
  "Pepper": { modal_price: 4550, min_price: 3850, max_price: 5250, change_pct: 3.2, unit: "quintal" },
  "Banana / Plantain": { modal_price: 1620, min_price: 1220, max_price: 2020, change_pct: -1.2, unit: "quintal" },
  "Banana": { modal_price: 1620, min_price: 1220, max_price: 2020, change_pct: -1.2, unit: "quintal" },
  "Coconut": { modal_price: 2850, min_price: 2450, max_price: 3250, change_pct: 1.8, unit: "quintal" },
  "Groundnut / Peanut": { modal_price: 5950, min_price: 5350, max_price: 6450, change_pct: 1.8, unit: "quintal" },
  "Groundnut": { modal_price: 5950, min_price: 5350, max_price: 6450, change_pct: 1.8, unit: "quintal" },
  "Soybean": { modal_price: 4420, min_price: 4020, max_price: 4820, change_pct: 0.9, unit: "quintal" },
  "Chickpea": { modal_price: 5200, min_price: 4700, max_price: 5700, change_pct: 0.6, unit: "quintal" },
  "Apple": { modal_price: 8500, min_price: 7500, max_price: 9500, change_pct: -0.5, unit: "quintal" },
  "Millet": { modal_price: 2250, min_price: 2000, max_price: 2500, change_pct: 1.2, unit: "quintal" }
};

function resolveCropData(cropName, propPriceData, priceInfo) {
  const dict = propPriceData || priceInfo;
  if (dict && typeof dict === 'object') {
    if (dict.modal_price) return dict;
    if (dict[cropName]) return dict[cropName];
    const key = Object.keys(dict).find(k => k.toLowerCase().includes(cropName.toLowerCase()) || cropName.toLowerCase().includes(k.toLowerCase()));
    if (key && dict[key]) return dict[key];
  }
  return BENCHMARK_APMC_PRICES[cropName] || BENCHMARK_APMC_PRICES["Rice"];
}

export default function PriceCard({ crop, priceData: propPriceData, priceInfo, isSelected, onSelect, onSetAlert }) {
  const pData = resolveCropData(crop, propPriceData, priceInfo);
  const emoji = CROP_EMOJI[crop] || CROP_EMOJI.default;
  const price = pData.modal_price;
  const change = pData.change_pct !== undefined ? pData.change_pct : 1.4;

  const isPos = change > 0;
  const isNeg = change < 0;
  const badgeBg = isPos ? "#dcfce7" : isNeg ? "#ffe4e6" : "#f3f4f6";
  const badgeText = isPos ? "#166534" : isNeg ? "#9f1239" : "#374151";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect?.(crop)}
      style={[
        styles.card,
        isSelected && styles.selectedCard
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View style={styles.emojiBg}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.cropTitle}>{crop}</Text>
            <Text style={styles.priceText}>
              ₹{price?.toLocaleString("en-IN")}{" "}
              <Text style={styles.unitText}>/ {pData.unit || "quintal"}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            {isPos ? (
              <TrendingUp size={12} color="#166534" />
            ) : isNeg ? (
              <TrendingDown size={12} color="#9f1239" />
            ) : (
              <Minus size={12} color="#374151" />
            )}
            <Text style={[styles.badgeText, { color: badgeText }]}>
              {change > 0 ? "+" : ""}{change?.toFixed(1)}%
            </Text>
          </View>

          <TouchableOpacity
            style={styles.alertButton}
            onPress={(e) => {
              e.stopPropagation();
              onSetAlert?.(crop, pData);
            }}
          >
            <Bell size={16} color="#047857" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Min / Max / Modal stats */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>MIN</Text>
          <Text style={styles.statVal}>₹{pData.min_price?.toLocaleString("en-IN")}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>MAX</Text>
          <Text style={styles.statVal}>₹{pData.max_price?.toLocaleString("en-IN")}</Text>
        </View>
        <View style={[styles.statPill, styles.modalPill]}>
          <Text style={[styles.statLabel, { color: "#064e3b" }]}>MODAL</Text>
          <Text style={[styles.statVal, { color: "#047857" }]}>₹{price?.toLocaleString("en-IN")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#eefcf2",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#bbf7d0",
  },
  selectedCard: {
    borderColor: "#22c55e",
    backgroundColor: "#e2f9ea",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emojiBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 22,
  },
  titleCol: {
    justifyContent: "center",
  },
  cropTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#064e3b",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 2,
  },
  unitText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "600",
  },
  rightActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  alertButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(167, 243, 208, 0.6)",
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  modalPill: {
    backgroundColor: "rgba(187, 247, 208, 0.6)",
    borderColor: "#86efac",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#064e3b",
    marginTop: 2,
  },
});
