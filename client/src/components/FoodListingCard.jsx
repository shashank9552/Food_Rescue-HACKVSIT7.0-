import React from 'react';

export default function FoodListingCard({ listing }) {
  const mockListing = {
    foodType: "Surplus Veg meals",
    quantityKg: 15,
    status: "posted",
    ...listing
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '6px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h4>🍱 {mockListing.foodType}</h4>
      <p>Quantity: <strong>{mockListing.quantityKg} kg</strong></p>
      <p>Status: <span style={{ textTransform: 'uppercase', color: '#0066cc', fontWeight: 'bold' }}>{mockListing.status}</span></p>
      <p style={{ fontSize: '12px', color: '#666' }}>TODO: Add state transition actions (Claim / Pick Up / Deliver) depending on user role.</p>
    </div>
  );
}
