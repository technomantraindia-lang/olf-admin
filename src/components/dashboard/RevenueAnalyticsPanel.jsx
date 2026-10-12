import React, { useState } from 'react';
import { Download, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { monthlyRevenueAnalytics } from '../../data/mockOrders';

export default function RevenueAnalyticsPanel() {
  const [selectedRange, setSelectedRange] = useState('Oct - Dec 2026');

  const rangeOptions = ['Oct - Dec 2026', 'Jul - Sep 2026', 'All Time'];
  const currentData = monthlyRevenueAnalytics[selectedRange] || monthlyRevenueAnalytics['Oct - Dec 2026'];

  const handleExport = () => {
    const filename = `olf-revenue-analytics-${selectedRange.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    const rows = [
      ['OLF Stores - Revenue Analytics Overview'],
      ['Selected Period', selectedRange],
      ['Total Period Revenue', currentData.totalRevenue],
      ['Period Growth', currentData.growth],
      [],
      ['Timeline / Period', 'Revenue (INR)'],
      ...currentData.points.map((p) => [p.label, p.revenue]),
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

  const maxVal = Math.max(...currentData.points.map((p) => p.revenue)) * 1.15;
  const minVal = Math.min(...currentData.points.map((p) => p.revenue)) * 0.85;

  const points = currentData.points.map((p, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (currentData.points.length - 1 || 1);
    const y = height - paddingY - ((p.revenue - minVal) / (maxVal - minVal || 1)) * (height - 2 * paddingY);
    return { x, y, ...p, index };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-2xs hover:shadow-xs transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Revenue Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly revenue performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker dropdown */}
          <div className="relative">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {rangeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Mini metric card */}
      <div className="mb-6">
        <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-xl p-3.5 sm:max-w-xs">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-700">
            <span>Total Revenue (Selected Range)</span>
            <span className="p-0.5 bg-emerald-100 rounded text-emerald-800">
              <IndianRupee className="w-3 h-3" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(currentData.totalRevenue)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {currentData.growth}
            </span>
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
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Month Points */}
          {points.map((p) => (
            <g key={p.label} className="cursor-pointer group">
              {/* Hit area */}
              <circle cx={p.x} cy={p.y} r={12} fill="transparent" />

              {/* Point ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth={2.5}
                className="transition-all duration-150 group-hover:scale-125"
              />

              {/* Tooltip on hover */}
              <title>{`${p.label}: ${formatCurrency(p.revenue)}`}</title>

              {/* Label at bottom */}
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[11px] font-medium fill-slate-400 group-hover:fill-slate-700 transition-colors"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="text-[11px] text-slate-400 text-center mt-2">
          Monthly financial settlement trajectory
        </div>
      </div>
    </div>
  );
}
