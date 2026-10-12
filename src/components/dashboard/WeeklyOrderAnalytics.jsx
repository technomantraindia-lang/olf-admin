import React, { useState } from 'react';
import { Download, TrendingUp } from 'lucide-react';

export default function WeeklyOrderAnalytics({ data = [] }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Default to 'Thu' (index 3)

  const activePoint = data[selectedDayIndex] || data[0] || {
    day: 'Thu',
    fullDay: 'Thursday',
    orders: 24,
    growth: '+14%',
  };

  const handleExport = () => {
    const filename = `olf-weekly-order-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    const rows = [
      ['OLF Stores - Weekly Order Analytics'],
      ['Export Date', new Date().toLocaleString()],
      [],
      ['Day', 'Full Day', 'Orders Count', 'IRCTC e-Catering', 'OLF Platform', 'Growth Rate'],
      ...data.map((d) => [d.day, d.fullDay, d.orders, d.irctc || 0, d.olf || 0, d.growth]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Dimensions
  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 25;

  const maxOrders = Math.max(...data.map((d) => d.orders), 35);
  const minOrders = 0;

  const points = data.map((d, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (data.length - 1 || 1);
    const y = height - paddingY - ((d.orders - minOrders) / (maxOrders - minOrders)) * (height - 2 * paddingY);
    return { x, y, ...d, index };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-2xs hover:shadow-xs transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Order Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly performance overview
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Mini metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Total Orders Card */}
        <div className="bg-blue-50/40 border border-blue-100/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs font-medium text-blue-600">
            <span>Total Orders</span>
            <span className="p-0.5 bg-blue-100 rounded text-blue-700">
              <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900">
              {activePoint.orders}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {activePoint.growth}
            </span>
          </div>
        </div>

        {/* Selected Day Card */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-500">
            Selected Day
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {activePoint.day}
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible select-none"
        >
          {/* Subtle horizontal grid guide */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#f1f5f9"
            strokeWidth="1.5"
          />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Day Points */}
          {points.map((p) => {
            const isSelected = p.index === selectedDayIndex;

            return (
              <g
                key={p.day}
                className="cursor-pointer group"
                onClick={() => setSelectedDayIndex(p.index)}
              >
                {/* Hit area */}
                <circle cx={p.x} cy={p.y} r={12} fill="transparent" />

                {/* Point ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#1d4ed8' : '#ffffff'}
                  stroke="#3b82f6"
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-150 group-hover:scale-125"
                />

                {/* Day Label at bottom */}
                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isSelected ? 'fill-blue-600 font-bold' : 'fill-slate-400 group-hover:fill-slate-700'
                  }`}
                >
                  {p.day}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="text-[11px] text-slate-400 text-center mt-2">
          Click any day to inspect order volume
        </div>
      </div>
    </div>
  );
}
