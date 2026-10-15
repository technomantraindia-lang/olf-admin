import React from 'react';
import clsx from 'clsx';

export default function StatusBadge({
  status,
  size = 'md',
  className = '',
  showDot = true,
  pill = false, // defaults to modern clean rounded-md instead of excessive pill
}) {
  const normalized = String(status || '').trim().toLowerCase();

  let styles = {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  switch (normalized) {
    case 'active':
      styles = {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500 animate-pulse',
        label: 'Active',
      };
      break;
    case 'pending':
      styles = {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending',
      };
      break;
    case 'inactive':
      styles = {
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
        label: 'Inactive',
      };
      break;
    case 'blocked':
      styles = {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-600',
        label: 'Blocked',
      };
      break;
    case 'closed':
      styles = {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Closed',
      };
      break;
    case 'archived':
      styles = {
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-500',
        label: 'Archived',
      };
      break;
    case 'deleted':
      styles = {
        badge: 'bg-red-100 text-red-800 border-red-300 line-through opacity-80',
        dot: 'bg-red-600',
        label: 'Deleted',
      };
      break;
    default:
      styles = {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status || 'N/A',
      };
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center border font-medium transition-colors',
        pill ? 'rounded-full' : 'rounded-md',
        sizeClasses[size] || sizeClasses.md,
        styles.badge,
        className
      )}
    >
      {showDot && (
        <span
          className={clsx(
            'rounded-full shrink-0',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            styles.dot
          )}
        />
      )}
      <span className="truncate">{styles.label}</span>
    </span>
  );
}
