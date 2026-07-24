import React from 'react';

export default function StatusTracker() {
  return (
    <div style={{ border: '1px solid #eaeaea', padding: '15px', margin: '10px 0', background: '#fff', borderRadius: '6px' }}>
      <h3>🚚 Delivery Progress Tracker</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
        <span>🟢 Posted</span>
        <span>🟡 Claimed</span>
        <span>🔵 Picked Up</span>
        <span>⚪ Delivered</span>
      </div>
      <p style={{ fontSize: '12px', color: '#666' }}>TODO: Bind state indicator to real-time listing status and show driver ETA.</p>
    </div>
  );
}
