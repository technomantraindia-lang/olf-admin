import React from 'react';
import { Star, ShieldCheck, ThumbsUp } from 'lucide-react';

export default function CustomerRatingMetrics({ ratingData }) {
  if (!ratingData) return null;

  const {
    overallScore = 4.6,
    totalReviews = 3840,
    satisfactionRate = 94.2,
    categories = [],
    sourceComparison = {},
  } = ratingData;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Passenger Rating & Meal Quality Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated feedback across all onboard delivery halts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{satisfactionRate}% Satisfaction Rate</span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Overall Score Badge */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1">
            <span>{overallScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-200 pl-4">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.floor(overallScore)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500 block">
              Based on {totalReviews.toLocaleString()} passenger reviews
            </span>
          </div>
        </div>

        {/* Categories Progress Breakdown */}
        <div className="space-y-2 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate">
                    {cat.name}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {cat.score} ★
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.pct}%` }}
                    className="h-full bg-emerald-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Source breakdown */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              IRCTC e-Catering Avg: <strong className="text-slate-800 font-semibold">{sourceComparison.irctcRating || 4.6} ★</strong>
            </span>
            <span>
              OLF Direct Platform Avg: <strong className="text-slate-800 font-semibold">{sourceComparison.olfRating || 4.7} ★</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
