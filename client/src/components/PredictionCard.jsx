import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Sparkles, Loader } from 'lucide-react';

export default function PredictionCard({ restaurantId = "spice_garden" }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const predictWasteFn = httpsCallable(functions, 'predictWaste');
      const res = await predictWasteFn({ restaurantId });
      setPrediction(res.data);
    } catch (err) {
      console.error("AI Prediction failed: ", err);
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <span>AI Surplus Predictor</span>
      </h3>
      <p className="text-xs text-slate-400">
        Forecast tomorrow's expected surplus food volume based on weekly history and weekend demand trends.
      </p>

      {prediction && (
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Predicted Quantity</span>
            <span className="text-lg font-extrabold text-emerald-400">{prediction.predictedKg} kg</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Based on past logs: {prediction.basedOnDays} days</span>
            {prediction.weekendBoost && (
              <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                Weekend Boost +25%
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="w-4 h-4 animate-spin text-slate-500" /> : "Run AI Prediction"}
      </button>
    </div>
  );
}
