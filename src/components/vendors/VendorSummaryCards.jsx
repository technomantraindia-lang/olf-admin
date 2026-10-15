import React from 'react';
import clsx from 'clsx';
import { Users, Clock, PauseCircle, Store, Ban } from 'lucide-react';

export default function VendorSummaryCards({
  metrics,
  activeStatusFilter = 'ALL',
  onStatusClick,
}) {
  const {
    total = 0,
    active = 0,
    blocked = 0,
    pending = 0,
    inactive = 0,
    totalOutlets = 0,
  } = metrics || {};

  const cards = [
    {
      id: 'ALL',
      title: 'Total Vendors',
      count: total,
      subBadge: `${active} Active`,
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      id: 'Pending',
      title: 'Pending Review',
      count: pending,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      id: 'Blocked',
      title: 'Blocked Vendors',
      count: blocked,
      icon: Ban,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
    },
    {
      id: 'Inactive',
      title: 'Inactive / Paused',
      count: inactive,
      icon: PauseCircle,
      iconColor: 'text-slate-500',
      iconBg: 'bg-slate-100',
    },
    {
      id: 'outlets',
      title: 'Linked Outlets',
      count: totalOutlets,
      icon: Store,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      isOutletCard: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 my-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected =
          !card.isOutletCard &&
          (activeStatusFilter.toLowerCase() === card.id.toLowerCase() ||
            (card.id === 'ALL' &&
              (activeStatusFilter.toLowerCase() === 'all' ||
                activeStatusFilter.toLowerCase() === 'active')));

        return (
          <div
            key={card.id}
            onClick={() => {
              if (!card.isOutletCard && onStatusClick) {
                onStatusClick(card.id);
              }
            }}
            className={clsx(
              'p-4 rounded-xl border bg-white transition-all select-none',
              !card.isOutletCard && onStatusClick &&
                'cursor-pointer hover:border-slate-300 hover:shadow-xs active:scale-[0.99]',
              isSelected
                ? 'ring-2 ring-blue-600 border-transparent shadow-xs bg-blue-50/15'
                : 'border-slate-200/80 shadow-2xs'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                {card.title}
              </span>
              <div
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  card.iconBg
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', card.iconColor)} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {card.count}
              </span>
              {card.subBadge && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onStatusClick) {
                      onStatusClick(activeStatusFilter.toLowerCase() === 'active' ? 'ALL' : 'Active');
                    }
                  }}
                  className={clsx(
                    'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors',
                    activeStatusFilter.toLowerCase() === 'active'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100'
                  )}
                  title="Click to toggle Active vendors filter"
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      activeStatusFilter.toLowerCase() === 'active' ? 'bg-white' : 'bg-emerald-500'
                    )}
                  />
                  <span>{card.subBadge}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
