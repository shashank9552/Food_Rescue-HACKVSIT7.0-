import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Sparkles, Loader, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchSuggestions({ listingId }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const findMatchFn = httpsCallable(functions, 'findMatch');
      const res = await findMatchFn({ listingId });
      setMatches(res.data);
      toast.success("Eligible local NGO matching calculations completed!");
    } catch (err) {
      console.error("Match calculation failed: ", err);
      setError(err.message || "Failed to find matching NGOs");
      toast.error("Matching service encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {matches.length === 0 && !loading && !error && (
        <button
          onClick={fetchMatches}
          className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-150 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-green-600 animate-pulse" />
          <span>Find Closest NGO Matches</span>
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5">
          <Loader className="w-3.5 h-3.5 animate-spin text-slate-350" />
          <span>Calculating intelligent scores...</span>
        </div>
      )}

      {error && (
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
