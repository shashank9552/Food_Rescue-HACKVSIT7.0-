import React from 'react';

export default function TabNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'ngo', label: 'NGO' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'admin', label: 'Admin' }
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '2px solid #ccc', margin: '20px 0', paddingBottom: '10px', gap: '8px' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: '10px 16px',
            cursor: 'pointer',
            background: activeTab === tab.id ? '#0066cc' : '#f2f2f2',
            color: activeTab === tab.id ? '#ffffff' : '#333333',
            border: 'none',
            borderRadius: '4px',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
            transition: 'background 0.2s'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
