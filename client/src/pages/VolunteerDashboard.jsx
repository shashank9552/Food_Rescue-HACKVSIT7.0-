<<<<<<< HEAD
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { Truck, MapPin, Navigation, CheckCircle2, User } from 'lucide-react';

export default function VolunteerDashboard() {
  const rescueItems = useStore((state) => state.rescueItems);
  const pickupRescueItem = useStore((state) => state.pickupRescueItem);
  const deliverRescueItem = useStore((state) => state.deliverRescueItem);

  const [volunteerName, setVolunteerName] = useState('Alex Mercer');
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, active, history

  const handlePickup = (itemId) => {
    pickupRescueItem(itemId, volunteerName);
  };

  const handleDeliver = (itemId) => {
    deliverRescueItem(itemId);
  };

  // Available tasks are items claimed by an NGO but not yet picked up
  const availableTasks = rescueItems.filter((item) => item.status === 'claimed');
  // Active deliveries are items accepted by this volunteer in transit
  const activeDeliveries = rescueItems.filter(
    (item) => item.volunteerName === volunteerName && item.status === 'picked_up'
  );
  // Delivery history
  const deliveryHistory = rescueItems.filter(
    (item) => item.volunteerName === volunteerName && item.status === 'delivered'
  );

  return (
    <DashboardLayout title="Volunteer Delivery Portal" roleName="Volunteer">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column - Volunteer profile */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-slate-900 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Courier Profile</span>
            </h3>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Volunteer Name</label>
                <input
                  type="text"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="pt-2 text-xs text-slate-500 leading-relaxed">
                Volunteers accept claimed deliveries, pick them up from the restaurant, and transport them to the NGO distribution site.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation and Lists */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Navigation tabs */}
          <div className="flex border-b border-slate-900">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-4 px-6 text-sm font-semibold relative transition-colors ${
                activeTab === 'tasks' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available Tasks ({availableTasks.length})
              {activeTab === 'tasks' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-6 text-sm font-semibold relative transition-colors ${
                activeTab === 'active' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Shipments ({activeDeliveries.length})
              {activeTab === 'active' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-6 text-sm font-semibold relative transition-colors ${
                activeTab === 'history' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              History ({deliveryHistory.length})
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>

          {/* List Content */}
          <div className="flex flex-col gap-4">
            {activeTab === 'tasks' ? (
              availableTasks.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl border border-slate-900">
                  <p className="text-slate-500">No active rescue runs are awaiting courier pickup.</p>
                  <p className="text-xs text-slate-600 mt-1">Once NGOs claim open listings, you can pick them up here.</p>
                </div>
              ) : (
                availableTasks.map((item) => (
                  <div
                    key={item.id}
                    className="glass p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{item.name}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500 font-semibold">Pickup From: </span>
                          <span className="text-slate-300 font-medium">{item.restaurantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.address}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Deliver To: </span>
                          <span className="text-amber-400 font-medium">{item.ngoName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePickup(item.id)}
                      className="px-5 py-2.5 rounded-xl bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 transition-colors flex items-center justify-center gap-1.5 self-start md:self-center"
                    >
                      <Navigation className="w-4 h-4" />
                      Accept & Pickup
                    </button>
                  </div>
                ))
              )
            ) : activeTab === 'active' ? (
              activeDeliveries.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl border border-slate-900">
                  <p className="text-slate-500">You do not have any items in transit currently.</p>
                </div>
              ) : (
                activeDeliveries.map((item) => (
                  <div
                    key={item.id}
                    className="glass p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{item.name}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500 font-semibold">Source: </span>
                          <span className="text-slate-300 font-medium">{item.restaurantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.address}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Destination: </span>
                          <span className="text-amber-400 font-medium">{item.ngoName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeliver(item.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 self-start md:self-center"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Delivered
                    </button>
                  </div>
                ))
              )
            ) : (
              deliveryHistory.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl border border-slate-900">
                  <p className="text-slate-500">No completed rescue runs recorded.</p>
                </div>
              ) : (
                deliveryHistory.map((item) => (
                  <div
                    key={item.id}
                    className="glass p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-400 line-through">{item.name}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
                        <div>Source: {item.restaurantName}</div>
                        <div>Destination: {item.ngoName}</div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
=======
import React from 'react';
import FoodListingCard from '../components/FoodListingCard';
import MockMap from '../components/MockMap';
import StatusTracker from '../components/StatusTracker';

export default function VolunteerDashboard() {
  return (
    <div>
      <h2>Volunteer Dashboard</h2>
      <p>View assigned deliveries, track pickups, and mark listings as delivered.</p>

      <MockMap />
      <StatusTracker />

      <div style={{ marginTop: '20px' }}>
        <h3>Assigned Deliveries</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>TODO: Fetch listings where assignedVolunteer == currentUser.uid.</p>
        <FoodListingCard listing={{ foodType: "Veg Biryani Pots", quantityKg: 12, status: "claimed" }} />
      </div>
    </div>
>>>>>>> origin/main
  );
}
