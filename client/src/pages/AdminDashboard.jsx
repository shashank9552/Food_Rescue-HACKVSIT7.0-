import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>View global impact statistics and monitor live matching events.</p>
      
      <div style={{ display: 'flex', gap: '16px', margin: '20px 0' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '6px', flex: 1, textAlign: 'center', background: '#e6f7ff' }}>
          <h4>Total Meals Saved</h4>
          <h2 style={{ margin: '10px 0', fontSize: '32px', color: '#0066cc' }}>350</h2>
          <p style={{ fontSize: '12px', color: '#666' }}>TODO: Calculate sum(mealsSaved) from '/matches' collection.</p>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '6px', flex: 1, textAlign: 'center', background: '#f6ffed' }}>
          <h4>CO2e Avoided</h4>
          <h2 style={{ margin: '10px 0', fontSize: '32px', color: '#389e0d' }}>350 kg</h2>
          <p style={{ fontSize: '12px', color: '#666' }}>TODO: Calculate sum(co2eAvoidedKg) from '/matches' collection.</p>
        </div>
      </div>

      <h3>Live Completed Matches</h3>
      <p style={{ fontSize: '12px', color: '#666' }}>TODO: Render list of '/matches' documents ordered by deliveredAt desc.</p>
    </div>
  );
}
