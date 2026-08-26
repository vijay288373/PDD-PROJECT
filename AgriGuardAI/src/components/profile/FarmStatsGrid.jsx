import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../../lib/react-i18next';

const FarmStatsGrid = ({ profile, myCropsCount = 0 }) => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('farmSize', 'Farm Size'),
      value: profile?.farmSize ? `${profile.farmSize} ${profile.farmUnit || 'Acres'}` : '-',
      emoji: '📏'
    },
    {
      label: t('region', 'Region'),
      value: profile?.region || '-',
      emoji: '🌍'
    },
    {
      label: t('myCrops', 'My Crops'),
      value: myCropsCount.toString(),
      emoji: '🌾'
    },
    {
      label: t('memberSince', 'Member Since'),
      value: profile?.createdAt ? new Date(profile.createdAt).getFullYear().toString() : new Date().getFullYear().toString(),
      emoji: '📅'
    }
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.emoji}>{stat.emoji}</Text>
          <Text style={styles.value} numberOfLines={1}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '46%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: '2%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default FarmStatsGrid;
