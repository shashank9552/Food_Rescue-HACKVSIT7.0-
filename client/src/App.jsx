import React, { useState } from 'react';
import TabNav from './components/TabNav';
import RestaurantDashboard from './pages/RestaurantDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('restaurant');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'restaurant':
        return <RestaurantDashboard />;
      case 'ngo':
        return <NGODashboard />;
      case 'volunteer':
        return <VolunteerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <RestaurantDashboard />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header>
        <h1 style={{ color: '#1a1a1a', margin: '0 0 4px 0' }}>🥘 Food Rescue AI</h1>
        <p style={{ color: '#666', margin: '0' }}>Hackathon Venue Prototype (Frontend Scaffold)</p>
      </header>

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ border: '1px solid #e0e0e0', padding: '24px', borderRadius: '8px', backgroundColor: '#ffffff', minHeight: '300px' }}>
        {renderActivePage()}
      </main>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eaeaea', textAlign: 'center', fontSize: '12px', color: '#999' }}>
        Food Rescue AI Backend & Client Scaffold &copy; 2026. Prepared for HackVSIT 7.0.
      </footer>
    </div>
  );
}
