import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { Bell, CheckCheck } from "lucide-react-native";
import AlertCard from "../components/alerts/AlertCard";
import { useAuth } from "../lib/AuthContext";

const SUPA_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';

function supaHeaders() {
  return {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

const FILTER_TABS = [
  { id: "filter_all", label: "All" },
  { id: "filter_critical", label: "Critical" },
  { id: "filter_market", label: "Market" },
  { id: "filter_weather", label: "Weather" },
  { id: "filter_scans", label: "Scans" }
];

const TAB_TYPE_MAP = {
  filter_all: null,
  filter_critical: "critical",
  filter_market: "market",
  filter_weather: "weather",
  filter_scans: "scan",
};

const DEFAULT_ALERTS = [
  { id: "1", type: "critical", title: "Pest Attack Risk", body: "High risk of Fall Armyworm detected in your region.", is_read: false, created_date: new Date().toISOString() },
  { id: "2", type: "market", title: "Price Spike", body: "Tomato prices are up 5% today.", is_read: true, created_date: new Date().toISOString() },
  { id: "3", type: "weather", title: "Heavy Rain Expected", body: "Expect heavy rainfall tomorrow evening.", is_read: false, created_date: new Date().toISOString() },
];

async function fetchSupaAlerts(uid) {
  if (!uid) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/Alert?uid=eq.${encodeURIComponent(uid)}&order=created_date.desc&limit=50`,
      { headers: supaHeaders() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows;
  } catch {
    return null;
  }
}

async function updateSupaAlertRead(id) {
  try {
    await fetch(`${SUPA_URL}/rest/v1/Alert?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: supaHeaders(),
      body: JSON.stringify({ is_read: true }),
    });
  } catch {}
}

export default function AlertsCenterScreen({ navigation }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("filter_all");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userEmail = user?.email || 'farmer@agriguard.com';
      const cloudAlerts = await fetchSupaAlerts(userEmail);
      if (cloudAlerts && cloudAlerts.length > 0) {
        setAlerts(cloudAlerts.map(a => ({
          ...a,
          body: a.message || a.body,
          read: a.is_read !== undefined ? a.is_read : a.read,
        })));
      } else {
        setAlerts(DEFAULT_ALERTS.map(a => ({ ...a, read: a.is_read })));
      }
    } catch (e) {
      setAlerts(DEFAULT_ALERTS.map(a => ({ ...a, read: a.is_read })));
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true, is_read: true })));
    alerts.forEach(a => {
      if (a.id && !a.id.length < 5) updateSupaAlertRead(a.id);
    });
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const filtered = alerts.filter(a => {
    const type = TAB_TYPE_MAP[activeFilter];
    return type === null || a.type === type;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <View>
              <Bell color="#4ade80" size={24} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>Alerts Center</Text>
            {unreadCount > 0 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{unreadCount} New</Text>
              </View>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
              <CheckCheck color="#a7f3c8" size={16} />
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {FILTER_TABS.map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={[styles.tab, activeFilter === tab.id && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeFilter === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#166534" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell color="#e5e7eb" size={48} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptyText}>
            {activeFilter === "filter_all" ? "No new alerts to show." : "No alerts of this type."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AlertCard 
              alert={item} 
              onPress={(alertItem) => {
                setAlerts(prev => prev.map(a => a.id === alertItem.id ? { ...a, read: true, is_read: true } : a));
                if (alertItem.id) updateSupaAlertRead(alertItem.id);
                if (alertItem.type === "critical" || alertItem.type === "scan") {
                  navigation?.navigate("Scan");
                } else if (alertItem.type === "market") {
                  navigation?.navigate("Market");
                } else if (alertItem.type === "weather") {
                  navigation?.navigate("Weather");
                }
              }} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  header: {
    backgroundColor: "#166534",
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  newBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  markReadText: {
    color: "#a7f3c8",
    fontSize: 12,
  },
  tabBar: {
    marginTop: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeTab: {
    backgroundColor: "#4ade80",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#0d1f3c",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
