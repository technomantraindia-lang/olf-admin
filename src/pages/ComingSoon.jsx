import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

export default function ComingSoon({ title, description }) {
  const location = useLocation();

  const formattedName =
    title ||
    location.pathname
      .replace(/^\//, '')
      .replace(/-/g, ' ')
      .replace(/\//g, ' > ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Module';

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 bg-white rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
        <Clock className="w-7 h-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        Phase 2 Staging
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {formattedName}
      </h1>

      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
        {description ||
          `The ${formattedName} module is actively under development for the upcoming release phase. Outlets Management is currently live and fully functional.`}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/outlets">
          <Button variant="primary" size="md" rightIcon={ArrowRight}>
            Go to Outlets Management
          </Button>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>OLF Stores • Railway Meal-Delivery Platform</span>
      </div>
    </div>
  );
}
