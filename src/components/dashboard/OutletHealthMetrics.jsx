import React from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle2, Clock, PauseCircle, XCircle } from 'lucide-react';

export default function OutletHealthMetrics({ metrics }) {
  const {
    total = 0,
    active = 0,
    pending = 0,
    inactive = 0,
    closed = 0,
  } = metrics || {};

  const items = [
    {
      id: 'total',
      label: 'Total Outlets',
      count: total,
      icon: Store,
      color: 'text-slate-900',
      dotColor: 'bg-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      link: '/outlets/all',
    },
    {
      id: 'active',
      label: 'Active Outlets',
      count: active,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50/40',
      borderColor: 'border-emerald-200',
      link: '/outlets/all?status=active',
    },
    {
      id: 'pending',
      label: 'Pending Outlets',
      count: pending,
      icon: Clock,
      color: 'text-amber-700',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50/40',
      borderColor: 'border-amber-200',
      link: '/outlets/pending',
    },
    {
      id: 'inactive',
      label: 'Inactive Outlets',
      count: inactive,
      icon: PauseCircle,
      color: 'text-slate-600',
      dotColor: 'bg-slate-400',
      bgColor: 'bg-slate-50/60',
      borderColor: 'border-slate-200',
      link: '/outlets/inactive',
    },
    {
      id: 'closed',
      label: 'Closed Outlets',
      count: closed,
      icon: XCircle,
      color: 'text-rose-700',
      dotColor: 'bg-rose-500',
      bgColor: 'bg-rose-50/40',
      borderColor: 'border-rose-200',
      link: '/outlets/closed',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Outlet Network Health (Current State)
          </h3>
        </div>
        <Link
          to="/outlets"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          Manage Outlets →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`p-3 rounded-lg border transition-all duration-150 hover:shadow-xs hover:-translate-y-0.5 flex items-center justify-between group ${item.bgColor} ${item.borderColor}`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                  <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                  <span>{item.label}</span>
                </div>
                <div className={`text-xl font-bold mt-1 ${item.color}`}>
                  {item.count}
                </div>
              </div>
              <Icon className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
