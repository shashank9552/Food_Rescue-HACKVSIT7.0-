import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Box, Clock, Award, Star, Info } from 'lucide-react';

export default function NGORecommendationCard({ 
  ngo, 
  onAssign, 
  onViewDetails 
}) {
  const matchScore = ngo.matchScore || 90;
  
  // Circular progress math
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

  // Rating stars based on matchScore
  const starsCount = Math.round(matchScore / 20);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 bg-white/90 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Top Banner accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-green-600" />

      <div className="flex justify-between items-start pl-2">
        <div className="flex items-center gap-3">
          {/* Mock Logo / Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-50 to-emerald-50 border border-green-100 flex items-center justify-center text-green-700 font-bold shadow-inner">
            {ngo.ngoName ? ngo.ngoName.charAt(0) : 'N'}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">{ngo.ngoName}</h4>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < starsCount ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              stroke="#F1F5F9" 
              strokeWidth="4.5" 
              fill="transparent" 
            />
            {/* Foreground circle */}
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              stroke="#16A34A" 
              strokeWidth="4.5" 
              fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-green-700">{matchScore}%</span>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-500 border-y border-slate-100 py-3.5 pl-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Distance: <strong>{ngo.distance} km</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5 text-slate-400" />
          <span>Capacity: <strong>{ngo.maxCapacity - ngo.currentCapacity}kg left</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Est. Pickup: <strong>{ngo.estimatedPickup}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-slate-400" />
          <span>Reliability: <strong>{ngo.successRate}%</strong></span>
        </div>
      </div>

      {/* AI Explanation reasoning */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 pl-4 relative">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
          <Info className="w-3.5 h-3.5 text-green-600" />
          <span>AI Matching Reasoning</span>
        </div>
        <ul className="text-[11px] text-slate-650 space-y-1.5 leading-relaxed list-none pl-0">
          {ngo.reason.split('\n').map((line, idx) => (
            <li key={idx} className="relative pl-3">
              <span className="absolute left-0 text-green-600 font-bold">•</span>
              {line.replace(/^•\s*/, '')}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pl-2 pt-1">
        <button
          onClick={onViewDetails}
          className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
        >
          View Details
        </button>
        <button
          onClick={onAssign}
          className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-green-600/10"
        >
          Assign NGO
        </button>
      </div>
    </motion.div>
  );
}
