import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';

export default function DashboardLayout({ title, roleName, children }) {
  const navigate = useNavigate();
  const socketConnected = useStore((state) => state.socketConnected);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Roles</span>
            </button>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                Food Rescue <span className="text-emerald-400">AI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-semibold uppercase tracking-wider">
                  {roleName}
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-300 hidden md:block">{title}</h2>
            <div className="h-6 w-px bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              {socketConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Socket Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-xs font-semibold text-rose-400">Offline (Mock Mode)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Foot */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <p>&copy; 2026 Food Rescue AI. Mock API: http://localhost:5000/api</p>
      </footer>
    </div>
  );
}
