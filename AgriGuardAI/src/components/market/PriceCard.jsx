import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bell, TrendingUp, TrendingDown, Minus } from "lucide-react-native";

const CROP_EMOJI = {
  Rice: "🌾", Wheat: "🌾", "Maize / Corn": "🌽", Tomato: "🍅", Potato: "🥔",
  Onion: "🧅", Cotton: "🌿", Sugarcane: "🎋", Coffee: "☕", Soybean: "🌱",
  Chickpea: "🫘", "Banana / Plantain": "🍌", Mango: "🥭", Groundnut: "🥜",
  "Groundnut / Peanut": "🥜", Sorghum: "🌾", Millet: "🌾", Barley: "🌾",
  default: "🌿"
};

export default function PriceCard({ crop, priceData, isSelected, onSelect, onSetAlert }) {
  const emoji = CROP_EMOJI[crop] || CROP_EMOJI.default;
  const price = priceData?.modal_price;
  const change = priceData?.change_pct;
  const isEstimated = priceData?.estimated;

  const changeColor = change > 0 ? "#16a34a" : change < 0 ? "#ef4444" : "#9ca3af";
  const changeBg = change > 0 ? "#f0fdf4" : change < 0 ? "#fef2f2" : "#f9fafb";
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(crop)}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      {isEstimated && (
        <View style={styles.estimatedBadge}>
          <Text style={styles.estimatedText}>Estimated — verify locally</Text>
        </View>
      )}

      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View>
            <Text style={styles.cropName}>{crop}</Text>
            {price ? (
              <View style={styles.priceContainer}>
                <Text style={styles.priceValue}>₹{price?.toLocaleString("en-IN")}</Text>
                <Text style={styles.priceUnit}>/ {priceData?.unit || "quintal"}</Text>
              </View>
            ) : (
              <View style={styles.skeleton} />
            )}
          </View>
        </View>

        <View style={styles.rightActions}>
          {change !== undefined && change !== null ? (
            <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
              <ChangeIcon color={changeColor} size={12} />
              <Text style={[styles.changeText, { color: changeColor }]}>
                {change > 0 ? "+" : ""}{change?.toFixed(1)}%
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.alertButton}
            onPress={(e) => {
              e.stopPropagation();
              onSetAlert(crop, priceData);
            }}
          >
            <Bell color="#1a5c2a" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {priceData?.min_price && (
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Min</Text>
            <Text style={styles.statValue}>₹{priceData.min_price?.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Max</Text>
            <Text style={styles.statValue}>₹{priceData.max_price?.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Modal</Text>
            <Text style={styles.statValue}>₹{priceData.modal_price?.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e8f5e9",
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  estimatedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  estimatedText: {
    fontSize: 10,
    color: "#b45309",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  cropName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a5c2a",
  },
  priceUnit: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  skeleton: {
    height: 24,
    width: 96,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginTop: 4,
  },
  rightActions: {
    alignItems: "flex-end",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  alertButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0faf2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f9fafb",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 2,
  },
});
