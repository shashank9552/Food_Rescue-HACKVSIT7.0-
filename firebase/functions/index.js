const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

const { findMatch } = require("./matching");
const { predictWaste } = require("./predictWaste");
const { onFoodListingUpdated } = require("./impact");

// Export Callable Functions
exports.findMatch = findMatch;
exports.predictWaste = predictWaste;

// Export Firestore Trigger
exports.impact = onFoodListingUpdated;
