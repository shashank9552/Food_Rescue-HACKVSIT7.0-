import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { HeartHandshake, MapPin, Clock, CheckSquare, Plus, RefreshCw } from 'lucide-react';

export default function NGODashboard() {
  const rescueItems = useStore((state) => state.rescueItems);
  const claimRescueItem = useStore((state) => state.claimRescueItem);

  const [ngoName, setNgoName] = useState('Second Harvest Food Bank');
  const [activeTab, setActiveTab] = useState('available'); // available, claimed

  const handleClaim = (itemId) => {
    claimRescueItem(itemId, ngoName);
  };

  const availableItems = rescueItems.filter((item) => item.status === 'posted');
  const claimedItems = rescueItems.filter((item) => item.ngoName === ngoName);

  return (
    <DashboardLayout title="NGO Rescue Operations" roleName="NGO / Food Bank">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column - NGO Configurations */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-slate-900 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-400" />
              <span>NGO Settings</span>
            </h3>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Organization Name</label>
                <input
                  type="text"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="pt-2 text-xs text-slate-500 leading-relaxed">
                Organizations can claim active food items. Claimed items are made visible to volunteers for transit.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation and Lists */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Navigation tabs */}
          <div className="flex border-b border-slate-900">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-4 px-6 text-sm font-semibold relative transition-colors ${
                activeTab === 'available' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available Donations ({availableItems.length})
              {activeTab === 'available' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`pb-4 px-6 text-sm font-semibold relative transition-colors ${
                activeTab === 'claimed' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Our Claims ({claimedItems.length})
              {activeTab === 'claimed' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          </div>

          {/* List Content */}
          <div className="flex flex-col gap-4">
            {activeTab === 'available' ? (
              availableItems.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl border border-slate-900">
                  <p className="text-slate-500 mb-2">No donations currently available for rescue.</p>
                  <p className="text-xs text-slate-600">Active restaurants will publish offers when surplus food is available.</p>
                </div>
              ) : (
                availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{item.name}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-semibold">Restaurant:</span>
                          <span className="text-slate-300 font-medium">{item.restaurantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Posted: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/50 max-w-xl">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleClaim(item.id)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 self-start md:self-center"
                    >
                      <Plus className="w-4 h-4" />
                      Claim Donation
                    </button>
                  </div>
                ))
              )
            ) : (
              claimedItems.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl border border-slate-900">
                  <p className="text-slate-500">You haven't claimed any rescue items yet.</p>
                </div>
              ) : (
                claimedItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{item.name}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-semibold">Source:</span>
                          <span className="text-slate-300 font-medium">{item.restaurantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.address}</span>
                        </div>
                        {item.volunteerName && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-semibold">Courier:</span>
                            <span className="text-blue-400 font-medium">{item.volunteerName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 self-start md:self-center">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                      <span>
                        {item.status === 'claimed' && 'Awaiting volunteer pickup'}
                        {item.status === 'picked_up' && 'In transit'}
                        {item.status === 'delivered' && 'Rescue Completed'}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
