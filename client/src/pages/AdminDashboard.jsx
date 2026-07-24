import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  HeartHandshake, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  Leaf, 
  TrendingUp 
} from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'dashboard';

  const [usersList, setUsersList] = useState([]);
  const [listings, setListings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load global datasets
  useEffect(() => {
    // 1. Listen to all users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const docs = [];
      snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setUsersList(docs);
    });

    // 2. Listen to all listings
    const unsubListings = onSnapshot(collection(db, 'foodListings'), (snapshot) => {
      const docs = [];
      snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setListings(docs);
    });

    // 3. Listen to all matches
    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const docs = [];
      snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setMatches(docs);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubListings();
      unsubMatches();
    };
  }, []);

  // Delete fake listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Moderate: Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, 'foodListings', listingId));
      toast.success("Listing deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing.");
    }
  };

  // Toggle user active status or approve role
  const handleApproveUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: true
      });
      toast.success("User profile approved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve user.");
    }
  };

  // Calculate aggregates
  const totalRestaurants = usersList.filter(u => u.role === 'restaurant').length;
  const totalNGOs = usersList.filter(u => u.role === 'ngo').length;
  const totalVolunteers = usersList.filter(u => u.role === 'volunteer').length;
  
  const totalSavedWeight = listings
    .filter(l => l.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  
  const globalMealsSaved = Math.round(totalSavedWeight * 2.5);
  const globalCo2Saved = Math.round(totalSavedWeight * 2.5);

  // Map matches dynamically to chart data
  const getGlobalImpactChartData = () => {
    const sortedMatches = [...matches].sort((a, b) => {
      const timeA = a.deliveredAt?.seconds || 0;
      const timeB = b.deliveredAt?.seconds || 0;
      return timeA - timeB;
    });

    let runningMeals = 0;
    let runningCo2 = 0;

    const data = sortedMatches.map(match => {
      runningMeals += match.mealsSaved || 0;
      runningCo2 += match.co2eAvoidedKg || 0;
      
      let dateLabel = 'Today';
      if (match.deliveredAt) {
        const date = match.deliveredAt.toDate ? match.deliveredAt.toDate() : new Date(match.deliveredAt);
        dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      return {
        name: dateLabel,
        meals: Math.round(runningMeals),
        co2: Math.round(runningCo2)
      };
    });

    if (data.length === 0) {
      return [
        { name: 'Start', meals: 0, co2: 0 }
      ];
    }
    return data;
  };

  const chartData = getGlobalImpactChartData();

  return (
    <DashboardLayout title="System Administration Center">
      
      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform Users</span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{usersList.length} members</h3>
              <p className="text-xs text-slate-450 mt-1">{totalVolunteers} volunteers active</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Restaurants</span>
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalRestaurants} kitchens</h3>
              <p className="text-xs text-slate-450 mt-1">Donating excess supplies</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NGOs / Food Banks</span>
                <HeartHandshake className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalNGOs} hubs</h3>
              <p className="text-xs text-slate-450 mt-1">Claiming surplus meals</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Global Meal Impact</span>
                <Leaf className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-extrabold text-green-600 mt-2">{globalMealsSaved} saved</h3>
              <p className="text-xs text-slate-450 mt-1">{globalCo2Saved} kg $CO_2$ avoided</p>
            </div>
          </div>

          {/* Area charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Platform Growth: Meals Rescued</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="meals" stroke="#16A34A" fill="rgba(22, 163, 74, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">CO₂ Reductions (kg)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="co2" stroke="#F59E0B" fill="rgba(245, 158, 11, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Manage Users */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">User Account Approvals</h2>

          {usersList.length === 0 ? (
            <p className="text-xs text-slate-400">No registered users found.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{usr.name}</td>
                      <td className="px-6 py-4">{usr.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          usr.role === 'restaurant' ? 'bg-green-50 border-green-200 text-green-700' :
                          usr.role === 'ngo' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          usr.role === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                          'bg-blue-50 border-blue-200 text-blue-750'
                        }`}>
                          {usr.role || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {usr.approved ? (
                          <span className="text-green-600 font-semibold">Active / Approved</span>
                        ) : (
                          <span className="text-amber-500 font-semibold">Awaiting Verification</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!usr.approved && (
                          <button
                            onClick={() => handleApproveUser(usr.id)}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Active Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Moderate Platform Listings</h2>

          {listings.length === 0 ? (
            <p className="text-xs text-slate-400">No active listings on platform.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.foodName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Category: {item.foodCategory} • Source: {item.restaurantName}</p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-500">
                      <div><span className="font-semibold text-slate-400">Weight:</span> {item.quantity} kg</div>
                      <div><span className="font-semibold text-slate-400">Meals:</span> {item.estimatedMeals}</div>
                      <div><span className="font-semibold text-slate-400">Expiry:</span> {item.expiryTime} hrs</div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100/50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Listing</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </DashboardLayout>
  );
}
