const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

exports.predictWaste = onCall({ cors: true }, async (request) => {
  const { restaurantId } = request.data || {};
  if (!restaurantId) {
    throw new HttpsError("invalid-argument", "The function must be called with a restaurantId.");
  }

  const db = admin.firestore();
  const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();

  if (!restaurantDoc.exists) {
    throw new HttpsError("not-found", `Restaurant with ID ${restaurantId} not found.`);
  }

  const restaurantData = restaurantDoc.data();
  const pastListingsKg = restaurantData.pastListingsKg || [];

  // Get the last 7 entries of pastListingsKg
  const trailing = pastListingsKg.slice(-7);
  const basedOnDays = trailing.length;

  let average = 10.0; // Default fallback if no history exists
  if (basedOnDays > 0) {
    const sum = trailing.reduce((acc, val) => acc + val, 0);
    average = sum / basedOnDays;
  }

  // Parse inputs from request data
  const inputData = request.data || {};
  const weather = inputData.weather || "clear"; // clear, rainy, stormy
  const festival = !!inputData.festival;
  const traffic = inputData.traffic || "normal"; // normal, high, low

  // Determine day of week
  let dayOfWeek = inputData.dayOfWeek;
  if (dayOfWeek === undefined) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dayOfWeek = tomorrow.getDay();
  }
  const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);

  // Apply heuristic forecasting rules
  let predictedKg = average;
  
  if (weekendBoost) {
    predictedKg *= 1.25;
  }
  if (festival) {
    predictedKg *= 1.30;
  }
  if (weather === "rainy" || weather === "stormy") {
    predictedKg *= 1.20; // drop in sales, more waste
  }
  if (traffic === "low") {
    predictedKg *= 1.15;
  } else if (traffic === "high") {
    predictedKg *= 0.85; // high sales, less waste
  }

  predictedKg = Number(predictedKg.toFixed(1));
  const expectedMeals = Math.round(predictedKg * 2.5);

  // Calculate confidence percentage
  let confidence = 70;
  if (basedOnDays >= 7) confidence += 10;
  if (inputData.weather && inputData.traffic) confidence += 10;
  confidence = Math.min(95, confidence);

  // Dynamic Suggestion
  let suggestion = "Moderate surplus expected. Keep standard prep levels but keep containers ready for donation.";
  if (predictedKg > 12) {
    suggestion = "Prepare fewer meals tomorrow. Expecting high leftovers due to weather/traffic trends.";
  } else if (predictedKg < 8) {
    suggestion = "Low surplus expected. Great kitchen efficiency! Continue current prep levels.";
  }

  return {
    predictedKg,
    basedOnDays,
    weekendBoost,
    expectedMeals,
    confidence,
    suggestion
  };
});
