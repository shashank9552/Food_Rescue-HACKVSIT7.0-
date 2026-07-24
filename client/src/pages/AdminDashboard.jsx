<<<<<<< HEAD
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { ShieldCheck, Database, RefreshCw, BarChart2, Plus, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const rescueItems = useStore((state) => state.rescueItems);
  const setRescueItems = useStore((state) => state.setRescueItems);

  // Statistics calculation
  const total = rescueItems.length;
  const posted = rescueItems.filter(i => i.status === 'posted').length;
  const claimed = rescueItems.filter(i => i.status === 'claimed').length;
  const pickedUp = rescueItems.filter(i => i.status === 'picked_up').length;
  const delivered = rescueItems.filter(i => i.status === 'delivered').length;

  const handleResetData = () => {
    const defaultData = [
      {
        id: 'res-1',
        name: 'Spaghetti Bolognese (15 Portions)',
        restaurantName: 'La Piazza Trattoria',
        address: '456 Olive Way, Foodville',
        status: 'posted',
        ngoName: null,
        volunteerName: null,
        timestamp: new Date().toISOString(),
        description: 'Freshly prepared, stored in hygienic aluminum trays. Ready for pickup immediately.',
      },
      {
        id: 'res-2',
        name: 'Assorted Gourmet Sandwiches (20 Boxes)',
        restaurantName: 'Downtown Deli & Cafe',
        address: '789 Broadway St, Foodville',
        status: 'claimed',
        ngoName: 'Second Harvest Food Bank',
        volunteerName: null,
        timestamp: new Date().toISOString(),
        description: 'Vegetarian and turkey options. Separately packaged with allergen labels.',
      },
      {
        id: 'res-3',
        name: 'Organic Salad Bowls (10 Packs)',
        restaurantName: 'Green & Lean Kitchen',
        address: '101 Wellness Blvd, Foodville',
        status: 'picked_up',
        ngoName: 'Hope Shelter',
        volunteerName: 'Alex Mercer',
        timestamp: new Date().toISOString(),
        description: 'Fresh green salads with light vinaigrette dressing. Keep chilled.',
      },
      {
        id: 'res-4',
        name: 'Bakers Choice Pastry Assortment (30 Pcs)',
        restaurantName: 'Sweet Treats Bakery',
        address: '12 Bakery Lane, Foodville',
        status: 'delivered',
        ngoName: 'Community Kitchen East',
        volunteerName: 'Sarah Jenkins',
        timestamp: new Date().toISOString(),
        description: 'Muffins, croissants, and danishes. Safely sealed in paper bags.',
      }
    ];
    setRescueItems(defaultData);
  };

  return (
    <DashboardLayout title="System Administration & Analytics" roleName="System Admin">
      <div className="flex flex-col gap-8">
        
        {/* KPI Statistics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Listings</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{total}</span>
              <span className="text-xs text-slate-400">items</span>
            </div>
          </div>
          
          <div className="glass p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-posted" />
              Posted
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{posted}</span>
              <span className="text-xs text-slate-400">available</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-claimed" />
              Claimed
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-400">{claimed}</span>
              <span className="text-xs text-slate-400">claimed</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-picked_up" />
              Picked Up
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-blue-400">{pickedUp}</span>
              <span className="text-xs text-slate-400">in transit</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-delivered" />
              Delivered
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-400">{delivered}</span>
              <span className="text-xs text-slate-400">completed</span>
            </div>
          </div>
        </div>

        {/* Audit Log / Reset DB Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="glass p-6 rounded-2xl border border-slate-900">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Simulation Controls</span>
              </h3>
              <button
                onClick={handleResetData}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Mock Database
              </button>
              <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                Clicking reset restores the default four transactions to their original state values for sandbox demonstration.
              </p>
            </div>
          </div>

          {/* Table of Rescue Items */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl border border-slate-900 overflow-hidden">
              <div className="p-6 border-b border-slate-900 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Platform Transactions Audit Log</span>
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  {rescueItems.length} transactions logged
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Food Item</th>
                      <th className="p-4">Source Restaurant</th>
                      <th className="p-4">NGO Claim</th>
                      <th className="p-4">Volunteer Courier</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {rescueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div>{item.name}</div>
                          <span className="text-[10px] font-normal text-slate-500">ID: {item.id}</span>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">{item.restaurantName}</td>
                        <td className="p-4 text-amber-400 font-medium">{item.ngoName || <span className="text-slate-600 font-normal">Unclaimed</span>}</td>
                        <td className="p-4 text-blue-400 font-medium">{item.volunteerName || <span className="text-slate-600 font-normal">No courier</span>}</td>
                        <td className="p-4 text-right">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
=======
import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>View global impact statistics and monitor live matching events.</p>
      
      <div style={{ display: 'flex', gap: '16px', margin: '20px 0' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '6px', flex: 1, textAlign: 'center', background: '#e6f7ff' }}>
          <h4>Total Meals Saved</h4>
          <h2 style={{ margin: '10px 0', fontSize: '32px', color: '#0066cc' }}>350</h2>
          <p style={{ fontSize: '12px', color: '#666' }}>TODO: Calculate sum(mealsSaved) from '/matches' collection.</p>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '6px', flex: 1, textAlign: 'center', background: '#f6ffed' }}>
          <h4>CO2e Avoided</h4>
          <h2 style={{ margin: '10px 0', fontSize: '32px', color: '#389e0d' }}>350 kg</h2>
          <p style={{ fontSize: '12px', color: '#666' }}>TODO: Calculate sum(co2eAvoidedKg) from '/matches' collection.</p>
        </div>
      </div>

      <h3>Live Completed Matches</h3>
      <p style={{ fontSize: '12px', color: '#666' }}>TODO: Render list of '/matches' documents ordered by deliveredAt desc.</p>
    </div>
>>>>>>> origin/main
  );
}
