import React from 'react';

const statusConfig = {
  posted: { label: 'Posted', bg: 'bg-posted/10', text: 'text-posted', border: 'border-posted/30', dot: 'bg-posted' },
  claimed: { label: 'Claimed', bg: 'bg-claimed/10', text: 'text-claimed', border: 'border-claimed/30', dot: 'bg-claimed' },
  picked_up: { label: 'Picked Up', bg: 'bg-picked_up/10', text: 'text-picked_up', border: 'border-picked_up/30', dot: 'bg-picked_up' },
  delivered: { label: 'Delivered', bg: 'bg-delivered/10', text: 'text-delivered', border: 'border-delivered/30', dot: 'bg-delivered' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { 
    label: status, 
    bg: 'bg-slate-800', 
    text: 'text-slate-400', 
    border: 'border-slate-700',
    dot: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
      {config.label}
    </span>
  );
}
