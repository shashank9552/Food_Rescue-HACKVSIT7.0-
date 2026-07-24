import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import Landing from './pages/Landing';
import RestaurantDashboard from './pages/RestaurantDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const initSocket = useStore((state) => state.initSocket);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/restaurant" element={<RestaurantDashboard />} />
        <Route path="/ngo" element={<NGODashboard />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
