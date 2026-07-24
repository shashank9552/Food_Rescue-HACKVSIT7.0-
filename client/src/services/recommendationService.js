import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// 1. Calculate travel distance using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 2. Capacity Score (20%): favor NGOs that can easily accommodate the listing quantity
export function calculateCapacityScore(quantity, maxCapacity, currentCapacity) {
  const available = Math.max(0, maxCapacity - currentCapacity);
  if (available >= quantity) return 100;
  if (available <= 0) return 0;
  return (available / quantity) * 100;
}

// 3. Expiry Urgency Score (20%): if food expires soon, favor NGOs with faster pickup windows
export function calculateExpiryScore(expiryHours, averagePickupMinutes) {
  // Urgency weight climbs as expiry hours drop below 4 hours
  const urgencyFactor = expiryHours <= 2 ? 1.0 : expiryHours <= 4 ? 0.6 : 0.2;
  
  // Fast pickup score (max score for 10 min pickup, drops to 0 at 60 mins)
  const speedScore = Math.max(0, 100 - (averagePickupMinutes - 10) * 2);
  
  // Under high urgency, speed dominates the score. Under low urgency, all get a high baseline.
  return (urgencyFactor * speedScore) + ((1-urgencyFactor) * 100);
}

// 4. Reliability Score (5%): directly maps success rates
export function calculateReliabilityScore(successRate) {
  return typeof successRate === 'number' ? successRate : 90;
}

// 5. Calculate Final Score (combines all weighted factors)
export function calculateFinalScore(listing, ngo) {
  const restLoc = listing.restaurantLocation || { lat: 28.6519, lng: 77.2315 };
  const ngoLoc = ngo.location || { lat: 28.6470, lng: 77.2260 };

  const distance = calculateDistance(restLoc.lat, restLoc.lng, ngoLoc.lat, ngoLoc.lng);
  
  // Compatibility Check (10%): strictly check if category is accepted
  const acceptedList = ngo.acceptedCategories || ["Veg Meals"];
  const isCompatible = acceptedList.includes(listing.foodCategory);
  const compatibilityScore = isCompatible ? 100 : 0;

  // Workload Check (10%): fewer active requests = higher score
  const activeRequests = ngo.activeRequests || 0;
  const workloadScore = Math.max(0, 100 - activeRequests * 25); // reaches 0 at 4 active requests

  // Individual factor scores normalized 0-100
  const distScore = Math.max(0, 100 - distance * 10); // reaches 0 at 10km
  const capScore = calculateCapacityScore(listing.quantity, ngo.maxCapacity || 25, ngo.currentCapacity || 5);
  const expScore = calculateExpiryScore(listing.expiryTime || 4, ngo.averagePickupTime || 20);
  const relScore = calculateReliabilityScore(ngo.successRate);

  // Weights
  const wDist = 0.35;
  const wCap = 0.20;
  const wExp = 0.20;
  const wComp = 0.10;
  const wWork = 0.10;
  const wRel = 0.05;

  const finalScore = 
    (distScore * wDist) + 
    (capScore * wCap) + 
    (expScore * wExp) + 
    (compatibilityScore * wComp) + 
    (workloadScore * wWork) + 
    (relScore * wRel);

  return {
    score: Math.min(100, Math.max(0, Math.round(finalScore))),
    distance,
    isCompatible
  };
}

// 6. Generate natural-language explanation (simulating AI agent reasoning)
export function generateAIExplanation(ngo, score, distance, listing) {
  const reasons = [];

  // Distance reason
  if (distance <= 1.5) {
    reasons.push(`Only ${distance.toFixed(1)} km away, enabling a highly responsive local dispatch.`);
  } else {
    reasons.push(`Located ${distance.toFixed(1)} km away, within standard transport boundaries.`);
  }

  // Capacity reason
  const availableCap = Math.max(0, (ngo.maxCapacity || 25) - (ngo.currentCapacity || 5));
  if (availableCap >= listing.quantity) {
    reasons.push(`NGO has ${availableCap} kg capacity available, which easily fits your ${listing.quantity} kg offer.`);
  } else {
    reasons.push(`NGO has limited storage (${availableCap} kg available), but can accept a partial rescue.`);
  }

  // Urgency & speed reason
  if (listing.expiryTime <= 2.5) {
    reasons.push(`Food expires in ${listing.expiryTime} hrs; this NGO averages a fast ${ngo.averagePickupTime || 20}-minute response window.`);
  } else {
    reasons.push(`Average pickup speed of ${ngo.averagePickupTime || 20} mins fits comfortably within your ${listing.expiryTime} hr window.`);
  }

  // Workload reason
  const activeReq = ngo.activeRequests || 0;
  if (activeReq <= 1) {
    reasons.push("Extremely low workload right now, ensuring immediate volunteer attention.");
  } else {
    reasons.push(`Managing ${activeReq} active requests; capacity is moderate but stable.`);
  }

  // Reliability reason
  if (ngo.successRate >= 95) {
    reasons.push(`Outstanding delivery history (Success rate: ${ngo.successRate}%).`);
  }

  return reasons.join("\n• ");
}

// 7. Get top 3 recommendations and write to Firestore listing document
export async function getTopRecommendations(listing, ngosList) {
  if (!listing || !ngosList || ngosList.length === 0) return [];

  const ratedNgos = ngosList.map(ngo => {
    const { score, distance, isCompatible } = calculateFinalScore(listing, ngo);
    const reason = generateAIExplanation(ngo, score, distance, listing);
    
    return {
      ngoId: ngo.id,
      ngoName: ngo.ngoName || ngo.name,
      matchScore: score,
      distance: Number(distance.toFixed(2)),
      reason: `• ${reason}`,
      estimatedPickup: `${ngo.averagePickupTime || 20} min`,
      successRate: ngo.successRate || 95,
      maxCapacity: ngo.maxCapacity || 25,
      currentCapacity: ngo.currentCapacity || 5,
      isCompatible
    };
  });

  // Filter: strictly require category compatibility
  const compatibleNgos = ratedNgos.filter(n => n.isCompatible);

  // Sort descending by match score
  compatibleNgos.sort((a, b) => b.matchScore - a.matchScore);

  const top3 = compatibleNgos.slice(0, 3);

  // Save to Firestore listing document
  try {
    const listingRef = doc(db, 'foodListings', listing.id);
    await updateDoc(listingRef, {
      recommendedNGOs: top3.map(r => ({
        ngoId: r.ngoId,
        ngoName: r.ngoName,
        matchScore: r.matchScore,
        distance: r.distance,
        reason: r.reason,
        estimatedPickup: r.estimatedPickup
      }))
    });
  } catch (err) {
    console.error("Failed to save recommendations to Firestore:", err);
  }

  return top3;
}
