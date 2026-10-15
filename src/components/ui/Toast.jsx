import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export default function Toast({ toast, onClose, autoCloseMs = 4500 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [toast, onClose, autoCloseMs]);

  if (!toast) return null;

  const { message, type = 'success' } = toast;
  const displayMessage =
    typeof message === 'object' && message !== null
      ? message.message || message.title || JSON.stringify(message)
      : String(message || '');

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-slate-800',
    error: 'border-rose-200 bg-white text-slate-800',
    info: 'border-sky-200 bg-white text-slate-800',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={clsx(
          'flex items-center gap-3 p-4 rounded-xl border shadow-lg',
          borders[type] || borders.info
        )}
      >
        {icons[type] || icons.info}
        <p className="text-sm font-medium pr-2 text-slate-800">{displayMessage}</p>
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-slate-600 rounded-md p-1 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
