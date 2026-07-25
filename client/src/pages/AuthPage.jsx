import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { Building2, HeartHandshake, ShieldAlert, Truck, Loader, Key, Mail, Sparkles, User } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, error: authError, login, signUp } = useAuth();
  const setRole = useStore((state) => state.setRole);
  const setUserName = useStore((state) => state.setUserName);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Profile States
  const [role, setSelectedRole] = useState('restaurant');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [formError, setFormError] = useState(null);

  // Set default role from URL search parameters if present (e.g. ?role=ngo)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['restaurant', 'ngo', 'volunteer', 'admin'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Once authenticated, update Zustand and redirect to role-specific dashboard
  useEffect(() => {
    if (user) {
      setRole(user.role);
      setUserName(user.name || user.email.split('@')[0]);
      
      // Redirect
      if (user.role === 'restaurant') navigate('/restaurant');
      else if (user.role === 'ngo') navigate('/ngo');
      else if (user.role === 'volunteer') navigate('/volunteer');
      else if (user.role === 'admin') navigate('/admin');
    }
  }, [user, navigate, setRole, setUserName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Please fill in email and password.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setFormError("Please provide a name/organization.");
          return;
        }

        const profileData = { name };
        if (role === 'restaurant') {
          profileData.location = { lat: 28.6519, lng: 77.2315 }; // Centered in Delhi
        } else if (role === 'ngo') {
          profileData.location = { lat: 28.6470, lng: 77.2260 };
          profileData.capacityKg = parseFloat(capacity) || 20;
        } else if (role === 'volunteer') {
          profileData.location = { lat: 28.6500, lng: 77.2300 };
        }

        await signUp(email, password, role, profileData);
      }
    } catch (err) {
      // Caught inside useAuth state, but handled here locally for flow
    }
  };

  const roles = [
    { id: 'restaurant', name: 'Restaurant', icon: Building2, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
    { id: 'ngo', name: 'NGO / Food Bank', icon: HeartHandshake, color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
    { id: 'volunteer', name: 'Volunteer', icon: Truck, color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
    { id: 'admin', name: 'System Admin', icon: ShieldAlert, color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' }
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-950 text-slate-100 px-4">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Card Header Logo */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="font-bold text-slate-950 text-xl">F</span>
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-white">Food Rescue <span className="text-emerald-400">AI</span></h1>
          <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Hackathon Gateway</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md glass border border-slate-900 rounded-3xl overflow-hidden shadow-2xl p-8 relative">
        <div className="flex justify-center border-b border-slate-900 pb-4 mb-6">
          <button
            onClick={() => { setIsLogin(true); setFormError(null); }}
            className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-all ${
              isLogin ? 'border-emerald-500 text-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setFormError(null); }}
            className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-all ${
              !isLogin ? 'border-emerald-500 text-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Registration Fields (Role selection, Profile details) */}
          {!isLogin && (
            <div className="space-y-4 pt-2 border-t border-slate-900/60 animate-fadeIn">
              
              {/* Role Selection Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          role === r.id 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' 
                            : 'bg-slate-900/40 text-slate-400 border-slate-900 hover:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name/Org name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">
                  {role === 'restaurant' && 'Restaurant Name'}
                  {role === 'ngo' && 'Organization Name'}
                  {role === 'volunteer' && 'Volunteer Name'}
                  {role === 'admin' && 'Admin Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Spice Garden"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Capacity Input for NGO */}
              {role === 'ngo' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Receiving Capacity (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}
            </div>
          )}

          {/* Errors Display */}
          {(formError || authError) && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {formError || authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/10 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isLogin ? 'Sign In to Dashboard' : 'Register Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Helper text */}
      <p className="text-slate-600 text-[10px] mt-6 leading-relaxed text-center max-w-xs">
        Connecting local Firebase Auth & Firestore instances. Secure role-based client token validation.
      </p>
    </div>
  );
}
