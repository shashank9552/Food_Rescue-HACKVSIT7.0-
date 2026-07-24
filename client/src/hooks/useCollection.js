import { useState, useEffect } from 'react';

// TODO: Integrate Firestore collection listener (onSnapshot)
// In production, this hook will dynamically listen to collections like:
// - /restaurants
// - /ngos
// - /volunteers
// - /foodListings
// - /matches
export function useCollection(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(`[useCollection] Setting up listener for Firestore collection: ${collectionName}`);
    
    // Provide mock data based on collection request to allow dashboard layout previewing
    if (collectionName === "foodListings") {
      setData([
        { id: "listing-1", foodType: "Biryani", quantityKg: 10, status: "posted" },
        { id: "listing-2", foodType: "Sandwiches", quantityKg: 5, status: "claimed" }
      ]);
    } else if (collectionName === "matches") {
      setData([
        { id: "match-1", listingId: "listing-1", mealsSaved: 25, co2eAvoidedKg: 25 }
      ]);
    } else {
      setData([]);
    }

    return () => {
      console.log(`[useCollection] Cleaning up listener for collection: ${collectionName}`);
    };
  }, [collectionName]);

  return {
    data,
    loading
  };
}
