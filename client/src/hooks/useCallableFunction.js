import { useState } from 'react';

// TODO: Integrate Firebase Functions HTTPS Callable SDK (httpsCallable)
// This hook will call the backend Cloud Functions:
// - findMatch({ listingId })
// - predictWaste({ restaurantId })
export function useCallableFunction(functionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (payload) => {
    setLoading(true);
    setError(null);
    console.log(`[useCallableFunction] Executing mock call to: ${functionName}`, payload);
    
    // Simulate short network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);

    // Mock output matching backend function responses
    if (functionName === "findMatch") {
      return {
        data: [
          { id: "helping_hands", name: "Helping Hands", distanceKm: 0.76, method: "haversine" },
          { id: "anna_seva_trust", name: "Anna Seva Trust", distanceKm: 1.22, method: "haversine" }
        ]
      };
    } else if (functionName === "predictWaste") {
      return {
        data: { predictedKg: 12.5, basedOnDays: 7, weekendBoost: true }
      };
    }

    return { data: null };
  };

  return {
    execute,
    loading,
    error
  };
}
