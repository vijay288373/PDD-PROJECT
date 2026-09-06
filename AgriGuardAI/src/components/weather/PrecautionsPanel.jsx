import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Zap, Calendar, Eye } from 'lucide-react-native';
import ReadAloudButton from '../ReadAloudButton';

const SECTIONS = [
  { key: "immediate", icon: Zap, label: "Immediate Actions", subtitle: "Do these within the next few hours", bg: "#fef2f2", border: "#fee2e2", iconBg: "#fee2e2", iconColor: "#dc2626", dotColor: "#ef4444", badgeColor: "#ef4444" },
  { key: "this_week", icon: Calendar, label: "This Week", subtitle: "Plan and schedule for the coming days", bg: "#fffbeb", border: "#fef3c7", iconBg: "#fef3c7", iconColor: "#d97706", dotColor: "#f59e0b", badgeColor: "#f59e0b" },
  { key: "monitor", icon: Eye, label: "Monitor Closely", subtitle: "Keep an eye on these indicators", bg: "#eff6ff", border: "#dbeafe", iconBg: "#dbeafe", iconColor: "#2563eb", dotColor: "#60a5fa", badgeColor: "#60a5fa" },
];

const DEFAULT_PRECAUTIONS = {
  immediate: ["Ensure field furrows are clear to handle potential rainfall", "Inspect yellow sticky traps for insect pest vectors"],
  this_week: ["Apply organic Neem oil spray (1%) on vulnerable crop leaves", "Maintain balanced N-P-K fertigation schedule"],
  monitor: ["Watch for humidity spikes above 80% which encourage fungal spores", "Track 7-day weather forecast daily"]
};

export default function PrecautionsPanel({ cropImpact, precautions: precautionsProp, analyzing }) {
  if (analyzing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Generating precautions...</Text>
      </View>
    );
  }

  const prec = precautionsProp || cropImpact?.precautions || DEFAULT_PRECAUTIONS;
  const allText = SECTIONS.flatMap(s => prec[s.key] || []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today's Action Plan</Text>
          <Text style={styles.subtitle}>Based on current weather conditions</Text>
        </View>
        <ReadAloudButton text={allText.join('. ')} />
      </View>

      <View style={styles.listContainer}>
        {SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const items = prec[section.key] || [];
          if (!items.length) return null;
          return (
            <View key={section.key} style={[styles.sectionCard, { backgroundColor: section.bg, borderColor: section.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: section.iconBg }]}>
                  <SectionIcon size={20} color={section.iconColor} />
                </View>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>{section.label}</Text>
                  <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: section.badgeColor }]}>
                  <Text style={styles.badgeText}>{items.length}</Text>
                </View>
              </View>
              <View style={styles.itemsContainer}>
                {items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={[styles.dot, { backgroundColor: section.dotColor }]} />
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
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
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5c2a',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  listContainer: {
    gap: 16,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsContainer: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
});
