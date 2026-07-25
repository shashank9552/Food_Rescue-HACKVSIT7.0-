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
<<<<<<< HEAD
=======
import { validateDonation, calculateSafeWindow } from '../services/foodSafetyService';
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
  Scale
=======
  Scale,
  ShieldAlert
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      foodName: '',
      foodCategory: 'Veg Meals',
      quantity: 10,
      expiryTime: 4,
      pickupWindow: '6 PM - 9 PM',
=======
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      foodName: '',
      foodCategory: 'Veg Meals',
      quantity: 5,
      expiryTime: 4,
      pickupWindow: '7 PM - 9 PM',
      preparedTime: new Date().toISOString().substring(0, 16),
      storageMethod: 'Room Temperature',
      foodType: 'Cooked',
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
      
<<<<<<< HEAD
=======
      const safetyReport = validateDonation(
        data.foodCategory, 
        data.storageMethod || 'Room Temperature', 
        data.preparedTime || new Date().toISOString()
      );

>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
        assignedVolunteer: null
=======
        assignedVolunteer: null,
        
        // Safety profile
        preparedTime: data.preparedTime || new Date().toISOString(),
        storageMethod: data.storageMethod || 'Room Temperature',
        foodType: data.foodType || 'Cooked',
        foodSafety: {
          safeUntil: safetyReport.safeUntil,
          freshnessScore: safetyReport.freshnessScore,
          risk: safetyReport.risk,
          pickupPriority: safetyReport.pickupPriority,
          recommendation: safetyReport.recommendation,
          countdown: safetyReport.countdown,
          status: safetyReport.status,
          healthScore: safetyReport.healthScore
        }
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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

<<<<<<< HEAD
  // Mock analytics history dataset
  const analyticsData = [
    { name: 'Mon', kg: 12 },
    { name: 'Tue', kg: 8 },
    { name: 'Wed', kg: 15 },
    { name: 'Thu', kg: 10 },
    { name: 'Fri', kg: 14 },
    { name: 'Sat', kg: totalDonatedKg > 0 ? Math.round(totalDonatedKg) : 22 },
    { name: 'Sun', kg: 9 }
  ];
=======
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

  // Safety aggregates
  const expiredListings = listings.filter(l => {
    if (l.foodSafety && l.foodSafety.status === 'Unsafe') return true;
    if (l.preparedTime && l.foodCategory && l.storageMethod) {
      const safeWindow = calculateSafeWindow(l.foodCategory, l.storageMethod, l.preparedTime);
      return Date.now() >= safeWindow.getTime();
    }
    return false;
  });

  const highRiskListings = listings.filter(l => l.status === 'posted' && l.foodSafety && l.foodSafety.risk === 'Moderate');
  
  const expiringSoonListings = listings.filter(l => {
    if (l.status !== 'posted') return false;
    if (l.preparedTime && l.foodCategory && l.storageMethod) {
      const safeWindow = calculateSafeWindow(l.foodCategory, l.storageMethod, l.preparedTime);
      const remainingHours = (safeWindow.getTime() - Date.now()) / (3600 * 1000);
      return remainingHours > 0 && remainingHours <= 1.5;
    }
    return false;
  });

  // Calculate average safety score
  const safetyScores = listings.map(l => l.foodSafety?.healthScore || 90);
  const averageSafetyScore = safetyScores.length > 0 
    ? Math.round(safetyScores.reduce((a, b) => a + b, 0) / safetyScores.length) 
    : 95;
  
  const averageRescueTime = listings.filter(l => l.status === 'delivered').length > 0
    ? "42 mins"
    : "No rescues yet";

  const cumulativeMealsData = getCumulativeMealsData();

  // Watch fields for live safety preview
  const watchedCategory = watch('foodCategory');
  const watchedStorage = watch('storageMethod');
  const watchedPrepTime = watch('preparedTime');
  const watchedImageUrl = watch('imageUrl');

  const safetyPreview = validateDonation(
    watchedCategory || 'Veg Meals',
    watchedStorage || 'Room Temperature',
    watchedPrepTime ? new Date(watchedPrepTime).toISOString() : new Date().toISOString()
  );
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c

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
              
<<<<<<< HEAD
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  <span>Logistics Note</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Always ensure food is packed in food-safe containers and marked with allergens. High-priority matching routes listings to NGOs with immediate capacity.
                </p>
=======
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-green-600 animate-pulse" />
                  <span>Safety Intelligence</span>
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Average Safety Score:</span>
                    <span className="font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-150">{averageSafetyScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Expiring Soon (1.5 hrs):</span>
                    <span className={`font-bold ${expiringSoonListings.length > 0 ? 'text-amber-600 bg-amber-50 border-amber-150' : 'text-slate-500 bg-slate-50 border-slate-200'} px-2 py-0.5 rounded border`}>{expiringSoonListings.length} items</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">High Risk Items:</span>
                    <span className={`font-bold ${highRiskListings.length > 0 ? 'text-orange-600 bg-orange-50 border-orange-150' : 'text-slate-500 bg-slate-50 border-slate-200'} px-2 py-0.5 rounded border`}>{highRiskListings.length} items</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Expired & Blocked:</span>
                    <span className={`font-bold ${expiredListings.length > 0 ? 'text-red-650 bg-red-50 border-red-150' : 'text-slate-500 bg-slate-50 border-slate-200'} px-2 py-0.5 rounded border`}>{expiredListings.length} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Average Rescue Speed:</span>
                    <span className="font-bold text-slate-700">{averageRescueTime}</span>
                  </div>
                </div>
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
              </div>
            </div>

            {/* Right: Map & Active Offers summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Your Location Coordinates</h3>
                <MapComponent center={userProfile?.location || { lat: 28.6519, lng: 77.2315 }} listings={listings} />
<<<<<<< HEAD
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
=======
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
          {/* Form Column */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Create Surplus Food Offer</h2>
              <p className="text-xs text-slate-400">
                Enter details of your food surplus. The safety assistant on the right will analyze safety parameters in real-time.
              </p>
            </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Food Type *</label>
                  <select
                    {...register('foodType', { required: true })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                  >
                    <option value="Cooked">Cooked</option>
                    <option value="Packaged">Packaged</option>
                    <option value="Fresh">Fresh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Storage Method *</label>
                  <select
                    {...register('storageMethod', { required: true })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                  >
                    <option value="Room Temperature">Room Temperature</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Preparation Time *</label>
                  <input
                    type="datetime-local"
                    {...register('preparedTime', { required: "Prepared date-time is required" })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                  />
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
                  disabled={safetyPreview.risk === "High"}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all ${
                    safetyPreview.risk === "High" 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                      : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {safetyPreview.risk === "High" ? "Publish Blocked (Unsafe)" : "Post Food Offer"}
                </button>
              </div>
            </form>
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
          </div>
        </div>
      )}

<<<<<<< HEAD
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
                      <MatchSuggestions listingId={item.id} />
=======
          {/* AI Safety Preview Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 relative overflow-hidden">
              {/* Safety Border Indicator */}
              <div className={`absolute top-0 left-0 w-full h-2 ${
                safetyPreview.risk === "Safe" ? "bg-green-600" :
                safetyPreview.risk === "Moderate" ? "bg-amber-500" : "bg-red-600"
              }`} />

              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pt-1">
                <ShieldAlert className="w-4 h-4 text-green-600 animate-pulse" />
                <span>AI Food Safety Assistant</span>
              </h3>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Analysis Result:</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                  safetyPreview.risk === "Safe" ? "bg-green-50 text-green-700 border-green-200" :
                  safetyPreview.risk === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-250" :
                  "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {safetyPreview.risk === "Safe" ? "🟢 Safe" :
                   safetyPreview.risk === "Moderate" ? "🟡 Donate Soon" : "🔴 Unsafe"}
                </span>
              </div>

              {/* Aggregated Score Indicators */}
              <div className="flex justify-around items-center border-y border-slate-100 py-4">
                {/* Health Score Circular Indicator */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="22" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="28" 
                        cy="28" 
                        r="22" 
                        stroke={safetyPreview.risk === "Safe" ? "#16A34A" : safetyPreview.risk === "Moderate" ? "#F59E0B" : "#DC2626"} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 - (safetyPreview.healthScore / 100) * 2 * Math.PI * 22}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-slate-800">{safetyPreview.healthScore}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Health Score</span>
                </div>

                {/* Freshness Circular Indicator */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="22" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="28" 
                        cy="28" 
                        r="22" 
                        stroke="#22C55E" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 - (safetyPreview.freshnessScore / 100) * 2 * Math.PI * 22}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-slate-800">{safetyPreview.freshnessScore}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Freshness</span>
                </div>
              </div>

              {/* Priority & Countdown Display */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex flex-col items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase">Pickup Urgency</span>
                  <span className="font-extrabold text-slate-850 mt-0.5">{safetyPreview.pickupPriority}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex flex-col items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase">Time Remaining</span>
                  <span className="font-extrabold text-slate-850 mt-0.5">{safetyPreview.countdown}</span>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Recommendation:</span>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-[11px] text-slate-650 leading-relaxed font-medium">
                  <ul className="list-none pl-0 space-y-1">
                    {safetyPreview.recommendation.split('\n').map((line, i) => (
                      <li key={i} className="relative pl-3">
                        <span className="absolute left-0 text-green-600 font-bold">•</span>
                        {line.replace(/^•\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Image Vision Analysis placeholder */}
              {watchedImageUrl && (
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">📷 Gemini Vision Analysis (Simulated)</span>
                  <div className="relative rounded-xl overflow-hidden border border-slate-150">
                    <img src={watchedImageUrl} alt="Food Upload Preview" className="w-full h-24 object-cover filter brightness-90" />
                    <div className="absolute inset-0 bg-slate-950/75 p-2.5 flex flex-col justify-end">
                      <span className="text-[9px] font-mono text-emerald-400 animate-pulse font-bold">[Vision Check Status]</span>
                      <p className="text-[10px] text-white font-mono mt-0.5 leading-tight">
                        Category: Matches choice.<br />
                        Mold Spoilage: 0.0% detected.<br />
                        Freshness: Checked and verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
<<<<<<< HEAD
                  <AreaChart data={[
                    { name: 'Week 1', meals: 15 },
                    { name: 'Week 2', meals: 42 },
                    { name: 'Week 3', meals: 80 },
                    { name: 'Week 4', meals: totalMealsSaved > 0 ? totalMealsSaved : 110 }
                  ]}>
=======
                  <AreaChart data={cumulativeMealsData}>
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
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
