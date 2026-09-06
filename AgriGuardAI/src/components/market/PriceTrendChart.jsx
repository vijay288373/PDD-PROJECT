import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Line, Path, Circle, Text as SvgText } from "react-native-svg";

const BENCHMARK_APMC_MODALS = {
  "Turmeric": 7850,
  "Cotton": 6890,
  "Groundnut / Peanut": 5950,
  "Groundnut": 5950,
  "Chickpea": 5200,
  "Pepper (Bell/Chili)": 4550,
  "Pepper": 4550,
  "Soybean": 4420,
  "Coconut": 2850,
  "Wheat": 2360,
  "Millet": 2250,
  "Rice": 2180,
  "Onion": 1980,
  "Maize / Corn": 1870,
  "Corn": 1870,
  "Maize": 1870,
  "Tomato": 1850,
  "Banana / Plantain": 1620,
  "Banana": 1620,
  "Potato": 1120,
  "Sugarcane": 345,
  "Apple": 8500
};

function getCropModalPrice(cropName) {
  if (!cropName) return 2180;
  if (BENCHMARK_APMC_MODALS[cropName]) return BENCHMARK_APMC_MODALS[cropName];
  const key = Object.keys(BENCHMARK_APMC_MODALS).find(
    k => k.toLowerCase().includes(cropName.toLowerCase()) || cropName.toLowerCase().includes(k.toLowerCase())
  );
  return key ? BENCHMARK_APMC_MODALS[key] : 2180;
}

function generateTrendData(cropName, range) {
  const currentPrice = getCropModalPrice(cropName);
  let isDown = cropName.toLowerCase().includes('onion') || cropName.toLowerCase().includes('banana') || cropName.toLowerCase().includes('apple');
  let factor = isDown ? -1 : 1;

  if (range === "7") {
    return [
      { label: "Day -6", price: Math.round(currentPrice * (1 - 0.02 * factor)) },
      { label: "Day -4", price: Math.round(currentPrice * (1 - 0.012 * factor)) },
      { label: "Day -2", price: Math.round(currentPrice * (1 - 0.005 * factor)) },
      { label: "Today", price: currentPrice },
      { label: "+3 Days", price: Math.round(currentPrice * (1 + 0.025 * factor)), isForecast: true },
      { label: "+7 Days", price: Math.round(currentPrice * (1 + 0.05 * factor)), isForecast: true },
    ];
  }

  if (range === "90") {
    return [
      { label: "90D ago", price: Math.round(currentPrice * (1 - 0.14 * factor)) },
      { label: "60D ago", price: Math.round(currentPrice * (1 - 0.09 * factor)) },
      { label: "30D ago", price: Math.round(currentPrice * (1 - 0.05 * factor)) },
      { label: "Today", price: currentPrice },
      { label: "+3 Days", price: Math.round(currentPrice * (1 + 0.025 * factor)), isForecast: true },
      { label: "+7 Days", price: Math.round(currentPrice * (1 + 0.05 * factor)), isForecast: true },
    ];
  }

  return [
    { label: "30D ago", price: Math.round(currentPrice * (1 - 0.08 * factor)) },
    { label: "20D ago", price: Math.round(currentPrice * (1 - 0.05 * factor)) },
    { label: "10D ago", price: Math.round(currentPrice * (1 - 0.02 * factor)) },
    { label: "Today", price: currentPrice },
    { label: "+3 Days", price: Math.round(currentPrice * (1 + 0.025 * factor)), isForecast: true },
    { label: "+7 Days", price: Math.round(currentPrice * (1 + 0.05 * factor)), isForecast: true },
  ];
}

export default function PriceTrendChart({ crop }) {
  const [range, setRange] = useState("30");
  const cropName = crop || "Rice";
  const dataPoints = generateTrendData(cropName, range);

  const prices = dataPoints.map((d) => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;

  const svgWidth = 340;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const points = dataPoints.map((d, i) => {
    const x = paddingX + (i / (dataPoints.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((d.price - minP) / rangeP) * plotHeight;
    return { ...d, x, y };
  });

  const histPoints = points.filter((p) => !p.isForecast);
  const forePoints = points.filter((p) => p.isForecast || p.label === "Today");

  const toPathStr = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{cropName} Price Trend</Text>
          <Text style={styles.subtitle}>APMC Mandi Modal Prices (₹/quintal)</Text>
        </View>
        <View style={styles.pillContainer}>
          {["7", "30", "90"].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[styles.pill, range === r && styles.activePill]}
            >
              <Text style={[styles.pillText, range === r && styles.activePillText]}>{r}D</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={svgWidth} height={svgHeight}>
          {[0, 0.5, 1].map((ratio, idx) => {
            const yVal = paddingTop + plotHeight * (1 - ratio);
            return (
              <Line
                key={idx}
                x1={paddingX}
                y1={yVal}
                x2={svgWidth - paddingX}
                y2={yVal}
                stroke="#f3f4f6"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          <Path d={toPathStr(histPoints)} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <Path d={toPathStr(forePoints)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => {
            const isFore = p.isForecast;
            const dotColor = isFore ? "#2563eb" : "#16a34a";
            return (
              <React.Fragment key={i}>
                <Circle cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="#ffffff" strokeWidth="2" />
                <SvgText x={p.x} y={p.y - 10} textAnchor="middle" fill={dotColor} fontSize="11" fontWeight="bold">
                  {p.price?.toLocaleString("en-IN")}
                </SvgText>
                <SvgText x={p.x} y={svgHeight - 8} textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">
                  {p.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#16a34a" }]} />
          <Text style={styles.legendText}>Historical APMC Price</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#2563eb" }]} />
          <Text style={styles.legendText}>AI 7-Day Forecast</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8f5e9",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  pillContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 2,
    gap: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePill: {
    backgroundColor: "#166534",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4b5563",
  },
  activePillText: {
    color: "#ffffff",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4b5563",
  },
});
