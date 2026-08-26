import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const RANGE_LABELS = { "7": "7 Days", "30": "30 Days", "90": "90 Days" };

export default function PriceTrendChart({ crop, trendData, loading }) {
  const [range, setRange] = useState("30");

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeletonText} />
        <View style={styles.skeletonChart} />
        <ActivityIndicator size="small" color="#4ade80" style={styles.loader} />
      </View>
    );
  }

  if (!trendData?.historical?.length) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <Text style={styles.emptyText}>Select a crop to view price trend</Text>
      </View>
    );
  }

  const days = parseInt(range);
  const historical = trendData.historical.slice(-days);
  const forecast = trendData.forecast || [];

  // Convert to react-native-gifted-charts format
  const lineData = historical.map(d => ({
    value: d.price,
    label: d.date,
    labelTextStyle: { color: "#9ca3af", fontSize: 10 },
  }));

  const forecastData = forecast.map((d, index) => ({
    value: d.price,
    label: d.date,
    labelTextStyle: { color: "#9ca3af", fontSize: 10 },
  }));
  
  // We need to bridge the gap between historical and forecast
  if (historical.length > 0 && forecast.length > 0) {
    forecastData.unshift({
        value: historical[historical.length - 1].price,
        label: historical[historical.length - 1].date,
        hideDataPoint: true,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titleLabel}>Price Trend</Text>
          <Text style={styles.cropTitle}>{crop}</Text>
        </View>
        <View style={styles.rangeTabs}>
          {Object.entries(RANGE_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setRange(key)}
              style={[styles.rangeTab, range === key && styles.rangeTabActive]}
            >
              <Text style={[styles.rangeTabText, range === key && styles.rangeTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={lineData}
          data2={forecastData}
          height={160}
          initialSpacing={10}
          spacing={30}
          textColor1="#9ca3af"
          textFontSize={10}
          color1="#1a5c2a"
          color2="#6366f1"
          thickness1={2.5}
          thickness2={2}
          strokeDashArray2={[6, 3]}
          dataPointsColor1="#4ade80"
          dataPointsColor2="#6366f1"
          dataPointsRadius1={4}
          dataPointsRadius2={4}
          yAxisColor="transparent"
          xAxisColor="#f0f0f0"
          rulesColor="#f0f0f0"
          rulesType="dashed"
          yAxisTextStyle={{ color: "#9ca3af", fontSize: 10 }}
          formatYLabel={(label) => `₹${label}`}
          pointerConfig={{
            pointerStripUptoDataPoint: true,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            strokeDashArray: [2, 5],
            pointerColor: 'lightgray',
            radius: 4,
            pointerLabelWidth: 80,
            pointerLabelHeight: 40,
            pointerLabelComponent: items => {
              return (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipLabel}>{items[0]?.label}</Text>
                  <Text style={styles.tooltipValue}>₹{items[0]?.value?.toLocaleString("en-IN")}</Text>
                </View>
              );
            },
          }}
        />
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#1a5c2a" }]} />
          <Text style={styles.legendText}>Historical</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "transparent", borderColor: "#6366f1", borderWidth: 1, borderStyle: "dashed" }]} />
          <Text style={styles.legendText}>AI Forecast</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8f5e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  skeletonText: {
    height: 16,
    width: 128,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonChart: {
    height: 160,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -10,
    marginTop: -10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cropTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a5c2a",
  },
  rangeTabs: {
    flexDirection: "row",
    gap: 4,
  },
  rangeTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  rangeTabActive: {
    backgroundColor: "#1a5c2a",
  },
  rangeTabText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6b7280",
  },
  rangeTabTextActive: {
    color: "#ffffff",
  },
  chartContainer: {
    alignItems: "center",
  },
  tooltip: {
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8f5e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a5c2a",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
