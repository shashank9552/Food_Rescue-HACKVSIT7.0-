import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // 1. If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If authenticated but has no profile role, redirect to role selection (unless already there)
  if (userProfile && !userProfile.role && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  // 3. If they have a role but try to access /select-role, redirect them to their respective dashboard
  if (userProfile && userProfile.role && location.pathname === '/select-role') {
    const rolePathMap = {
      restaurant: '/restaurant',
      ngo: '/ngo',
      volunteer: '/volunteer',
      admin: '/admin',
    };
    return <Navigate to={rolePathMap[userProfile.role] || '/'} replace />;
  }

  // 4. If allowedRoles is specified, check if user's role is permitted
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    // Redirect to their default dashboard
    const rolePathMap = {
      restaurant: '/restaurant',
      ngo: '/ngo',
      volunteer: '/volunteer',
      admin: '/admin',
    };
    return <Navigate to={rolePathMap[userProfile.role] || '/'} replace />;
  }

  return children;
}
