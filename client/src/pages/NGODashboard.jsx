import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import MapComponent from '../components/MapComponent';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { 
  HeartHandshake, 
  MapPin, 
  Clock, 
  CheckSquare, 
  Plus, 
  RefreshCw, 
  Scale, 
  Activity, 
  TrendingUp, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function NGODashboard() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'dashboard';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all listings in real-time
  useEffect(() => {
    const q = query(collection(db, 'foodListings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setListings(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load listings.");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Haversine distance calculator
  const calculateDistance = (p1, p2) => {
    if (!p1 || !p2 || !p1.lat || !p1.lng || !p2.lat || !p2.lng) return 999;
    const R = 6371; // Radius of Earth in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Smart Matching score calculation
  const calculateMatchScore = (item) => {
    const ngoLoc = userProfile?.location || { lat: 28.6470, lng: 77.2260 };
    const restLoc = item.restaurantLocation;
    const distance = calculateDistance(ngoLoc, restLoc);
    
    // Weights
    const distWeight = 0.4;
    const capWeight = 0.3;
    const expWeight = 0.2;
    const qtyWeight = 0.1;

    // Scores (0 to 100)
    const distScore = Math.max(0, 100 - (distance * 10)); // Max score if closer than 1km, drops as distance increases
    const capScore = (userProfile?.capacity || 20) >= item.quantity ? 100 : ((userProfile?.capacity || 20) / item.quantity) * 100;
    const expScore = item.expiryTime <= 3 ? 100 : Math.max(0, 100 - (item.expiryTime - 3) * 10); // Urgent if expires in < 3 hours
    const qtyScore = Math.min(100, (item.quantity / 5) * 100); // Favour larger donations slightly

    const finalScore = (distScore * distWeight) + (capScore * capWeight) + (expScore * expWeight) + (qtyScore * qtyWeight);
    return Math.round(finalScore);
  };

  // Accept a listing (Claim)
  const handleClaim = async (item) => {
    try {
      // 1. Update listing document
      const itemRef = doc(db, 'foodListings', item.id);
      await updateDoc(itemRef, {
        status: 'claimed',
        ngoName: userProfile?.name || 'Partner NGO',
        claimedByNgo: user.uid,
        claimedByNgoName: userProfile?.name || 'Partner NGO'
      });

      // 2. Create pickup request document
      await addDoc(collection(db, 'pickupRequests'), {
        listingId: item.id,
        foodName: item.foodName,
        restaurantName: item.restaurantName,
        ngoId: user.uid,
        ngoName: userProfile?.name || 'Partner NGO',
        ngoLocation: userProfile?.location || { lat: 28.6470, lng: 77.2260 },
        restaurantLocation: item.restaurantLocation,
        address: item.address,
        volunteerId: null,
        volunteerName: null,
        status: 'claimed',
        createdAt: serverTimestamp(),
        foodSafety: item.foodSafety || null
      });

      toast.success("Donation claimed! Courier route generated.");
      navigate('/ngo?tab=claims');
    } catch (err) {
      console.error(err);
      toast.error("Failed to claim donation.");
    }
  };

  // Filter listings
  const availableItems = listings
    .filter(item => item.status === 'posted')
    .map(item => ({ ...item, matchScore: calculateMatchScore(item), distance: calculateDistance(userProfile?.location, item.restaurantLocation) }))
    // Sort by match score descending
    .sort((a, b) => b.matchScore - a.matchScore);

  const claimedItems = listings.filter(item => item.claimedByNgo === user?.uid);
  const deliveredClaims = claimedItems.filter(item => item.status === 'delivered');
  const activeClaims = claimedItems.filter(item => item.status !== 'delivered');

  // Math aggregates
  const totalClaimsWeight = claimedItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalMealsDistributed = Math.round(totalClaimsWeight * 2.5);

  // Pie chart categories dataset from live claimedItems data
  const getCategoryData = () => {
    const counts = {};
    claimedItems.forEach(item => {
      const cat = item.foodCategory || 'Veg Meals';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map(cat => ({
      name: cat,
      value: counts[cat]
    }));
  };

  const categoryData = getCategoryData();

  // Compute live cumulative distributed meals saved
  const getCumulativeMealsData = () => {
    const sortedClaims = [...claimedItems].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    });

    let runningTotal = 0;
    const data = sortedClaims.map(item => {
      runningTotal += item.estimatedMeals || Math.round((item.quantity || 0) * 2.5);
      const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      return {
        name: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        meals: runningTotal
      };
    });

    if (data.length === 0) {
      return [
        { name: 'Start', meals: 0 }
      ];
    }
    return data;
  };

  const cumulativeMealsData = getCumulativeMealsData();

  const COLORS = ['#16A34A', '#EF4444', '#F59E0B', '#3B82F6'];

  return (
    <DashboardLayout title="NGO Operations Dashboard">
      
      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{claimedItems.length} offers</h3>
              <p className="text-xs text-slate-400 mt-1">Accepted all time</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deliveries</span>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{activeClaims.length} transits</h3>
              <p className="text-xs text-slate-400 mt-1">Awaiting/In-route volunteer</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Distributed</span>
              <h3 className="text-3xl font-extrabold text-green-600 mt-2">{totalMealsDistributed} meals</h3>
              <p className="text-xs text-slate-400 mt-1">Provided to local families</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Surpluses</span>
              <h3 className="text-3xl font-extrabold text-amber-500 mt-2">{availableItems.length} nearby</h3>
              <p className="text-xs text-slate-400 mt-1">Matching criteria filters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Map displaying NGO and available offers */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Local Area Map</h3>
                <MapComponent 
                  center={userProfile?.location || { lat: 28.6470, lng: 77.2260 }} 
                  ngos={[userProfile]}
                  listings={availableItems}
                />
              </div>

              {/* Claims summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">Active Claims</h3>
                  <button 
                    onClick={() => navigate('/ngo?tab=claims')} 
                    className="text-xs text-green-600 hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>
                {activeClaims.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No active claims in progress.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activeClaims.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.foodName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Source: {item.restaurantName} • Courier: {item.volunteerName || 'Awaiting Assignee'}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: NGO Details & Settings Preview */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-2">NGO Profile</h3>
                <div className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400 block">Organization</span>
                    <span className="font-bold text-slate-700 mt-1 block">{userProfile?.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">Current Capacity</span>
                    <span className="font-bold text-slate-700 mt-1 block">{userProfile?.capacity} kg</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">Address</span>
                    <span className="text-slate-600 leading-relaxed mt-1 block">{userProfile?.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span>Matching Logistics</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Our Matching Score optimizes allocation. The score displays a percentage based on travel coordinates, food expiration window, and storage capacities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Nearby Offers */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Available Surplus Foods Nearby</h2>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Scale className="w-4 h-4 text-green-600" />
              <span>Sorted by Matching Percentage</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Locating offers...</p>
            </div>
          ) : availableItems.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-semibold mb-2">No donations available right now.</p>
              <p className="text-xs text-slate-400">Restaurants will post offers as surplus arises.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableItems.map((item) => {
                const safety = item.foodSafety || {
                  freshnessScore: 85,
                  safeUntil: new Date(Date.now() + (item.expiryTime || 4) * 3600 * 1000).toISOString(),
                  risk: 'Safe',
                  pickupPriority: 'Medium',
                  status: 'Safe'
                };

                return (
                  <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-bold text-slate-900">{item.foodName}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {item.foodCategory}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-green-600" />
                          <span>{item.matchScore}% Match Score</span>
                        </span>
                        
                        {/* Risk Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          safety.risk === "Safe" ? "bg-green-50 text-green-700 border-green-200" :
                          safety.risk === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-250" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {safety.risk === "Safe" ? "🟢 Safe" :
                           safety.risk === "Moderate" ? "🟡 Donate Soon" : "🔴 Unsafe"}
                        </span>

                        {/* Urgency Badge */}
                        {safety.pickupPriority && safety.pickupPriority !== 'None' && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            safety.pickupPriority === "Urgent" ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                            safety.pickupPriority === "High" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                            Priority: {safety.pickupPriority}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-slate-500">
                        <div>
                          <span className="font-semibold text-slate-400">Establishment:</span>{' '}
                          <span className="font-medium text-slate-700">{item.restaurantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.distance.toFixed(2)} km away</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Safe until: <strong>{new Date(safety.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Weight:</span> {item.quantity} kg
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Freshness Index:</span> <strong className="text-green-700">{safety.freshnessScore}%</strong>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Pickup window:</span> {item.pickupWindow}
                        </div>
                      </div>
                    </div>

                  <button
                    onClick={() => handleClaim(item)}
                    className="w-full md:w-auto px-5 py-3 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-500 shadow-md shadow-green-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Accepted Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Your Active & Historical Claims</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Retrieving claims...</p>
            </div>
          ) : claimedItems.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-semibold mb-2">You haven't claimed any donations yet.</p>
              <p className="text-xs text-slate-400">Browse "Nearby Offers" to accept surplus packages.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claimedItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-slate-900">{item.foodName}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                        item.status === 'claimed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        item.status === 'picked_up' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                        'bg-green-100 text-green-700 border-green-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-400">Source:</span> {item.restaurantName}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Address:</span> {item.address}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Weight:</span> {item.quantity} kg
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Courier:</span> {item.volunteerName || 'Searching Volunteer courier...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-150 w-full md:w-auto justify-center">
                    {item.status !== 'delivered' && (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    )}
                    <span>
                      {item.status === 'claimed' && 'Awaiting courier details'}
                      {item.status === 'picked_up' && 'Courier in transit'}
                      {item.status === 'delivered' && 'Delivered successfully'}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-slate-900">NGO Distribution Metrics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Distributed Meals Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeMealsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="meals" stroke="#16A34A" fill="rgba(22, 163, 74, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <h3 className="text-sm font-bold text-slate-800">Categories Split</h3>
              {categoryData.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">No categories recorded.</p>
              ) : (
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs">
                {categoryData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </DashboardLayout>
  );
}
