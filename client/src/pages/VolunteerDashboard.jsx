import React from 'react';
import FoodListingCard from '../components/FoodListingCard';
import MockMap from '../components/MockMap';
import StatusTracker from '../components/StatusTracker';

export default function VolunteerDashboard() {
  return (
    <div>
      <h2>Volunteer Dashboard</h2>
      <p>View assigned deliveries, track pickups, and mark listings as delivered.</p>

      <MockMap />
      <StatusTracker />

      <div style={{ marginTop: '20px' }}>
        <h3>Assigned Deliveries</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>TODO: Fetch listings where assignedVolunteer == currentUser.uid.</p>
        <FoodListingCard listing={{ foodType: "Veg Biryani Pots", quantityKg: 12, status: "claimed" }} />
      </div>
    </div>
  );
}
