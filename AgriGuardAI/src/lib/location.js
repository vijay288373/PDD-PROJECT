import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base44 } from "../api/base44Client";

export const getPrecisionLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.warn("Geolocation permission denied, defaulting to Chennai");
    return { latitude: 13.0827, longitude: 80.2707 };
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location.coords;
  } catch (e) {
    console.warn("Failed to get location, defaulting to Chennai", e);
    return { latitude: 13.0827, longitude: 80.2707 };
  }
};

export const getGeocodedLocation = async (lat, lon, force = false) => {
  const cacheVersion = 'v2'; // Bump to invalidate stale geocode cache
  const cacheKey = `geo_${cacheVersion}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  
  if (!force) {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
  }

  try {
    const result = await base44.invokeGemini({
      prompt: `You are a localized reverse geocoder. Given coordinates latitude: ${lat}, longitude: ${lon}, determine the nearest major agricultural city/district, state, and country.
      
Return ONLY this JSON format:
{
  "city": "<city or district name>",
  "state": "<state or province name>",
  "country": "<country name>",
  "formatted": "<city/district>, <state>, <country>"
}`
    });

    if (result && result.formatted) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
      // Save as master last known location
      await AsyncStorage.setItem("last_known_location", JSON.stringify({ lat, lon, ...result }));
      return result;
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }

  return null;
};

export const getLastKnownLocation = async () => {
  try {
    const cached = await AsyncStorage.getItem("last_known_location");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};
