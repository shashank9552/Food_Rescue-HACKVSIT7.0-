import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, Utensils, MapPin, Clock, FileText } from 'lucide-react';

export default function RestaurantDashboard() {
  const rescueItems = useStore((state) => state.rescueItems);
  const addRescueItem = useStore((state) => state.addRescueItem);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [restaurantName, setRestaurantName] = useState('La Piazza Trattoria');
  const [address, setAddress] = useState('456 Olive Way, Foodville');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addRescueItem({
      name,
      description,
      restaurantName,
      address,
    });

    setName('');
    setDescription('');
    setShowForm(false);
  };

  // For presentation, filter items belonging to this restaurant (or show all with filter toggles)
  const [filterAll, setFilterAll] = useState(false);
  const filteredItems = filterAll 
    ? rescueItems 
    : rescueItems.filter(item => item.restaurantName === restaurantName);

  return (
    <DashboardLayout title="Partner Restaurant Portal" roleName="Restaurant">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Actions / Create Donation */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-slate-900">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <span>Restaurant Info</span>
            </h3>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Establishment</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Default Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/10"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Rescue Request</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-emerald-500/20 bg-slate-900/10 flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-lg font-bold text-white">New Food Donation</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Item Title & Quantity *</label>
                <input
                  type="text"
                  placeholder="e.g. 15 Trays of Roast Chicken"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Handling Instructions</label>
                <textarea
                  placeholder="e.g. Kept hot. Needs pickup by 9 PM. Boxed separately."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                >
                  Post Offer
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column - Listings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Donation Listings</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterAll(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!filterAll ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                My Listings
              </button>
              <button
                onClick={() => setFilterAll(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterAll ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                All Platform Listings
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredItems.length === 0 ? (
              <div className="glass p-8 text-center rounded-2xl border border-slate-900">
                <p className="text-slate-500 text-sm">No rescue items found matching your filters.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="glass p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-white">{item.name}</h4>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-slate-500" />
                        <span>Source: <strong>{item.restaurantName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Posted: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {item.ngoName && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Claimed by: <span className="text-amber-400 font-medium">{item.ngoName}</span></span>
                        </div>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-slate-500 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/50 max-w-xl">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
