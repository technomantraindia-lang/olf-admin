import React from 'react';
import { PieChart, Info } from 'lucide-react';

export default function OrdersBySourceChart({
  irctcOrders = 0,
  olfOrders = 0,
  totalOrders = 0,
  irctcShare = 0,
  olfShare = 0,
  rangeLabel = 'Selected Period',
}) {
  if (totalOrders === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px] text-center">
        <PieChart className="w-8 h-8 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Orders in Period</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          No orders were recorded for the selected date range ({rangeLabel}).
        </p>
      </div>
    );
  }

  // SVG Donut calculation
  // Radius = 50, Circumference = 2 * PI * 50 = 314.159
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const irctcDash = (irctcShare / 100) * circumference;
  const olfDash = (olfShare / 100) * circumference;
  const irctcOffset = 0;
  const olfOffset = -irctcDash;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Panel Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-600" />
            Orders by Source
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Channel origination breakdown for {rangeLabel}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {totalOrders.toLocaleString()} Total
        </span>
      </div>

      {/* Donut Chart Visual */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="20"
            />

            {/* IRCTC Segment (Blue: #2563eb) */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#2563eb"
              strokeWidth="20"
              strokeDasharray={`${irctcDash} ${circumference}`}
              strokeDashoffset={irctcOffset}
              className="transition-all duration-700 ease-out"
            />

            {/* OLF Segment (Orange: #f97316) */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#f97316"
              strokeWidth="20"
              strokeDasharray={`${olfDash} ${circumference}`}
              strokeDashoffset={olfOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-xl font-bold text-slate-900 leading-none">
              {totalOrders.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Orders
            </span>
          </div>
        </div>

        {/* Legend Cards */}
        <div className="space-y-3 w-full sm:w-auto flex-1 max-w-xs">
          {/* IRCTC Source */}
          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-blue-600 shrink-0 shadow-2xs" />
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  IRCTC e-Catering
                </span>
                <span className="text-[11px] text-slate-500">
                  Passenger PNR Orders
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-blue-700 font-mono block">
                {irctcOrders.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {irctcShare}%
              </span>
            </div>
          </div>

          {/* OLF Website/App Source */}
          <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 shrink-0 shadow-2xs" />
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  OLF Website/App
                </span>
                <span className="text-[11px] text-slate-500">
                  Direct Platform Orders
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-orange-600 font-mono block">
                {olfOrders.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {olfShare}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Rule: totalOrders = irctcOrders + olfOrders
        </span>
        <span className="font-semibold text-slate-600">
          Verified Split Ratio
        </span>
      </div>
    </div>
  );
}
