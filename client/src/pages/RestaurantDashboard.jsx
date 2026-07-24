import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import PredictionCard from '../components/PredictionCard';
import MatchSuggestions from '../components/MatchSuggestions';
import MapComponent from '../components/MapComponent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';
import { 
  PlusCircle, 
  Utensils, 
  MapPin, 
  Clock, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  ListOrdered,
  Calendar,
  AlertCircle,
  BarChart3,
  Scale
} from 'lucide-react';

export default function RestaurantDashboard() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract active tab from query params (?tab=...)
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'dashboard';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form setup using react-hook-form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      foodName: '',
      foodCategory: 'Veg Meals',
      quantity: 10,
      expiryTime: 4,
      pickupWindow: '6 PM - 9 PM',
      imageUrl: ''
    }
  });

  // Real-time Firestore subscription to listings created by this restaurant
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'foodListings'),
      where('restaurantId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort local by creation date desc
      docs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setListings(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load listings.");
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Form submission handler
  const handleAddFood = async (data) => {
    try {
      const quantityNum = parseFloat(data.quantity);
      const mealsNum = Math.round(quantityNum * 2.5); // 1kg = 2.5 meals
      
      const newListing = {
        restaurantId: user.uid,
        restaurantName: userProfile?.name || 'Partner Restaurant',
        restaurantLocation: userProfile?.location || { lat: 28.6519, lng: 77.2315 },
        address: userProfile?.address || '',
        foodName: data.foodName,
        foodCategory: data.foodCategory,
        quantity: quantityNum,
        estimatedMeals: mealsNum,
        expiryTime: parseFloat(data.expiryTime),
        pickupWindow: data.pickupWindow,
        image: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        status: 'posted',
        createdAt: serverTimestamp(),
        matchedNgo: null,
        assignedVolunteer: null
      };

      await addDoc(collection(db, 'foodListings'), newListing);
      toast.success("Food offer posted successfully!");
      reset();
      navigate('/restaurant?tab=my-listings');
    } catch (err) {
      console.error(err);
      toast.error("Failed to create offer. Please try again.");
    }
  };

  // Delete/Cancel listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, 'foodListings', listingId));
      toast.success("Listing deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing.");
    }
  };

  // Mark picked up
  const handleMarkPickedUp = async (listingId) => {
    try {
      await updateDoc(doc(db, 'foodListings', listingId), {
        status: 'picked_up'
      });
      toast.success("Listing marked as picked up by volunteer!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  // Calculate aggregates
  const activeListingsCount = listings.filter(l => l.status !== 'delivered').length;
  const totalDonatedKg = listings.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalMealsSaved = Math.round(totalDonatedKg * 2.5);
  const totalCo2AvoidedKg = Math.round(totalDonatedKg * 2.5);

  // Calculate analytics history dataset from live listings data
  const getWeeklyDonationsData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

    listings.forEach(item => {
      if (item.createdAt) {
        const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const dayName = days[date.getDay()];
        if (dayName in dataMap) {
          dataMap[dayName] += item.quantity || 0;
        }
      }
    });

    return Object.keys(dataMap).map(day => ({
      name: day,
      kg: Number(dataMap[day].toFixed(1))
    }));
  };

  const analyticsData = getWeeklyDonationsData();

  // Compute live cumulative meals data
  const getCumulativeMealsData = () => {
    const sortedListings = [...listings].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    });

    let runningTotal = 0;
    const data = sortedListings.map(item => {
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

  return (
    <DashboardLayout title="Partner Restaurant Portal">
      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Donations</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalDonatedKg.toFixed(1)} kg</h3>
              <p className="text-xs text-slate-400 mt-1">Across all posted offers</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Saved</span>
              <h3 className="text-3xl font-extrabold text-green-600 mt-2">{totalMealsSaved} meals</h3>
              <p className="text-xs text-slate-400 mt-1">Provided to local charities</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CO₂ Emissions Avoided</span>
              <h3 className="text-3xl font-extrabold text-amber-500 mt-2">{totalCo2AvoidedKg} kg</h3>
              <p className="text-xs text-slate-400 mt-1">Eco-impact equivalent</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Listings</span>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{activeListingsCount} offers</h3>
              <p className="text-xs text-slate-400 mt-1">Awaiting dispatch/transit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Predictor */}
            <div className="lg:col-span-1 space-y-6">
              <PredictionCard restaurantId={user?.uid} />
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  <span>Logistics Note</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Always ensure food is packed in food-safe containers and marked with allergens. High-priority matching routes listings to NGOs with immediate capacity.
                </p>
              </div>
            </div>

            {/* Right: Map & Active Offers summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Your Location Coordinates</h3>
                <MapComponent center={userProfile?.location || { lat: 28.6519, lng: 77.2315 }} listings={listings} />
              </div>

              {/* Active Listings Summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">Active Listings</h3>
                  <button 
                    onClick={() => navigate('/restaurant?tab=my-listings')} 
                    className="text-xs text-green-600 hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>
                
                {listings.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No active food listings. Create an offer to start.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {listings.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.foodName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.quantity} kg • Expiry: {item.expiryTime} hrs</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                          item.status === 'posted' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          item.status === 'claimed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {item.status}
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

      {/* Tab 2: Add Food Form */}
      {activeTab === 'add-food' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Create Surplus Food Offer</h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter details of the food surplus. Matching alerts will instantly propagate to NGOs.
          </p>

          <form onSubmit={handleSubmit(handleAddFood)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Food Item Title *</label>
              <input
                type="text"
                placeholder="e.g. 10 trays of mixed vegetable curry"
                {...register('foodName', { required: "Food title is required" })}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              />
              {errors.foodName && <p className="mt-1 text-xs text-red-500">{errors.foodName.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Food Category *</label>
                <select
                  {...register('foodCategory', { required: true })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                >
                  <option value="Veg Meals">Veg Meals</option>
                  <option value="Non-Veg Meals">Non-Veg Meals</option>
                  <option value="Bakery & Desserts">Bakery & Desserts</option>
                  <option value="Dry Groceries">Dry Groceries</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  {...register('quantity', { required: "Weight is required", min: { value: 0.5, message: "Minimum 0.5 kg" } })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                />
                {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Estimated Expiry (Hours) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  {...register('expiryTime', { required: "Expiry duration is required" })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                />
                {errors.expiryTime && <p className="mt-1 text-xs text-red-500">{errors.expiryTime.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Pickup Window *</label>
                <input
                  type="text"
                  placeholder="e.g. 7 PM - 10 PM tonight"
                  {...register('pickupWindow', { required: "Pickup window description is required" })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                />
                {errors.pickupWindow && <p className="mt-1 text-xs text-red-500">{errors.pickupWindow.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Optional Image URL</label>
              <input
                type="url"
                placeholder="e.g. https://images.unsplash.com/..."
                {...register('imageUrl')}
                className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Post Food Offer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: My Listings Page */}
      {activeTab === 'my-listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Your Donation Listings</h2>
            <button 
              onClick={() => navigate('/restaurant?tab=add-food')} 
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-green-500 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Listing</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-semibold mb-2">No listings found.</p>
              <p className="text-xs text-slate-400">Post surplus food items to populate listings here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative h-44 w-full bg-slate-100">
                    <img 
                      src={item.image} 
                      alt={item.foodName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider shadow-sm ${
                        item.status === 'posted' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        item.status === 'claimed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        item.status === 'picked_up' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                        'bg-green-100 text-green-700 border-green-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.foodName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Category: {item.foodCategory}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2.5 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-400">Quantity:</span> {item.quantity} kg
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Est. Meals:</span> {item.estimatedMeals}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Expiry Hours:</span> {item.expiryTime} hrs
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Pickup Window:</span> {item.pickupWindow}
                      </div>
                    </div>

                    {/* Smart matching display */}
                    {item.status === 'posted' && (
                      <MatchSuggestions listing={item} />
                    )}

                    {item.claimedByNgoName && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs">
                        <span className="font-semibold text-slate-400">Claimed By NGO:</span>{' '}
                        <span className="font-bold text-slate-700">{item.claimedByNgoName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                      title="Cancel/Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {item.status === 'claimed' && (
                      <button
                        onClick={() => handleMarkPickedUp(item.id)}
                        className="flex-grow flex items-center justify-center gap-1 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold py-2 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Picked Up</span>
                      </button>
                    )}
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
          <h2 className="text-xl font-bold text-slate-900">Sustainability & Donation Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly donation volume bar chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Weekly Donations (kg)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="kg" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total impact progression curve */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Cumulative Meals Saved</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeMealsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="meals" stroke="#22C55E" fill="rgba(34, 197, 94, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
