import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import OutletForm from '../../components/outlets/OutletForm';

export default function AddOutlet() {
  const { stationCode } = useParams();
  const [searchParams] = useSearchParams();
  const vendorIdFromQuery = searchParams.get('vendorId') || '';

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
              Add New Outlet
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter vendor info, basic details, business details, order settings, and compliance documents.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <OutletForm
        mode="create"
        defaultStationCode={stationCode}
        defaultVendorId={vendorIdFromQuery}
      />
    </div>
  );
}
