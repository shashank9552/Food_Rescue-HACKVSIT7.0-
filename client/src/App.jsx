import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import RestaurantDashboard from './pages/RestaurantDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const initSocket = useStore((state) => state.initSocket);

  useEffect(() => {
    let unsubscribeStore = null;

    // Listen to Auth State changes: only subscribe when authenticated
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribeStore = initSocket();
      } else {
        if (unsubscribeStore) {
          unsubscribeStore();
          unsubscribeStore = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeStore) {
        unsubscribeStore();
      }
    };
  }, [initSocket]);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Setup Role Route */}
          <Route 
            path="/select-role" 
            element={
              <ProtectedRoute>
                <RoleSelection />
              </ProtectedRoute>
            } 
          />

          {/* Protected Role-Based Dashboards */}
          <Route 
            path="/restaurant" 
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ngo" 
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/volunteer" 
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
            </Routes>
        </Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
