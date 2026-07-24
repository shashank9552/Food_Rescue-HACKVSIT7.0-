import React from 'react';
import FoodListingCard from '../components/FoodListingCard';
import PredictionCard from '../components/PredictionCard';

export default function RestaurantDashboard() {
  return (
    <div>
      <h2>Restaurant Dashboard</h2>
      <p>Post surplus food, check status tracking, and forecast surplus quantities.</p>
      
      <PredictionCard />

      <div style={{ marginTop: '20px' }}>
        <h3>Active Food Listings</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>TODO: Fetch foodListings where restaurantId == currentUser.uid.</p>
        <FoodListingCard listing={{ foodType: "Assorted Breads & pastries", quantityKg: 6, status: "posted" }} />
      </div>
    </div>
  );
}
