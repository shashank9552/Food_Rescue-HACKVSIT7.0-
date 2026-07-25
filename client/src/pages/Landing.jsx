import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  Leaf, 
  TrendingUp, 
  Award,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = (role) => {
    if (user) {
      navigate('/select-role');
    } else {
      navigate('/login');
    }
  };

  const steps = [
    {
      title: "1. Post Surplus Food",
      desc: "Restaurants upload their excess food details, expiry times, and pictures in under a minute.",
      icon: Building2,
      color: "bg-green-150 text-green-700"
    },
    {
      title: "2. Intelligent Matching",
      desc: "Our AI-powered scoring system instantly calculates the best-suited NGOs based on proximity, capacity, and urgency.",
      icon: Award,
      color: "bg-amber-150 text-amber-700"
    },
    {
      title: "3. NGO Claim",
      desc: "Local NGOs receive match notifications and claim the listings that align with their distribution capacity.",
      icon: HeartHandshake,
      color: "bg-emerald-150 text-emerald-700"
    },
    {
      title: "4. Volunteer Transit",
      desc: "Independent couriers accept routing tasks, pick up from the kitchen, and complete the delivery safely.",
      icon: Truck,
      color: "bg-blue-150 text-blue-700"
    }
  ];

  return (
    <div className="relative min-h-screen bg-surface text-text flex flex-col justify-between overflow-x-hidden dark:bg-bg-dark dark:text-text-dark">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-green-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 dark:bg-surface-dark/95 dark:border-border-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-md shadow-green-600/20">
            <span className="font-extrabold text-white text-lg">F</span>
          </div>
          <div>
            <h1 className="font-extrabold text-text tracking-tight text-base dark:text-text-dark">Food Rescue <span className="text-primary">AI</span></h1>
            <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold dark:text-text-dark/70">Hackathon Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <button 
              onClick={() => navigate('/select-role')}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-secondary shadow-md shadow-primary/15 transition-all flex items-center gap-1"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 border border-border text-text rounded-xl text-xs font-bold hover:bg-surface hover:text-text transition-all dark:border-border-dark dark:text-text-dark"
            >
              Partner Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Block */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
            <Leaf className="w-3.5 h-3.5" />
            <span>Reducing Food Waste dynamically</span>
          </span>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-text leading-tight dark:text-text-dark">
            Save Food.<br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Feed People.</span>
          </h2>
          
          <p className="text-slate-500 text-base md:text-lg leading-relaxed dark:text-text-dark/80">
            Every day, restaurants waste thousands of meals while people go hungry. **Food Rescue AI** bridges that gap by intelligently connecting excess supply to neighborhood distribution hubs in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => handleCTA('restaurant')}
              className="flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-500 py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-green-600/15 transition-all"
            >
              <span>Join as Restaurant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCTA('ngo')}
              className="flex items-center justify-center gap-2 bg-card border border-border text-text hover:bg-surface py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark dark:text-text-dark dark:hover:bg-bg-dark"
            >
              <span>Join as NGO</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCTA('volunteer')}
              className="flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent/90 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md shadow-accent/20 transition-all"
            >
              <span>Become Volunteer</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Hero Block (Vibrant CSS Graphic illustration) */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="w-full max-w-md h-[380px] bg-gradient-to-tr from-primary/20 to-secondary/10 rounded-3xl border border-border p-8 shadow-xl flex flex-col justify-between relative overflow-hidden glass animate-fadeIn dark:border-border-dark">
            {/* Ambient visual overlay elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-primary dark:bg-surface-dark">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="w-8 h-px bg-border border-dashed dark:bg-border-dark" />
                <div className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-blue-600 dark:bg-surface-dark">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="w-8 h-px bg-border border-dashed dark:bg-border-dark" />
                <div className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-amber-600 dark:bg-surface-dark">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800">Dynamic Matching Score</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our matching framework parses distance matrices, NGO capacities, and food expiration windows to route donations instantly.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">Active Rescue Operations</span>
              </div>
              <span className="text-xs font-extrabold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">98.4% Match Rate</span>
            </div>
          </div>
        </div>

      </main>

      {/* Impact Counter Section */}
      <section className="bg-surface border-y border-border py-12 dark:bg-bg-dark dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl font-extrabold text-green-600">12,450 kg</h3>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Surplus Food Rescued</p>
          </div>
          <div className="space-y-2 border-y sm:border-y-0 sm:border-x border-border py-6 sm:py-0 dark:border-border-dark">
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900">31,125</h3>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Meals Provided to NGOs</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl font-extrabold text-amber-500">31.1 Tons</h3>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">$CO_2$ Emissions Prevented</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900">How It Works</h2>
          <p className="text-slate-500 text-sm">
            Bridging the gap between restaurant surpluses and community needs in four seamless stages.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color} shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface/70 border-y border-border py-20 dark:bg-bg-dark/80 dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">Platform Features</h2>
            <p className="text-slate-500 text-sm">
              Scalable, real-time utilities designed to optimize food collection logistics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-3 dark:bg-surface-dark dark:border-border-dark">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mb-4 dark:bg-primary/10 dark:text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text text-base dark:text-text-dark">Surplus Waste Forecasting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Utilize heuristic analytics models to forecast weekly surpluses. Get proactive alerts to reduce cooking volumes and save costs.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-3 dark:bg-surface-dark dark:border-border-dark">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mb-4 dark:bg-accent/15 dark:text-accent">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text text-base dark:text-text-dark">Smart Priority Score</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Auto-matches listings with the nearest eligible NGO based on capacity, distance weights, and food expiration windows.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-3 dark:bg-surface-dark dark:border-border-dark">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 dark:bg-secondary/15 dark:text-secondary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text text-base dark:text-text-dark">Impact Analytics Reporting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track meals served and aggregate carbon emissions avoided. Export metrics directly for corporate sustainability profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900">Partner Stories</h2>
          <p className="text-slate-500 text-sm">
            Hear from the operators and community workers using Food Rescue AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm relative dark:bg-surface-dark dark:border-border-dark">
            <p className="text-sm italic text-slate-600 leading-relaxed mb-6 dark:text-text-dark/70">
              "We used to throw away kilograms of fresh breads and dishes every Friday night. Now, with Food Rescue AI, volunteers collect the packages within 40 minutes, and the food goes directly to families in need."
            </p>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Chef Marco Silva</h4>
              <p className="text-xs text-slate-400">La Piazza Trattoria</p>
            </div>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm relative dark:bg-surface-dark dark:border-border-dark">
            <p className="text-sm italic text-slate-600 leading-relaxed mb-6 dark:text-text-dark/70">
              "Matching logic automatically prioritizes listings according to our capacity. Since it manages pickup coordination directly, our staff can spend more time distributing meals rather than planning schedules."
            </p>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Sunita Sharma</h4>
              <p className="text-xs text-slate-400">Helping Hands Foundation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center text-xs text-slate-400 border-t border-border bg-card dark:border-border-dark dark:bg-surface-dark dark:text-text-dark">
        <p>&copy; 2026 Food Rescue AI. Open-source demo under MIT License.</p>
      </footer>
    </div>
  );
}
