import { base44 } from "@/api/base44Client";

export const getPrecisionLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
};

export const getGeocodedLocation = async (lat, lon, force = false) => {
  const cacheKey = `geo_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached && !force) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a localized reverse geocoder. Given coordinates latitude: ${lat}, longitude: ${lon}, determine the nearest major agricultural city/district, state, and country.
      
Return ONLY this JSON format:
{
  "city": "<city or district name>",
  "state": "<state or province name>",
  "country": "<country name>",
  "formatted": "<city/district>, <state>, <country>"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
          formatted: { type: "string" }
        }
      }
    });

    if (result && result.formatted) {
      localStorage.setItem(cacheKey, JSON.stringify(result));
      // Save as master last known location
      localStorage.setItem("last_known_location", JSON.stringify({ lat, lon, ...result }));
      return result;
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }

  return null;
};

export const getLastKnownLocation = () => {
  try {
    const cached = localStorage.getItem("last_known_location");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};
