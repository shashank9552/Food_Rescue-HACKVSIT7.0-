const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

admin.initializeApp();

// ===============================
// Existing Functions
// ===============================

const { findMatch } = require("./matching");
const { predictWaste } = require("./predictWaste");
const { onFoodListingUpdated } = require("./impact");

exports.findMatch = findMatch;
exports.predictWaste = predictWaste;
exports.impact = onFoodListingUpdated;

// ===================================================
// Create Custom Token
// ===================================================

exports.mintCustomToken = onCall(async (request) => {
  const { uid, role } = request.data || {};

  if (!uid || !role) {
    throw new HttpsError(
      "invalid-argument",
      "uid and role are required."
    );
  }

  const allowedRoles = [
    "restaurant",
    "ngo",
    "volunteer",
    "admin",
  ];

  if (!allowedRoles.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid role."
    );
  }

  const customToken =
    await admin.auth().createCustomToken(uid, {
      role,
    });

  return {
    customToken,
  };
});

// ===================================================
// Assign Role Claim
// ===================================================

exports.setUserRoleClaim = onCall(async (request) => {

  // -------------------------
  // User must be authenticated
  // -------------------------

  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Please login first."
    );
  }

  const callerUid = request.auth.uid;

  const { uid, role } = request.data || {};

  if (!uid || !role) {
    throw new HttpsError(
      "invalid-argument",
      "uid and role are required."
    );
  }

  // -------------------------
  // User can only assign
  // role to himself.
  // -------------------------

  if (callerUid !== uid) {
    throw new HttpsError(
      "permission-denied",
      "Cannot modify another user."
    );
  }

  const allowedRoles = [
    "restaurant",
    "ngo",
    "volunteer",
  ];

  if (!allowedRoles.includes(role)) {
    throw new HttpsError(
      "permission-denied",
      "Invalid role."
    );
  }

  await admin.auth().setCustomUserClaims(uid, {
    role,
  });

  return {
    success: true,
    message: `${role} role assigned successfully.`,
  };
});

// ===================================================
// Remove Role
// ===================================================

exports.removeRoleClaim = onCall(async (request) => {

  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Authentication required."
    );
  }

  await admin.auth().setCustomUserClaims(
    request.auth.uid,
    null
  );

  return {
    success: true,
  };
});