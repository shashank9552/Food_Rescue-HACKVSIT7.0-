const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

exports.onFoodListingUpdated = onDocumentUpdated("foodListings/{listingId}", async (event) => {
  const newValue = event.data.after.data();
  const oldValue = event.data.before.data();

  // Guard against missing data (e.g. deletion)
  if (!newValue || !oldValue) {
    return;
  }

  // Check if status changed to "delivered"
  if (newValue.status === "delivered" && oldValue.status !== "delivered") {
    const db = admin.firestore();
    const quantityKg = newValue.quantityKg || 0;

    const mealsSaved = quantityKg * 2.5;
    const co2eAvoidedKg = quantityKg * 2.5;

    try {
      await db.collection("matches").add({
        listingId: event.params.listingId,
        mealsSaved,
        co2eAvoidedKg,
        deliveredAt: FieldValue.serverTimestamp()
      });
      console.log(`[Impact Trigger] Match recorded for listing ID ${event.params.listingId}: mealsSaved=${mealsSaved}, co2eAvoidedKg=${co2eAvoidedKg}`);
    } catch (err) {
      console.error(`[Impact Trigger] Failed to record match for listing ID ${event.params.listingId}:`, err);
    }
  }
});
