import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:shadow-slate-900/15 focus:ring-slate-900 border border-transparent shadow-xs',
    secondary:
      'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm focus:ring-slate-300 border border-slate-200 shadow-xs',
    outline:
      'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 focus:ring-slate-400 border border-slate-300',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md hover:shadow-rose-600/20 focus:ring-rose-600 border border-transparent shadow-xs',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20 focus:ring-emerald-600 border border-transparent shadow-xs',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 focus:ring-slate-300 border border-transparent',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseStyles,
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        LeftIcon && <LeftIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      <span>{children}</span>
      {!loading && RightIcon && (
        <RightIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
    </button>
  );
}
