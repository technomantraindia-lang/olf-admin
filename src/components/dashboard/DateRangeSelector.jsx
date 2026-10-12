import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateRangeSelector({ selectedRange, onRangeChange }) {
  const options = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/80">
      <div className="flex items-center gap-1.5 px-2 text-slate-400">
        <Calendar className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        {options.map((opt) => {
          const isActive = selectedRange === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onRangeChange(opt.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
