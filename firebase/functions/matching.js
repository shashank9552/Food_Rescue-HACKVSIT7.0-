const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { haversineKm, getDistancesKmWithTimeout } = require("./utils/distance");

exports.findMatch = onCall({ secrets: ["GOOGLE_MAPS_API_KEY"], cors: true }, async (request) => {
  const { listingId } = request.data || {};
  if (!listingId) {
    throw new HttpsError("invalid-argument", "The function must be called with a listingId.");
  }

  const db = admin.firestore();

  // 1. Fetch the food listing
  const listingDoc = await db.collection("foodListings").doc(listingId).get();
  if (!listingDoc.exists) {
    throw new HttpsError("not-found", `Food listing with ID ${listingId} not found.`);
  }

  const listingData = listingDoc.data();
  const origin = listingData.restaurantLocation;
  const quantityKg = listingData.quantityKg;

  if (!origin || typeof origin.lat !== "number" || typeof origin.lng !== "number") {
    throw new HttpsError("failed-precondition", "Listing is missing valid restaurant location.");
  }

  if (typeof quantityKg !== "number" || quantityKg <= 0) {
    throw new HttpsError("failed-precondition", "Listing has invalid food quantity.");
  }

  // 2. Query NGOs where capacityKg >= quantityKg
  const ngosSnapshot = await db.collection("ngos")
    .where("capacityKg", ">=", quantityKg)
    .get();

  if (ngosSnapshot.empty) {
    return [];
  }

  const eligibleNgos = [];
  ngosSnapshot.forEach((doc) => {
    const data = doc.data();
    eligibleNgos.push({
      id: doc.id,
      name: data.name,
      location: data.location,
      capacityKg: data.capacityKg
    });
  });

  // 3. Compute baseline Haversine distance for all eligible NGOs
  const haversineResults = eligibleNgos.map(ngo => {
    try {
      return haversineKm(origin, ngo.location);
    } catch (err) {
      console.error(`Haversine calculation failed for NGO ${ngo.id}:`, err);
      return Infinity; // Fallback to push this NGO to the end of the sorted list
    }
  });

  // 4. Attempt Google Maps Distance Matrix API in parallel
  const destinations = eligibleNgos.map(ngo => ngo.location);
  const googleResults = await getDistancesKmWithTimeout(origin, destinations, 1500);

  const useGoogle = googleResults !== null && googleResults.length === eligibleNgos.length;

  const matchedNgos = eligibleNgos.map((ngo, index) => {
    const distanceKm = useGoogle ? googleResults[index].distanceKm : haversineResults[index];
    const durationMin = useGoogle ? googleResults[index].durationMin : null;
    const method = useGoogle ? "google" : "haversine";

    // Smart Match Score calculation: (0 to 100)
    const distWeight = 0.4;
    const capWeight = 0.3;
    const expWeight = 0.2;
    const qtyWeight = 0.1;

    const distScore = Math.max(0, 100 - (distanceKm * 10)); // Max score if closer than 1km
    const ngoCapacity = ngo.capacityKg || ngo.capacity || 20;
    const capScore = ngoCapacity >= quantityKg ? 100 : (ngoCapacity / quantityKg) * 100;
    
    // Urgent if expiry hours is low (e.g. <= 3 hours)
    const expiryHours = listingData.expiryTime || 4;
    const expScore = expiryHours <= 3 ? 100 : Math.max(0, 100 - (expiryHours - 3) * 10);
    const qtyScore = Math.min(100, (quantityKg / 5) * 100);

    const matchScore = Math.round((distScore * distWeight) + (capScore * capWeight) + (expScore * expWeight) + (qtyScore * qtyWeight));

    return {
      id: ngo.id,
      name: ngo.name,
      location: ngo.location,
      capacityKg: ngoCapacity,
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMin: durationMin !== null ? Number(durationMin.toFixed(1)) : null,
      method,
      matchScore: Math.min(100, Math.max(0, matchScore))
    };
  });

  // 5. Sort descending by match score and return top 3
  matchedNgos.sort((a, b) => b.matchScore - a.matchScore);
  return matchedNgos.slice(0, 3);
});
