import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OutletForm from '../../components/outlets/OutletForm';
import { useOutlets } from '../../context/OutletContext';
import NotFound from '../NotFound';

export default function EditOutlet() {
  const { outletId } = useParams();
  const { getOutlet } = useOutlets();
  const outlet = getOutlet(outletId);

  if (!outlet) {
    return (
      <NotFound
        message={`Outlet with ID "${outletId}" was not found or has been removed.`}
      />
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to={`/outlets/${outlet.id}`}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Outlet Profile</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-slate-900 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Outlet: {outlet.name}
          </h1>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 ml-2">
            {outlet.id}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Modify operational windows, vendor assignment, contact details, minimum order thresholds, or payment modes.
        </p>
      </div>

      {/* Form in edit mode */}
      <OutletForm initialData={outlet} mode="edit" />
    </div>
  );
}
