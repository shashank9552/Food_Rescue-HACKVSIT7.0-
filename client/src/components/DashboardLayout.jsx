import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  BarChart3,
  Map,
  History,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function DashboardLayout({ title, children }) {
  const { userProfile, logout } = useAuth();
  const socketConnected = useStore((state) => state.socketConnected);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = userProfile?.role || 'volunteer';

  // Role details mapping
  const roleMeta = {
    restaurant: {
      label: 'Restaurant',
      icon: Building2,
      badgeColor: 'bg-green-100 text-green-700 border-green-200',
      links: [
        { name: 'Dashboard', path: '/restaurant', icon: LayoutDashboard },
        { name: 'Add Food Offer', path: '/restaurant?tab=add-food', icon: PlusCircle },
        { name: 'My Listings', path: '/restaurant?tab=my-listings', icon: ClipboardList },
        { name: 'Impact Analytics', path: '/analytics', icon: BarChart3 }
      ]
    },
    ngo: {
      label: 'NGO / Food Bank',
      icon: HeartHandshake,
      badgeColor: 'bg-amber-100 text-amber-750 border-amber-200',
      links: [
        { name: 'Dashboard', path: '/ngo', icon: LayoutDashboard },
        { name: 'Nearby Offers', path: '/ngo?tab=nearby', icon: Map },
        { name: 'Accepted Claims', path: '/ngo?tab=claims', icon: ClipboardList },
        { name: 'Impact Analytics', path: '/analytics', icon: BarChart3 }
      ]
    },
    volunteer: {
      label: 'Volunteer',
      icon: Truck,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      links: [
        { name: 'Dashboard', path: '/volunteer', icon: LayoutDashboard },
        { name: 'Nearby Pickups', path: '/volunteer?tab=pickups', icon: Map },
        { name: 'My Deliveries', path: '/volunteer?tab=deliveries', icon: ClipboardList },
        { name: 'Impact Analytics', path: '/analytics', icon: BarChart3 }
      ]
    },
    admin: {
      label: 'System Admin',
      icon: ShieldAlert,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      links: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Manage Users', path: '/admin?tab=users', icon: Users },
        { name: 'Active Listings', path: '/admin?tab=listings', icon: ClipboardList },
        { name: 'Impact Analytics', path: '/analytics', icon: BarChart3 }
      ]
    }
  };

  const currentRoleMeta = roleMeta[role] || roleMeta['volunteer'];
  const RoleIcon = currentRoleMeta.icon;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const isActive = (path) => {
    const currentPath = location.pathname + location.search;
    // Fallback for default tab
    if (path.includes('?tab=')) {
      return currentPath === path;
    }
    return currentPath === path || (currentPath === path + '?tab=dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center">
            <span className="font-bold text-white text-base">F</span>
          </div>
          <h1 className="font-extrabold text-slate-900 tracking-tight text-md">Food Rescue AI</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile overlay */}
      <aside className={`w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 z-40 shadow-sm
        ${mobileMenuOpen ? 'fixed inset-y-0 left-0 translate-x-0 w-72' : 'hidden md:flex'}`}>
        
        <div className="flex flex-col flex-grow">
          {/* Sidebar Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-md shadow-green-600/10">
                <span className="font-extrabold text-white text-lg">F</span>
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 tracking-tight text-sm">Food Rescue AI</h1>
                <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">Hackathon Edition</p>
              </div>
            </div>
            {mobileMenuOpen && (
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 border border-slate-100 rounded-lg text-slate-400 md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                <RoleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-slate-900 truncate">{userProfile?.name || 'Anonymous User'}</h4>
                <p className="text-xs text-slate-400 truncate">{userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${currentRoleMeta.badgeColor}`}>
                {currentRoleMeta.label}
              </span>
              <div className="flex items-center gap-1">
                {socketConnected ? (
                  <Wifi className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex-grow space-y-1.5">
            {currentRoleMeta.links.map((link, idx) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/10' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {socketConnected ? 'Real-Time Sync Active' : 'Offline / Mock Server'}
            </span>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>

        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          <p>&copy; 2026 Food Rescue AI. Powered by Google Antigravity.</p>
        </footer>
      </div>
    </div>
  );
}
