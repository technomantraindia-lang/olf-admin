import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function OrderTrendChart({
  trendData = [],
  rangeLabel = 'Selected Period',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!trendData || trendData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px] text-center">
        <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Trend Data</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          No trend timeline points available for this period.
        </p>
      </div>
    );
  }

  // Calculate scales
  const maxVal = Math.max(...trendData.map((d) => Math.max(d.irctc, d.olf, d.total)), 10);
  const chartHeight = 160;
  const paddingX = 30;
  const paddingY = 20;
  const chartWidth = 520;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const getX = (index) => {
    if (trendData.length <= 1) return chartWidth / 2;
    return paddingX + (index / (trendData.length - 1)) * usableWidth;
  };

  const getY = (val) => {
    return paddingY + usableHeight - (val / maxVal) * usableHeight;
  };

  // Build SVG path strings
  const irctcPoints = trendData.map((d, i) => `${getX(i)},${getY(d.irctc)}`);
  const olfPoints = trendData.map((d, i) => `${getX(i)},${getY(d.olf)}`);

  const irctcPath = `M ${irctcPoints.join(' L ')}`;
  const olfPath = `M ${olfPoints.join(' L ')}`;

  // Area fill paths
  const irctcArea = `${irctcPath} L ${getX(trendData.length - 1)},${chartHeight - paddingY} L ${getX(0)},${chartHeight - paddingY} Z`;
  const olfArea = `${olfPath} L ${getX(trendData.length - 1)},${chartHeight - paddingY} L ${getX(0)},${chartHeight - paddingY} Z`;

  const activePoint = hoveredIndex !== null ? trendData[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Order Volume Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily order trajectory by channel for {rangeLabel}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-600" />
            <span className="font-semibold text-slate-700">IRCTC e-Catering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-orange-500" />
            <span className="font-semibold text-slate-700">OLF Website/App</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="irctcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="olfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + usableHeight / 2}
            x2={chartWidth - paddingX}
            y2={paddingY + usableHeight / 2}
            stroke="#f1f5f9"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#e2e8f0"
          />

          {/* Area fills */}
          <path d={irctcArea} fill="url(#irctcGradient)" />
          <path d={olfArea} fill="url(#olfGradient)" />

          {/* Line paths */}
          <path
            d={irctcPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={olfPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Points */}
          {trendData.map((d, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible hover trigger column */}
                <rect
                  x={x - usableWidth / trendData.length / 2}
                  y={paddingY}
                  width={usableWidth / trendData.length}
                  height={usableHeight}
                  fill="transparent"
                />

                {/* IRCTC dot */}
                <circle
                  cx={x}
                  cy={getY(d.irctc)}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* OLF dot */}
                <circle
                  cx={x}
                  cy={getY(d.olf)}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#f97316"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between px-2 pt-2 text-[11px] font-medium text-slate-400">
          {trendData.map((d, i) => (
            <span
              key={d.date}
              className={`text-center ${
                hoveredIndex === i ? 'text-slate-900 font-bold' : ''
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Hover Details Pill */}
      {activePoint ? (
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-xs animate-in fade-in-50">
          <span className="font-semibold text-slate-800">
            {activePoint.label}:
          </span>
          <div className="flex items-center gap-4">
            <span className="text-blue-700 font-semibold font-mono">
              IRCTC: {activePoint.irctc} orders
            </span>
            <span className="text-orange-600 font-semibold font-mono">
              OLF: {activePoint.olf} orders
            </span>
            <span className="text-slate-900 font-bold font-mono">
              Total: {activePoint.total} orders
            </span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>*Demonstration time-series data for operational overview</span>
          <span>Hover data points to inspect channel breakdown</span>
        </div>
      )}
    </div>
  );
}
