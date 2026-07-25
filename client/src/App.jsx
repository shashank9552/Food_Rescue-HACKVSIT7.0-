import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
<<<<<<< HEAD
import { ThemeProvider } from './context/ThemeContext';
=======
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
=======
import ImpactAnalytics from './pages/ImpactAnalytics';
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
      <ThemeProvider>
        <Router>
          <Routes>
=======
      <Router>
        <Routes>
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
            </Routes>
        </Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </ThemeProvider>
=======
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['restaurant', 'ngo', 'volunteer', 'admin']}>
                <ImpactAnalytics />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
    </AuthProvider>
  );
}

export default App;
