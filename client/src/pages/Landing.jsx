import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Building2, HeartHandshake, ShieldAlert, Truck, ChevronRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const setRole = useStore((state) => state.setRole);

  const roles = [
    {
      id: 'restaurant',
      name: 'Restaurant',
      path: '/restaurant',
      description: 'Donate surplus food and manage active listings.',
      icon: Building2,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      id: 'ngo',
      name: 'NGO / Food Bank',
      path: '/ngo',
      description: 'Claim available donations for community distribution.',
      icon: HeartHandshake,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400',
    },
    {
      id: 'volunteer',
      name: 'Volunteer',
      path: '/volunteer',
      description: 'Accept delivery tasks and transport food safely.',
      icon: Truck,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
      badgeColor: 'bg-blue-500/10 text-blue-400',
    },
    {
      id: 'admin',
      name: 'System Admin',
      path: '/admin',
      description: 'Oversee operations, metrics, and manage user issues.',
      icon: ShieldAlert,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      badgeColor: 'bg-purple-500/10 text-purple-400',
    },
  ];

  const handleRoleSelect = (roleId, path) => {
    setRole(roleId);
    navigate(path);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-slate-950 text-xl">F</span>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">Food Rescue <span className="text-emerald-400">AI</span></h1>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Hackathon Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Local server mode</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col justify-center items-center">
        <div className="text-center max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Bridging Surplus Food and Community Need
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            An intelligent real-time coordinator linking surplus commercial food supply to local distribution networks. Choose your role below to start.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id, role.path)}
                className={`group text-left glass glass-hover p-6 rounded-2xl flex flex-col justify-between border bg-gradient-to-b ${role.color} h-64`}
              >
                <div className="w-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.badgeColor} mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {role.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors mt-4 self-end">
                  Enter Dashboard <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        <p>&copy; 2026 Food Rescue AI. Open-source prototype.</p>
      </footer>
    </div>
  );
}
