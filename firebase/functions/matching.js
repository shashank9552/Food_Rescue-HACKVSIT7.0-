const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { haversineKm, getDistancesKmWithTimeout } = require("./utils/distance");

exports.findMatch = onCall({ secrets: ["GOOGLE_MAPS_API_KEY"] }, async (request) => {
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

    return {
      id: ngo.id,
      name: ngo.name,
      location: ngo.location,
      capacityKg: ngo.capacityKg,
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMin: durationMin !== null ? Number(durationMin.toFixed(1)) : null,
      method
    };
  });

  // 5. Sort ascending by distance and return top 3
  matchedNgos.sort((a, b) => a.distanceKm - b.distanceKm);
  return matchedNgos.slice(0, 3);
});
