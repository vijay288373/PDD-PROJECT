import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, RefreshCw } from 'lucide-react-native';
import { format } from 'date-fns';

const CONDITION_CONFIG = {
  sunny: { emoji: "☀️", bg: "#f59e0b" },
  partly_cloudy: { emoji: "⛅", bg: "#60a5fa" },
  cloudy: { emoji: "☁️", bg: "#94a3b8" },
  rainy: { emoji: "🌧️", bg: "#3b82f6" },
  stormy: { emoji: "⛈️", bg: "#4b5563" },
  foggy: { emoji: "🌫️", bg: "#9ca3af" },
  windy: { emoji: "💨", bg: "#67e8f9" },
};

export default function WeatherHeader({ weather, loading, lastUpdated, onRefresh }) {
  const condition = weather?.current?.condition || "sunny";
  const config = CONDITION_CONFIG[condition] || CONDITION_CONFIG.sunny;

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <View>
            <View style={styles.locationRow}>
              <MapPin size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>
                {loading ? "Detecting location..." : (weather?.location_name || "Chennai District, Tamil Nadu, India")}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {lastUpdated ? `Updated ${format(lastUpdated, "h:mm a")}` : "Updating..."}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <RefreshCw size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainWeather}>
          <View>
            {loading ? (
              <View>
                <Text style={styles.tempText}>--</Text>
              </View>
            ) : (
              <>
                <View style={styles.tempRow}>
                  <Text style={styles.tempText}>{weather?.current?.temp_c ?? "--"}</Text>
                  <Text style={styles.tempUnit}>°C</Text>
                </View>
                <Text style={styles.descText}>
                  {weather?.current?.description || condition}
                </Text>
                <Text style={styles.feelsLikeText}>
                  Feels like {weather?.current?.feels_like_c ?? "--"}°C
                </Text>
              </>
            )}
          </View>
          <Text style={styles.emojiText}>{config.emoji}</Text>
        </View>

        {!loading && weather?.current && (
          <View style={styles.statsBar}>
            {[
              { label: "Rain", value: `${weather.current.rainfall_mm}mm` },
              { label: "Humidity", value: `${weather.current.humidity}%` },
              { label: "Wind", value: `${weather.current.wind_kmh}km/h` },
              { label: "UV", value: weather.current.uv_index },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  content: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempText: {
    fontSize: 64,
    fontWeight: '300',
    color: '#fff',
    lineHeight: 70,
  },
  tempUnit: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  descText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  feelsLikeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  emojiText: {
    fontSize: 72,
  },
  statsBar: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
