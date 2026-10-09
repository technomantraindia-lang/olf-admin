import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Store } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound({
  title = 'Page or Resource Not Found',
  message = 'The requested station, outlet record, or page URL does not exist or has been removed.',
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-6 bg-white rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>

      <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest mb-1">
        404 Error
      </span>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h1>

      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex items-center gap-3">
        <Link to="/outlets">
          <Button variant="primary" size="md" leftIcon={Store}>
            Return to Outlets Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}
