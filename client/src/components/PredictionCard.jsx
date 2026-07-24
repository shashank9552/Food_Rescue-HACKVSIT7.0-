import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Sparkles, Loader, Sun, CloudRain, AlertTriangle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PredictionCard({ restaurantId = "spice_garden" }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Form states for heuristics inputs
  const [weather, setWeather] = useState('clear');
  const [festival, setFestival] = useState(false);
  const [traffic, setTraffic] = useState('normal');

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const predictWasteFn = httpsCallable(functions, 'predictWaste');
      const res = await predictWasteFn({ 
        restaurantId,
        weather,
        festival,
        traffic
      });
      setPrediction(res.data);
      toast.success("AI Surplus volume prediction completed!");
    } catch (err) {
      console.error("AI Prediction failed: ", err);
      setError(err.message || "Failed to fetch prediction");
      toast.error("Forecasting service encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
        <span>AI Surplus Predictor</span>
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        Forecast tomorrow's expected surplus food volume by feeding current variables into the heuristic forecasting model.
      </p>

      {/* Input parameters */}
      <div className="space-y-3.5 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-150">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Weather Forecast</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-500 text-slate-700 font-medium"
            >
              <option value="clear">☀️ Clear / Sunny</option>
              <option value="rainy">🌧️ Rainy / Wet</option>
              <option value="stormy">⛈️ Stormy / Extreme</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Expected Traffic</label>
            <select
              value={traffic}
              onChange={(e) => setTraffic(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-500 text-slate-700 font-medium"
            >
              <option value="normal">👥 Normal</option>
              <option value="high">📈 High Sales</option>
              <option value="low">📉 Low Traffic</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-semibold text-slate-650">Festival / Holiday Tomorrow?</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={festival}
              onChange={(e) => setFestival(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      {prediction && (
        <div className="bg-green-50/50 p-4 rounded-xl border border-green-150/60 flex flex-col gap-3 animate-fadeIn text-xs">
          <div className="flex justify-between items-baseline border-b border-green-100 pb-2">
            <span className="font-semibold text-slate-650">Tomorrow's Surplus:</span>
            <span className="text-base font-extrabold text-green-700">{prediction.predictedKg} kg</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-605">
            <div>
              <span className="font-medium block text-slate-400">Expected Meals</span>
              <span className="font-bold text-slate-800">{prediction.expectedMeals || Math.round(prediction.predictedKg * 2.5)} meals</span>
            </div>
            <div>
              <span className="font-medium block text-slate-400">Confidence Rate</span>
              <span className="font-bold text-slate-800">{prediction.confidence || 85}%</span>
            </div>
          </div>

          <div className="flex gap-1.5 items-start mt-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              <strong>Suggestion:</strong> {prediction.suggestion}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-150 p-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-100 hover:text-white hover:bg-slate-850 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="w-4 h-4 animate-spin text-slate-500" /> : "Run AI Prediction"}
      </button>
    </div>
  );
}
