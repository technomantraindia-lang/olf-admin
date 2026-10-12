import React from 'react';
import { Link } from 'react-router-dom';
import { Train, ArrowRight } from 'lucide-react';

export default function TopStations({
  stations = [],
  rangeLabel = 'Selected Period',
}) {
  const maxOrders = stations.length > 0 ? Math.max(...stations.map((s) => s.orders), 1) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Stations by Orders
            </h3>
            <p className="text-xs text-slate-500">
              Ranked stations for {rangeLabel}
            </p>
          </div>
        </div>

        <Link
          to="/outlets"
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
        >
          <span>View All Hubs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="p-5 space-y-3.5">
        {stations.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            No station order volume recorded for this period.
          </p>
        ) : (
          stations.map((station, index) => {
            const rank = index + 1;
            const progressPct = Math.round((station.orders / maxOrders) * 100);

            return (
              <div key={station.code} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : rank === 3
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{rank}
                    </span>

                    <span className="font-mono font-bold text-slate-900 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] shrink-0">
                      {station.code}
                    </span>

                    <Link
                      to={`/outlets/station/${station.code}`}
                      className="font-medium text-slate-800 hover:text-orange-600 hover:underline truncate"
                    >
                      {station.name}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs shrink-0 ml-2">
                    <strong className="text-slate-900">
                      {station.orders.toLocaleString()}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      ({station.share}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-md overflow-hidden">
                  <div
                    style={{ width: `${progressPct}%` }}
                    className={`h-full rounded-md transition-all duration-500 ${
                      rank === 1
                        ? 'bg-orange-500'
                        : rank === 2
                        ? 'bg-blue-600'
                        : rank === 3
                        ? 'bg-indigo-600'
                        : 'bg-slate-500'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Derived consistently from order volume</span>
        <span className="text-slate-500 font-medium">Top 5 Railway Stations</span>
      </div>
    </div>
  );
}
