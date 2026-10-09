import React from 'react';
import clsx from 'clsx';
import { Users, CheckCircle2, Clock, PauseCircle, Store } from 'lucide-react';

export default function VendorSummaryCards({
  metrics,
  activeStatusFilter = 'ALL',
  onStatusClick,
}) {
  const {
    total = 0,
    active = 0,
    pending = 0,
    inactive = 0,
    totalOutlets = 0,
  } = metrics || {};

  const cards = [
    {
      id: 'ALL',
      title: 'Total Vendors',
      count: total,
      icon: Users,
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-slate-900 border-transparent',
      text: 'text-slate-900',
      iconColor: 'text-slate-600',
      badge: 'All Partners',
    },
    {
      id: 'Active',
      title: 'Active Vendors',
      count: active,
      icon: CheckCircle2,
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-200',
      activeBorder: 'ring-2 ring-emerald-600 border-transparent',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      badge: 'Approved',
    },
    {
      id: 'Pending',
      title: 'Pending Review',
      count: pending,
      icon: Clock,
      bg: 'bg-amber-50/40',
      border: 'border-amber-200',
      activeBorder: 'ring-2 ring-amber-500 border-transparent',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
      badge: 'Compliance Due',
    },
    {
      id: 'Inactive',
      title: 'Inactive / Paused',
      count: inactive,
      icon: PauseCircle,
      bg: 'bg-slate-50/50',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-slate-400 border-transparent',
      text: 'text-slate-700',
      iconColor: 'text-slate-500',
      badge: 'Paused',
    },
    {
      id: 'outlets',
      title: 'Associated Outlets',
      count: totalOutlets,
      icon: Store,
      bg: 'bg-indigo-50/40',
      border: 'border-indigo-200',
      activeBorder: 'ring-2 ring-indigo-600 border-transparent',
      text: 'text-indigo-800',
      iconColor: 'text-indigo-600',
      badge: 'Multi-Station',
      isOutletCard: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = !card.isOutletCard && activeStatusFilter.toLowerCase() === card.id.toLowerCase();

        return (
          <div
            key={card.id}
            onClick={() => {
              if (!card.isOutletCard && onStatusClick) {
                onStatusClick(card.id);
              }
            }}
            className={clsx(
              'p-4 rounded-xl border transition-all duration-200 select-none group relative overflow-hidden',
              card.bg,
              card.border,
              !card.isOutletCard && onStatusClick &&
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
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs group-hover:border-slate-300 transition-colors">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
