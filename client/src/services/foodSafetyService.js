// AI Food Safety & Expiry Heuristic Knowledge Base
export const SAFETY_DATABASE = {
  "Veg Meals": { room: 4, fridge: 24, frozen: 72, label: "Veg Meals (Cooked)" },
  "Non-Veg Meals": { room: 3, fridge: 18, frozen: 48, label: "Non-Veg Meals (Cooked)" },
  "Bakery & Desserts": { room: 12, fridge: 48, frozen: 120, label: "Bakery & Desserts" },
  "Fresh Produce": { room: 24, fridge: 120, frozen: 240, label: "Fresh Fruits & Veg" },
  "Dry Groceries": { room: 720, fridge: 720, frozen: 720, label: "Dry Snacks & Packaged Foods" }
};

// 1. Calculate the exact safe consumption window date-time
export function calculateSafeWindow(category, storage, preparedTime) {
  const prepDate = new Date(preparedTime);
  if (isNaN(prepDate.getTime())) return new Date();

  const rules = SAFETY_DATABASE[category] || SAFETY_DATABASE["Veg Meals"];
  
  // select storage multiplier hours
  let hours = rules.room;
  if (storage === "Refrigerated") hours = rules.fridge;
  if (storage === "Frozen") hours = rules.frozen;

  return new Date(prepDate.getTime() + hours * 3600 * 1000);
}

// 2. Calculate remaining freshness percentage
export function calculateFreshness(preparedTime, safeUntil) {
  const prep = new Date(preparedTime).getTime();
  const safe = new Date(safeUntil).getTime();
  const now = Date.now();

  if (now >= safe) return 0;
  if (now <= prep) return 100;

  const totalWindow = safe - prep;
  if (totalWindow <= 0) return 0;

  const remaining = safe - now;
  return Math.min(100, Math.max(0, Math.round((remaining / totalWindow) * 100)));
}

// 3. Assign Risk Level (Green, Yellow, Red)
export function calculateRiskLevel(freshness) {
  if (freshness >= 50) return "Safe"; // Green
  if (freshness > 0) return "Moderate"; // Yellow / Donate Soon
  return "High"; // Red / Unsafe
}

// 4. Calculate Pickup Urgency Priority
export function calculatePickupPriority(freshness, hoursLeft) {
  if (freshness <= 0 || hoursLeft <= 0) return "None";
  if (hoursLeft <= 1.0) return "Urgent";
  if (hoursLeft <= 3.0) return "High";
  if (hoursLeft <= 6.0) return "Medium";
  return "Low";
}

// 5. Generate human-friendly natural recommendations
export function generateSafetyRecommendation(risk, freshness, storage, category) {
  if (risk === "High") {
    return "❌ Food has exceeded the safe donation window. Do not publish or distribute.";
  }

  const recs = [];
  recs.push("✅ Food is currently analyzed as safe for donation.");

  if (freshness < 30) {
    recs.push("🚨 Schedule pickup within the next 45 minutes to guarantee safety.");
  } else if (freshness < 60) {
    recs.push("⚠ Expedited collection recommended to optimize nutritional value.");
  }

  if (storage === "Room Temperature" && category !== "Dry Groceries") {
    recs.push("❄ Recommend shifting to cold storage (refrigeration) to extend safe window.");
  }

  if (category === "Non-Veg Meals") {
    recs.push("🍗 Strictly maintain temperature logging during volunteer transit.");
  }

  return recs.join("\n• ");
}

// 6. Calculate overall Food Health Score (out of 100)
export function calculateHealthScore(freshness, storage, category) {
  if (freshness <= 0) return 0;

  let score = freshness * 0.7; // Freshness dominates (70%)

  // Storage bonus (15%)
  if (storage === "Frozen") score += 15;
  else if (storage === "Refrigerated") score += 10;
  else score += 5;

  // Category durability bonus (15%)
  if (category === "Dry Groceries") score += 15;
  else if (category === "Bakery & Desserts") score += 10;
  else if (category === "Fresh Produce") score += 8;
  else score += 5; // cooked meals

  return Math.min(100, Math.max(0, Math.round(score)));
}

// 7. Validate and aggregate all safety metrics
export function validateDonation(category, storage, preparedTime) {
  const safeUntil = calculateSafeWindow(category, storage, preparedTime);
  const freshnessScore = calculateFreshness(preparedTime, safeUntil);
  const risk = calculateRiskLevel(freshnessScore);
  
  const timeLeftMs = safeUntil.getTime() - Date.now();
  const hoursLeft = Math.max(0, timeLeftMs / (3600 * 1000));
  
  const pickupPriority = calculatePickupPriority(freshnessScore, hoursLeft);
  const recommendation = generateSafetyRecommendation(risk, freshnessScore, storage, category);
  const healthScore = calculateHealthScore(freshnessScore, storage, category);

  // Generate countdown string
  let countdown = "Expired";
  if (timeLeftMs > 0) {
    const hours = Math.floor(timeLeftMs / (3600 * 1000));
    const mins = Math.floor((timeLeftMs % (3600 * 1000)) / (60 * 1000));
    countdown = `${hours}h ${mins}m`;
  }

  return {
    safeUntil: safeUntil.toISOString(),
    freshnessScore,
    risk,
    pickupPriority,
    recommendation,
    healthScore,
    countdown,
    status: risk === "High" ? "Unsafe" : "Safe"
  };
}
