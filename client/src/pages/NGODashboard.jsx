import React from 'react';
import FoodListingCard from '../components/FoodListingCard';
import MatchSuggestions from '../components/MatchSuggestions';

export default function NGODashboard() {
  return (
    <div>
      <h2>NGO Dashboard</h2>
      <p>Manage NGO capacity constraints and claim available local food listings.</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Available Surplus Listings</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>TODO: Listen to active foodListings and allow claiming based on NGO capacity.</p>
        <FoodListingCard listing={{ foodType: "Lunch Boxes", quantityKg: 10, status: "posted" }} />
        <MatchSuggestions />
      </div>
    </div>
  );
}
