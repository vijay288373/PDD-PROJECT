import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const CONDITION_EMOJI = {
  sunny: "☀️",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  foggy: "🌫️",
  windy: "💨",
};

function getRainImpact(rainProb) {
  if (rainProb >= 70) return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca", label: "High Risk" };
  if (rainProb >= 40) return { bg: "#fef3c7", text: "#d97706", border: "#fde68a", label: "Moderate" };
  return { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0", label: "Good" };
}

export default function ForecastStrip({ forecast, loading }) {
  if (loading || !forecast.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>7-Day Forecast</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>7-Day Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {forecast.map((day, i) => {
          const impact = getRainImpact(day.rain_prob || 0);
          const isToday = i === 0;
          return (
            <View
              key={i}
              style={[
                styles.card,
                isToday ? styles.cardToday : styles.cardNormal
              ]}
            >
              <Text style={[styles.dayText, isToday ? { color: '#4ade80' } : { color: '#6b7280' }]}>
                {isToday ? "Today" : day.day}
              </Text>
              <Text style={styles.emojiText}>{CONDITION_EMOJI[day.condition] || "🌤️"}</Text>
              <View style={styles.tempContainer}>
                <Text style={[styles.tempHigh, isToday ? { color: '#fff' } : { color: '#1f2937' }]}>
                  {day.temp_high}°
                </Text>
                <Text style={[styles.tempLow, isToday ? { color: 'rgba(255,255,255,0.6)' } : { color: '#9ca3af' }]}>
                  {day.temp_low}°
                </Text>
              </View>
              <View style={[styles.rainProbBadge, { backgroundColor: impact.bg, borderColor: impact.border }]}>
                <Text style={[styles.rainProbText, { color: impact.text }]}>{day.rain_prob}% 🌧️</Text>
              </View>
              <View style={[styles.impactBadge, { backgroundColor: impact.bg, borderColor: impact.border }]}>
                <Text style={[styles.impactText, { color: impact.text }]}>{impact.label}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5c2a',
    marginBottom: 12,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  card: {
    width: 96,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  cardToday: {
    backgroundColor: '#1a5c2a',
    borderColor: '#1a5c2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardNormal: {
    backgroundColor: '#fff',
    borderColor: '#e8f5e9',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emojiText: {
    fontSize: 28,
  },
  tempContainer: {
    alignItems: 'center',
  },
  tempHigh: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tempLow: {
    fontSize: 12,
  },
  rainProbBadge: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  rainProbText: {
    fontSize: 10,
    fontWeight: '500',
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  impactText: {
    fontSize: 10,
  }
});
