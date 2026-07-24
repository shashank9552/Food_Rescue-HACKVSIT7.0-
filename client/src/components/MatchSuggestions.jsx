import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Sparkles, Loader, MapPin } from 'lucide-react';

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
    } catch (err) {
      console.error("Match calculation failed: ", err);
      setError(err.message || "Failed to find matching NGOs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 border-t border-slate-900/60 pt-3">
      {matches.length === 0 && !loading && !error && (
        <button
          onClick={fetchMatches}
          className="text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Find Closest NGO Matches
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
          <Loader className="w-3.5 h-3.5 animate-spin" />
          <span>Searching eligible local NGOs...</span>
        </div>
      )}

      {error && (
        <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2.5 animate-fadeIn">
          <h5 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Closest Eligible NGOs:
          </h5>
          <div className="grid grid-cols-1 gap-2">
            {matches.map((ngo) => (
              <div
                key={ngo.id}
                className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{ngo.name}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                      Cap: {ngo.capacityKg}kg
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>
                      {ngo.distanceKm} km away {ngo.durationMin ? `(${ngo.durationMin} mins)` : ""}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-[8px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {ngo.method} method
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
