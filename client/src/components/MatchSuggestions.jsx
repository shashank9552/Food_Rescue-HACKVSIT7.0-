<<<<<<< HEAD
import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Sparkles, Loader, MapPin } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getTopRecommendations } from '../services/recommendationService';
import NGORecommendationCard from './NGORecommendationCard';
import MapComponent from './MapComponent';
import { Sparkles, Loader, AlertTriangle, AlertCircle, Info, Map } from 'lucide-react';
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
import toast from 'react-hot-toast';

export default function MatchSuggestions({ listing }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [showMapIdx, setShowMapIdx] = useState(null); // which card's route to show on map

  const fetchAndCalculateMatches = async () => {
    setLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
      const findMatchFn = httpsCallable(functions, 'findMatch');
      const res = await findMatchFn({ listingId });
      setMatches(res.data);
      toast.success("Eligible local NGO matching calculations completed!");
    } catch (err) {
      console.error("Match calculation failed: ", err);
      setError(err.message || "Failed to find matching NGOs");
      toast.error("Matching service encountered an error.");
=======
      // 1. Fetch all NGOs from Firestore
      const ngosSnap = await getDocs(collection(db, 'ngos'));
      const ngosList = [];
      ngosSnap.forEach(d => {
        ngosList.push({ id: d.id, ...d.data() });
      });

      if (ngosList.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // 2. Run the recommendation algorithm & write recommendations to Firestore listing doc
      const top3 = await getTopRecommendations(listing, ngosList);
      setRecommendations(top3);
      toast.success("AI Recommendation scores calculated!");
    } catch (err) {
      console.error("Match calculation failed: ", err);
      setError("Failed to calculate AI matching recommendations.");
      toast.error("Matching engine error occurred.");
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
    } finally {
      setLoading(false);
    }
  };

  // Assign the listing to this NGO
  const handleAssignNGO = async (ngo) => {
    try {
      // 1. Update listing document in Firestore
      const listingRef = doc(db, 'foodListings', listing.id);
      await updateDoc(listingRef, {
        status: 'claimed',
        ngoName: ngo.ngoName,
        claimedByNgo: ngo.ngoId,
        claimedByNgoName: ngo.ngoName
      });

      // 2. Create pickup request document
      await addDoc(collection(db, 'pickupRequests'), {
        listingId: listing.id,
        foodName: listing.foodName,
        restaurantName: listing.restaurantName,
        ngoId: ngo.ngoId,
        ngoName: ngo.ngoName,
        ngoLocation: { lat: ngo.maxCapacity ? 28.6470 : 28.6600, lng: 77.2260 }, // default fallback
        restaurantLocation: listing.restaurantLocation || { lat: 28.6519, lng: 77.2315 },
        address: listing.address || '',
        volunteerId: null,
        volunteerName: null,
        status: 'claimed',
        createdAt: serverTimestamp(),
        foodSafety: listing.foodSafety || null
      });

      toast.success(`Donation assigned to ${ngo.ngoName}! Volunteer courier alerted.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign NGO.");
    }
  };

  // Evaluate Smart Expiry Warnings
  // If food expires before travel time + average pickup time
  const checkExpiryWarning = () => {
    if (recommendations.length === 0) return false;
    
    return recommendations.every(ngo => {
      const travelTimeMin = ngo.distance * 2; // rough estimate: 2 mins per km
      const pickupTimeMin = parseFloat(ngo.estimatedPickup) || 20;
      const totalRequiredHours = (travelTimeMin + pickupTimeMin) / 60;
      return totalRequiredHours > (listing.expiryTime || 4);
    });
  };

  const hasExpiryWarning = checkExpiryWarning() || (recommendations.length === 0 && !loading && listing.expiryTime <= 1.5);

  return (
<<<<<<< HEAD
    <div className="mt-3 border-t border-slate-100 pt-3">
      {matches.length === 0 && !loading && !error && (
        <button
          onClick={fetchMatches}
          className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-150 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-green-600 animate-pulse" />
          <span>Find Closest NGO Matches</span>
=======
    <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
      
      {recommendations.length === 0 && !loading && !error && (
        <button
          onClick={fetchAndCalculateMatches}
          className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-150 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-green-600 animate-pulse" />
          <span>Generate AI Recommendation Match</span>
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
        </button>
      )}

      {loading && (
<<<<<<< HEAD
        <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5">
          <Loader className="w-3.5 h-3.5 animate-spin text-slate-350" />
          <span>Calculating intelligent scores...</span>
=======
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader className="w-4 h-4 animate-spin text-slate-400" />
            <span>AI Assistant is analyzing NGO capacities, workload, and distances...</span>
          </div>
          {/* Loading Skeletons */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl h-24 w-full animate-pulse" />
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
        </div>
      )}

      {error && (
<<<<<<< HEAD
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-150 p-2.5 rounded-lg">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2.5 animate-fadeIn">
          <h5 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommended NGO Match Ratings:</span>
          </h5>
          <div className="grid grid-cols-1 gap-2">
            {matches.map((ngo) => (
              <div
                key={ngo.id}
                className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-inner"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{ngo.name}</span>
                    <span className="text-[9px] text-slate-450 uppercase tracking-wider font-bold">
                      Cap: {ngo.capacityKg || ngo.capacity || 20}kg
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>
                      {ngo.distanceKm} km away {ngo.durationMin ? `(${ngo.durationMin} mins)` : ""}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-xs font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-150 shadow-sm">
                    {ngo.matchScore || 90}% Match
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {ngo.method} formula
                  </span>
                </div>
=======
        <div className="text-xs text-red-600 bg-red-50 border border-red-150 p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Smart Warning Banner */}
      {hasExpiryWarning && recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl text-xs text-slate-700 space-y-2 animate-fadeIn pl-4 relative">
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>⚠ No NGO can safely collect this food before it expires.</span>
          </div>
          <div className="pl-6 space-y-1 text-slate-600 font-medium">
            <p><strong>Suggestions:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Increase pickup availability radius in dashboard settings.</li>
              <li>Notify independent volunteer couriers directly for urgent transit.</li>
              <li>Donate directly to individuals or soup kitchens in your immediate vicinity.</li>
            </ul>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Matching Recommendations:</span>
            </h5>
            {showMapIdx !== null && (
              <button 
                onClick={() => setShowMapIdx(null)}
                className="text-[10px] text-red-500 hover:underline font-bold"
              >
                Hide Route Map
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((ngo, idx) => (
              <div key={ngo.ngoId} className="space-y-3">
                <NGORecommendationCard 
                  ngo={ngo}
                  onAssign={() => handleAssignNGO(ngo)}
                  onViewDetails={() => setShowMapIdx(showMapIdx === idx ? null : idx)}
                />
                
                {/* Embed Route Map when requested */}
                {showMapIdx === idx && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center text-xs text-slate-500 pl-1">
                      <span className="font-semibold">Transit Route: {ngo.ngoName}</span>
                      <span>Est. Travel Time: <strong>{Math.round(ngo.distance * 2)} mins</strong></span>
                    </div>
                    <MapComponent 
                      center={listing.restaurantLocation || { lat: 28.6519, lng: 77.2315 }}
                      activeRoute={{
                        origin: listing.restaurantLocation || { lat: 28.6519, lng: 77.2315 },
                        destination: { lat: ngo.maxCapacity ? 28.6470 : 28.6600, lng: 77.2260 } // approximate matching seed coordinates
                      }}
                    />
                  </div>
                )}
>>>>>>> 9a74e11d825d21c4ff32d83be61f7c0550c74b1c
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
