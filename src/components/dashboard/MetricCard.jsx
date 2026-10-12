import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeColor = 'default',
  growthRate = null,
  growthLabel = 'vs prev period',
  accentColor = 'slate', // 'slate' | 'blue' | 'orange' | 'emerald'
  disclaimer = null,
}) {
  const accentStyles = {
    slate: {
      card: 'border-slate-200/90 hover:border-slate-300',
      iconBox: 'bg-slate-100 text-slate-700',
      text: 'text-slate-900',
    },
    blue: {
      card: 'border-blue-200/80 hover:border-blue-300 bg-blue-50/20',
      iconBox: 'bg-blue-100 text-blue-700',
      text: 'text-blue-900',
    },
    orange: {
      card: 'border-orange-200/80 hover:border-orange-300 bg-orange-50/20',
      iconBox: 'bg-orange-100 text-orange-700',
      text: 'text-orange-900',
    },
    emerald: {
      card: 'border-emerald-200/80 hover:border-emerald-300 bg-emerald-50/20',
      iconBox: 'bg-emerald-100 text-emerald-800',
      text: 'text-emerald-900',
    },
  };

  const currentAccent = accentStyles[accentColor] || accentStyles.slate;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border p-5 shadow-xs transition-all duration-150 flex flex-col justify-between space-y-3',
        currentAccent.card
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs',
              currentAccent.iconBox
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div
          className={clsx(
            'text-2xl sm:text-3xl font-bold tracking-tight',
            currentAccent.text
          )}
        >
          {value}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {badgeText && (
            <span
              className={clsx(
                'text-[11px] font-bold px-2 py-0.5 rounded-md border',
                badgeColor === 'blue' && 'bg-blue-50 text-blue-700 border-blue-200',
                badgeColor === 'orange' && 'bg-orange-50 text-orange-700 border-orange-200',
                badgeColor === 'emerald' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                badgeColor === 'default' && 'bg-slate-100 text-slate-700 border-slate-200'
              )}
            >
              {badgeText}
            </span>
          )}

          {growthRate !== null && growthRate !== undefined && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 text-xs font-semibold',
                growthRate >= 0 ? 'text-emerald-700' : 'text-rose-600'
              )}
            >
              {growthRate >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>
                {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
              </span>
              <span className="text-[11px] font-normal text-slate-400 ml-0.5">
                {growthLabel}
              </span>
            </span>
          )}

          {subtext && !growthRate && (
            <span className="text-xs text-slate-500">{subtext}</span>
          )}
        </div>

        {disclaimer && (
          <p className="text-[10px] text-slate-400 mt-1 italic">
            {disclaimer}
          </p>
        )}
      </div>
    </div>
  );
}
