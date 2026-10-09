import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, CheckCircle, Clock, PauseCircle, XCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function StationCard({ station, metrics }) {
  const navigate = useNavigate();

  const {
    code,
    name,
    fullName,
    state,
    zone,
    platforms,
  } = station;

  const {
    total = 0,
    active = 0,
    pending = 0,
    inactive = 0,
    closed = 0,
  } = metrics || {};

  const handleCardClick = () => {
    navigate(`/outlets/station/${code}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-300/80 transition-all duration-300 p-5 flex flex-col justify-between group overflow-hidden cursor-pointer"
    >
      {/* Top Animated Accent Border on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:via-teal-500 group-hover:to-emerald-600 transition-all duration-300" />

      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-900 text-white tracking-wider group-hover:bg-emerald-600 group-hover:shadow-xs transition-colors duration-200">
                {code}
              </span>
              <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                {state}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-emerald-700 transition-colors duration-200">
              {name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">
              {fullName || `${name} Railway Station`}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Zone</span>
            <p className="text-[11px] text-slate-400 font-mono font-medium">
              {zone ? zone.split(' ')[0] : 'IR'}
            </p>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="h-px bg-slate-100 my-4 group-hover:bg-slate-200/80 transition-colors" />

        {/* Counts Breakdown Grid with Micro-Interactions */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Total */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-[1.02] transition-all duration-150">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              Total
            </span>
            <span className="font-bold text-slate-900">{total}</span>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100 hover:scale-[1.02] transition-all duration-150">
            <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Active
            </span>
            <span className="font-bold text-emerald-700">{active}</span>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-100 hover:bg-amber-100 hover:scale-[1.02] transition-all duration-150">
            <span className="text-amber-700 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending
            </span>
            <span className="font-bold text-amber-700">{pending}</span>
          </div>

          {/* Inactive */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-[1.02] transition-all duration-150">
            <span className="text-slate-600 flex items-center gap-1.5">
              <PauseCircle className="w-3.5 h-3.5 text-slate-400" />
              Inactive
            </span>
            <span className="font-bold text-slate-600">{inactive}</span>
          </div>

          {/* Closed */}
          <div className="col-span-2 flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100 hover:bg-rose-100 hover:scale-[1.01] transition-all duration-150">
            <span className="text-rose-700 flex items-center gap-1.5 font-medium">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              Closed Outlets
            </span>
            <span className="font-bold text-rose-700">{closed}</span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {platforms} Platforms
        </span>

        <Button
          variant="secondary"
          size="sm"
          className="group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs group-hover:shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/outlets/station/${code}`);
          }}
        >
          <span>View Outlets</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}
