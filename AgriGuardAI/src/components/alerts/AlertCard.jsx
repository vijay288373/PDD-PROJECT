import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle, TrendingUp, Leaf, CloudRain, ChevronRight } from "lucide-react-native";
import { glassTheme } from "../../theme/glassTheme";

const TYPE_CONFIG = {
  critical: {
    border: "#ef4444",
    badge: "rgba(239, 68, 68, 0.15)",
    badgeText: "#ef4444",
    badgeLabel: "CRITICAL",
    Icon: AlertTriangle,
    iconColor: "#ef4444",
    iconBg: "rgba(239, 68, 68, 0.12)",
    btnClass: "#ef4444",
    btnLabel: "Take Action",
  },
  market: {
    border: "#f59e0b",
    badge: "rgba(245, 158, 11, 0.15)",
    badgeText: "#f59e0b",
    badgeLabel: "MARKET",
    Icon: TrendingUp,
    iconColor: "#f59e0b",
    iconBg: "rgba(245, 158, 11, 0.12)",
    btnClass: "#f59e0b",
    btnLabel: "View Market",
  },
  scan: {
    border: "#22c55e",
    badge: "rgba(34, 197, 94, 0.15)",
    badgeText: "#22c55e",
    badgeLabel: "SCAN",
    Icon: Leaf,
    iconColor: "#22c55e",
    iconBg: "rgba(34, 197, 94, 0.12)",
    btnClass: "#16a34a",
    btnLabel: "View Result",
  },
  weather: {
    border: "#3b82f6",
    badge: "rgba(59, 130, 246, 0.15)",
    badgeText: "#3b82f6",
    badgeLabel: "WEATHER",
    Icon: CloudRain,
    iconColor: "#3b82f6",
    iconBg: "rgba(59, 130, 246, 0.12)",
    btnClass: "#3b82f6",
    btnLabel: "View Precautions",
  },
};

export default function AlertCard({ alert, onPress }) {
  const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.critical;
  const Icon = cfg.Icon;

  const timeStr = alert.created_date ? new Date(alert.created_date).toLocaleDateString() : "";

  return (
    <View style={[styles.card, { borderLeftColor: cfg.border }, !alert.read && styles.unreadCard]}>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: cfg.iconBg }]}>
            <Icon color={cfg.iconColor} size={20} />
          </View>
          
          <View style={styles.rightContent}>
            <View style={styles.headerRow}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: cfg.badge, borderColor: cfg.iconColor }]}>
                  <Text style={[styles.badgeText, { color: cfg.badgeText }]}>{cfg.badgeLabel}</Text>
                </View>
                {!alert.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.timeText}>{timeStr}</Text>
            </View>
            
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{alert.body}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: cfg.btnClass }]}
            onPress={() => onPress && onPress(alert)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{cfg.btnLabel}</Text>
            <ChevronRight color="#fff" size={14} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderLeftWidth: 4,
    shadowColor: "#1a5c2a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  unreadCard: {
    borderColor: "rgba(34, 197, 94, 0.5)",
    borderWidth: 1.5,
    borderLeftWidth: 4,
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justify: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  rightContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  timeText: {
    fontSize: 11,
    color: "#6b7280",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
