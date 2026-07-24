import React from 'react';

export default function PredictionCard() {
  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', background: '#f9f9f9', borderRadius: '6px' }}>
      <h3>🔮 Smart Waste Predictor</h3>
      <p>Forecast tomorrow's surplus food volume using past weekly patterns.</p>
      <button style={{ padding: '8px 12px', cursor: 'pointer' }}>Run AI Prediction</button>
      <p style={{ fontSize: '12px', color: '#666' }}>TODO: Call 'predictWaste' function on click and show forecasted kg and weekend boost status.</p>
    </div>
  );
}
