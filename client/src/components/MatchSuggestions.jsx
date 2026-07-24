import React from 'react';

export default function MatchSuggestions() {
  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', background: '#fff', borderRadius: '6px' }}>
      <h3>🤝 AI Match Finder</h3>
      <p>Locate the closest eligible NGOs based on capacity constraints.</p>
      <button style={{ padding: '8px 12px', cursor: 'pointer' }}>Calculate Nearest matches</button>
      <p style={{ fontSize: '12px', color: '#666' }}>TODO: Execute 'findMatch' on click and render top 3 NGOs, highlighting distance calculation method ('haversine' or 'google').</p>
    </div>
  );
}
