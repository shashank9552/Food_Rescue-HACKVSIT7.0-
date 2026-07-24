import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import MapComponent from '../components/MapComponent';
import toast from 'react-hot-toast';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Calendar, 
  Sparkles,
  PackageCheck,
  ChevronRight
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'dashboard';

  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState(null); // coordinates for route draw

  // Real-time Firestore listener for pickup requests
  useEffect(() => {
    const q = query(collection(db, 'pickupRequests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by creation date desc
      docs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setPickupRequests(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load pickup requests.");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Haversine distance helper
  const calculateDistance = (p1, p2) => {
    if (!p1 || !p2 || !p1.lat || !p1.lng || !p2.lat || !p2.lng) return 999;
    const R = 6371; // km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Accept a delivery task
  const handleAcceptDelivery = async (request) => {
    try {
      const volunteerName = userProfile?.name || 'Volunteer Courier';
      
      // 1. Update pickup request status to volunteer_assigned
      await updateDoc(doc(db, 'pickupRequests', request.id), {
        status: 'volunteer_assigned',
        volunteerId: user.uid,
        volunteerName
      });

      // 2. Update parent food listing status to volunteer_assigned
      await updateDoc(doc(db, 'foodListings', request.listingId), {
        status: 'volunteer_assigned',
        volunteerName,
        assignedVolunteer: volunteerName
      });

      toast.success("Delivery accepted! Check 'My Deliveries' for route details.");
      navigate('/volunteer?tab=deliveries');
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept delivery.");
    }
  };

  // Mark picked up
  const handleMarkPickedUp = async (request) => {
    try {
      await updateDoc(doc(db, 'pickupRequests', request.id), {
        status: 'picked_up'
      });
      await updateDoc(doc(db, 'foodListings', request.listingId), {
        status: 'picked_up'
      });
      toast.success("Food marked as Picked Up! Head to NGO location.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  // Mark delivered
  const handleMarkDelivered = async (request) => {
    try {
      await updateDoc(doc(db, 'pickupRequests', request.id), {
        status: 'delivered'
      });
      await updateDoc(doc(db, 'foodListings', request.listingId), {
        status: 'delivered'
      });
      toast.success("Food marked as Delivered! Thank you for your service.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  // Group listings
  const nearbyRequests = pickupRequests.filter(req => req.status === 'claimed');
  const myDeliveries = pickupRequests.filter(req => req.volunteerId === user?.uid);
  const activeDeliveries = myDeliveries.filter(req => req.status !== 'delivered');
  const completedDeliveries = myDeliveries.filter(req => req.status === 'delivered');

  // Trigger route coordinates on map selection
  const showRouteOnMap = (request) => {
    if (request.restaurantLocation && request.ngoLocation) {
      setActiveRoute({
        origin: request.restaurantLocation,
        destination: request.ngoLocation
      });
      toast.success(`Routing: ${request.restaurantName} ➔ ${request.ngoName}`);
    }
  };

  return (
    <DashboardLayout title="Volunteer Delivery Portal">
      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Deliveries</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{completedDeliveries.length} completed</h3>
              <p className="text-xs text-slate-400 mt-1">Meals delivered successfully</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Transits</span>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{activeDeliveries.length} packages</h3>
              <p className="text-xs text-slate-400 mt-1">Currently in-hand/assigned</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contribution Hours</span>
              <h3 className="text-3xl font-extrabold text-green-600 mt-2">{(completedDeliveries.length * 1.5).toFixed(1)} hrs</h3>
              <p className="text-xs text-slate-400 mt-1">Estimated service time</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nearby Pickups</span>
              <h3 className="text-3xl font-extrabold text-amber-500 mt-2">{nearbyRequests.length} tasks</h3>
              <p className="text-xs text-slate-400 mt-1">Awaiting volunteer dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Transit & Pickup Route Map</h3>
                {activeRoute && (
                  <button 
                    onClick={() => setActiveRoute(null)} 
                    className="text-[10px] text-red-500 hover:underline font-bold"
                  >
                    Clear Route
                  </button>
                )}
              </div>
              <MapComponent 
                center={userProfile?.location || { lat: 28.6500, lng: 77.2300 }} 
                activeRoute={activeRoute}
              />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-green-600" />
                  <span>Transit Instructions</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upon claiming a package, map routing handles calculations. Ensure food is kept level. Check instructions inside details for gate codes or delivery points.
                </p>
              </div>

              {/* Active list summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Active Transit Tasks</h3>
                {activeDeliveries.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No active transit tasks.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activeDeliveries.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 truncate max-w-[130px]">{item.foodName}</p>
                          <button 
                            onClick={() => showRouteOnMap(item)} 
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <Navigation className="w-3 h-3" /> Draw Route
                          </button>
                        </div>
                        <span className="font-semibold text-slate-500 uppercase text-[9px] bg-slate-100 px-2 py-0.5 rounded border">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Nearby Pickups */}
      {activeTab === 'pickups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Unclaimed Pickup Requests</h2>
            <p className="text-xs text-slate-400">Accept tasks to begin transit</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Locating coordinates...</p>
            </div>
          ) : nearbyRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-semibold mb-2">No pickup requests available right now.</p>
              <p className="text-xs text-slate-400">Check back later when NGOs claim active listings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyRequests.map((request) => {
                const distance = calculateDistance(request.restaurantLocation, request.ngoLocation);
                const safety = request.foodSafety || {
                  freshnessScore: 85,
                  safeUntil: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
                  risk: 'Safe',
                  pickupPriority: 'Medium',
                  status: 'Safe'
                };

                return (
                  <div key={request.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fadeIn">
                    
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-bold text-slate-900">{request.foodName}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Dispatch
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            safety.pickupPriority === "Urgent" ? "bg-red-50 text-red-750 border-red-200 animate-pulse" :
                            safety.pickupPriority === "High" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            "bg-slate-50 text-slate-650 border-slate-200"
                          }`}>
                            Priority: {safety.pickupPriority}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-slate-500">
                        <div>
                          <span className="font-semibold text-slate-400">Restaurant (Pickup):</span>{' '}
                          <span className="font-medium text-slate-700">{request.restaurantName}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">NGO (Dropoff):</span>{' '}
                          <span className="font-medium text-slate-700">{request.ngoName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-blue-500" />
                          <span>Est. Route: <strong>{distance.toFixed(2)} km</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Safe until: <strong>{new Date(safety.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Freshness:</span> <strong className="text-green-700">{safety.freshnessScore}%</strong>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Address:</span> {request.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <button
                        onClick={() => showRouteOnMap(request)}
                        className="px-4 py-2 border border-slate-350 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                      >
                        Inspect Route
                      </button>
                      <button
                        onClick={() => handleAcceptDelivery(request)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold shadow-md shadow-green-600/10"
                      >
                        Accept Delivery
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Deliveries */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Your Active Deliveries</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Loading tasks...</p>
            </div>
          ) : myDeliveries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-semibold mb-2">No delivery logs found.</p>
              <p className="text-xs text-slate-400">Claim items under "Nearby Pickups" to begin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myDeliveries.map((request) => {
                const safety = request.foodSafety || {
                  freshnessScore: 85,
                  safeUntil: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
                  risk: 'Safe',
                  pickupPriority: 'Medium',
                  status: 'Safe'
                };

                return (
                  <div key={request.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{request.foodName}</h4>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${
                          request.status === 'volunteer_assigned' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          request.status === 'picked_up' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                          'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {request.status.replace('_', ' ')}
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
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-slate-500">
                        <div>
                          <span className="font-semibold text-slate-400">From:</span> {request.restaurantName}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">To:</span> {request.ngoName}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Safe until: <strong>{new Date(safety.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Freshness:</span> <strong className="text-green-700">{safety.freshnessScore}%</strong>
                        </div>
                        <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-450" />
                          <span className="truncate max-w-[280px]">{request.address}</span>
                        </div>
                      </div>
                    </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => showRouteOnMap(request)}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                    >
                      Map Route
                    </button>
                    
                    {request.status === 'volunteer_assigned' && (
                      <button
                        onClick={() => handleMarkPickedUp(request)}
                        className="flex-grow md:flex-grow-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                      >
                        Mark Picked Up
                      </button>
                    )}

                    {request.status === 'picked_up' && (
                      <button
                        onClick={() => handleMarkDelivered(request)}
                        className="flex-grow md:flex-grow-0 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
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
