import React from 'react';
import clsx from 'clsx';
import { Store, CheckCircle2, Clock, PauseCircle, XCircle } from 'lucide-react';

export default function OutletSummaryCards({
  metrics,
  activeStatusFilter = 'ALL',
  onStatusClick,
}) {
  const {
    total = 0,
    active = 0,
    pending = 0,
    inactive = 0,
    closed = 0,
  } = metrics || {};

  const cards = [
    {
      id: 'ALL',
      title: 'Total Outlets',
      count: total,
      icon: Store,
      color: 'slate',
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-slate-900 border-transparent',
      text: 'text-slate-900',
      iconColor: 'text-slate-600',
      badge: 'All Hubs',
    },
    {
      id: 'Active',
      title: 'Active Outlets',
      count: active,
      icon: CheckCircle2,
      color: 'emerald',
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-200',
      activeBorder: 'ring-2 ring-emerald-600 border-transparent',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      badge: 'Delivering',
    },
    {
      id: 'Pending',
      title: 'Pending Review',
      count: pending,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50/40',
      border: 'border-amber-200',
      activeBorder: 'ring-2 ring-amber-500 border-transparent',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
      badge: 'Awaiting Ops',
    },
    {
      id: 'Inactive',
      title: 'Inactive Outlets',
      count: inactive,
      icon: PauseCircle,
      color: 'slate',
      bg: 'bg-slate-50/50',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-slate-400 border-transparent',
      text: 'text-slate-700',
      iconColor: 'text-slate-500',
      badge: 'Paused',
    },
    {
      id: 'Closed',
      title: 'Closed Outlets',
      count: closed,
      icon: XCircle,
      color: 'rose',
      bg: 'bg-rose-50/40',
      border: 'border-rose-200',
      activeBorder: 'ring-2 ring-rose-600 border-transparent',
      text: 'text-rose-800',
      iconColor: 'text-rose-600',
      badge: 'Offline',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatusFilter.toLowerCase() === card.id.toLowerCase();

        return (
          <div
            key={card.id}
            onClick={() => onStatusClick && onStatusClick(card.id)}
            className={clsx(
              'p-4 rounded-xl border transition-all duration-200 select-none group relative overflow-hidden',
              card.bg,
              card.border,
              onStatusClick &&
                'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] hover:border-slate-300',
              isSelected ? card.activeBorder : 'hover:ring-1 hover:ring-slate-300/80'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                {card.title}
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/80 border border-slate-100 flex items-center justify-center group-hover:bg-white transition-all shadow-xs">
                <Icon
                  className={clsx(
                    'w-4 h-4 group-hover:scale-125 transition-transform duration-200',
                    card.iconColor
                  )}
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span
                className={clsx(
                  'text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform duration-200 origin-left',
                  card.text
                )}
              >
                {card.count}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs group-hover:border-slate-300 transition-colors">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
