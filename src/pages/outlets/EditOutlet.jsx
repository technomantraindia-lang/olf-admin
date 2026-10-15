import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, AlertCircle } from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import OutletForm from '../../components/outlets/OutletForm';

export default function EditOutlet() {
  const { outletId } = useParams();
  const { outlets } = useOutlets();
  const [outlet, setOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = outlets.find((o) => String(o.id).toUpperCase() === String(outletId).toUpperCase());
    setOutlet(found || null);
    setLoading(false);
  }, [outletId, outlets]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading outlet details...
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Outlet Not Found</h2>
        <p className="text-sm text-slate-500">
          No outlet with ID <code className="font-mono text-slate-700">{outletId}</code> exists in the system.
        </p>
        <Link
          to="/outlets"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition"
        >
          Return to Outlets List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/outlets"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Outlets</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Edit Outlet: {outlet.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Outlet ID: <code className="font-mono font-bold text-slate-700">{outlet.id}</code> • Station: <code className="font-mono text-slate-700">{outlet.stationCode}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <OutletForm mode="edit" initialData={outlet} />
    </div>
  );
}
