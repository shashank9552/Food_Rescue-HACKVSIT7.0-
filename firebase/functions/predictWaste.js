const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

exports.predictWaste = onCall(async (request) => {
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

  let average = 0;
  if (basedOnDays > 0) {
    const sum = trailing.reduce((acc, val) => acc + val, 0);
    average = sum / basedOnDays;
  }

  // Determine if tomorrow is Fri/Sat/Sun
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = tomorrow.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);

  let predictedKg = average;
  if (weekendBoost) {
    predictedKg *= 1.25;
  }

  return {
    predictedKg: Number(predictedKg.toFixed(1)),
    basedOnDays,
    weekendBoost
  };
});
