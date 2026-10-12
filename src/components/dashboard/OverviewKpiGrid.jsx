import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

export default function OverviewKpiGrid({ metrics }) {
  const navigate = useNavigate();

  const cards = [
    // Row 1: Orders, Revenue & Customers
    {
      id: 'today-orders',
      title: "Today's Orders",
      value: (metrics.todayOrders ?? 24).toLocaleString(),
      valueColor: 'text-blue-600',
      to: '/orders/all',
    },
    {
      id: 'total-orders',
      title: 'Total Orders (All Time)',
      value: (metrics.totalOrdersAllTime ?? 12951).toLocaleString(),
      valueColor: 'text-blue-600',
      to: '/orders/all',
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: formatCurrency(metrics.revenue ?? 3757507.92),
      valueColor: 'text-emerald-600',
    },
    {
      id: 'customers',
      title: 'Customers',
      value: (metrics.customers ?? 1).toLocaleString(),
      valueColor: 'text-purple-600',
      to: '/orders/customers',
    },

    // Row 2: Outlets Status
    {
      id: 'total-outlets',
      title: 'Total Outlets',
      value: (metrics.totalOutlets ?? 806).toLocaleString(),
      valueColor: 'text-slate-900',
      to: '/outlets',
    },
    {
      id: 'active-outlets',
      title: 'Active Outlets',
      value: (metrics.activeOutlets ?? 338).toLocaleString(),
      valueColor: 'text-emerald-600',
      to: '/outlets/all?status=active',
    },
    {
      id: 'inactive-outlets',
      title: 'Inactive Outlets',
      value: (metrics.inactiveOutlets ?? 178).toLocaleString(),
      valueColor: 'text-orange-500',
      to: '/outlets/inactive',
    },
    {
      id: 'scheduled-close',
      title: 'Scheduled Close',
      value: (metrics.scheduledClose ?? 40).toLocaleString(),
      valueColor: 'text-amber-500',
      to: '/outlets/closed',
    },

    // Row 3: Outlets Intelligence & Insights
    {
      id: 'deleted-outlets',
      title: 'Deleted Outlets',
      value: (metrics.deletedOutlets ?? 299).toLocaleString(),
      valueColor: 'text-red-500',
      to: '/outlets/archived',
    },
    {
      id: 'most-complaints',
      title: 'Most complaints on',
      value: metrics.mostComplaints || 'Coming Soon',
      valueColor: 'text-blue-600',
      to: '/complaints',
    },
    {
      id: 'most-ordered',
      title: 'Most ordered from',
      value: metrics.mostOrderedFrom || 'Coming Soon',
      valueColor: 'text-emerald-600',
    },
    {
      id: 'top-rated',
      title: 'Top rated restaurant',
      value: metrics.topRatedRestaurant || 'Coming Soon',
      valueColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isClickable = Boolean(card.to);

        return (
          <div
            key={card.id}
            onClick={() => isClickable && card.to && navigate(card.to)}
            className={`bg-white rounded-xl border border-slate-100 p-5 shadow-2xs transition-all duration-150 ${
              isClickable
                ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5'
                : 'hover:border-slate-200'
            }`}
          >
            <div className="text-sm font-medium text-slate-700 select-none">
              {card.title}
            </div>
            <div className={`text-2xl font-bold mt-2.5 tracking-tight ${card.valueColor}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
