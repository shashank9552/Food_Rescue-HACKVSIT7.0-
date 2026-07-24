/**
 * Computes the straight-line (Haversine) distance in kilometers between two points.
 * 
 * @param {{lat: number, lng: number}} pointA - Origin coordinate
 * @param {{lat: number, lng: number}} pointB - Destination coordinate
 * @returns {number} Distance in kilometers
 */
function haversineKm(pointA, pointB) {
  if (
    !pointA || !pointB ||
    typeof pointA.lat !== 'number' || typeof pointA.lng !== 'number' ||
    typeof pointB.lat !== 'number' || typeof pointB.lng !== 'number'
  ) {
    throw new Error("Invalid coordinate parameters provided for Haversine calculation");
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (pointB.lat - pointA.lat) * Math.PI / 180;
  const dLng = (pointB.lng - pointA.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pointA.lat * Math.PI / 180) *
      Math.cos(pointB.lat * Math.PI / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Attempts to retrieve distances and travel durations for a set of destinations using 
 * the Google Maps Distance Matrix API.
 * Operates on a strict timeout and fails silently, returning null on error/timeout/unset key.
 * 
 * @param {{lat: number, lng: number}} origin - Origin coordinates
 * @param {Array<{lat: number, lng: number}>} destinations - Destination coordinates
 * @param {number} timeoutMs - Timeout in milliseconds (default 1500)
 * @returns {Promise<Array<{distanceKm: number, durationMin: number}> | null>} Real-world distance/durations, or null
 */
async function getDistancesKmWithTimeout(origin, destinations, timeoutMs = 1500) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("GOOGLE_MAPS_API_KEY secret is not set or empty. Skipping Google Maps Distance Matrix API call.");
    return null;
  }

  if (!destinations || destinations.length === 0) {
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const originsParam = `${origin.lat},${origin.lng}`;
    const destinationsParam = destinations.map(d => `${d.lat},${d.lng}`).join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originsParam)}&destinations=${encodeURIComponent(destinationsParam)}&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Google Maps Distance Matrix API responded with HTTP status ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.warn(`Google Maps Distance Matrix API status is ${data.status}: ${data.error_message || "No error message provided."}`);
      return null;
    }

    if (!data.rows || !data.rows[0] || !data.rows[0].elements) {
      console.warn("Google Maps Distance Matrix API returned malformed response structure (missing rows or elements).");
      return null;
    }

    const elements = data.rows[0].elements;
    if (elements.length !== destinations.length) {
      console.warn(`Google Maps Distance Matrix elements length (${elements.length}) mismatch with destinations length (${destinations.length}).`);
      return null;
    }

    const results = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.status !== "OK") {
        console.warn(`Google Maps Distance Matrix element at index ${i} returned status ${el.status}`);
        return null;
      }

      const distanceVal = el.distance && typeof el.distance.value === 'number' ? el.distance.value / 1000 : null;
      const durationVal = el.duration && typeof el.duration.value === 'number' ? el.duration.value / 60 : null;

      if (distanceVal === null || durationVal === null) {
        console.warn(`Google Maps Distance Matrix element at index ${i} is missing valid distance or duration values.`);
        return null;
      }

      results.push({
        distanceKm: distanceVal,
        durationMin: durationVal
      });
    }

    return results;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.warn(`Google Maps Distance Matrix API request timed out after ${timeoutMs}ms`);
    } else {
      console.warn("Google Maps Distance Matrix API request encountered an error:", err);
    }
    return null;
  }
}

module.exports = {
  haversineKm,
  getDistancesKmWithTimeout
};
