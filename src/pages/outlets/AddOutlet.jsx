import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OutletForm from '../../components/outlets/OutletForm';
import { useOutlets } from '../../context/OutletContext';

export default function AddOutlet() {
  const { stationCode } = useParams();
  const [searchParams] = useSearchParams();
  const defaultVendorId = searchParams.get('vendorId') || '';

  const { getStation, getVendor } = useOutlets();
  const currentStation = getStation(stationCode);
  const currentVendor = defaultVendorId ? getVendor(defaultVendorId) : null;

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to={stationCode ? `/outlets/station/${stationCode}` : '/outlets'}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {currentStation?.name || 'Outlets'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-emerald-600 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Add New Railway Outlet
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {currentVendor ? (
            <>
              Registering new outlet under vendor partner{' '}
              <strong className="text-slate-800 font-semibold">
                {currentVendor.businessName} ({currentVendor.id})
              </strong>
              {currentStation && ` at ${currentStation.name} (${currentStation.code})`}.
            </>
          ) : currentStation ? (
            <>
              Registering new vendor kitchen for{' '}
              <strong className="text-slate-700">
                {currentStation.name} ({currentStation.code})
              </strong>
              . Complete operational windows, vendor assignment, and wallet requirements.
            </>
          ) : (
            'Register a new vendor kitchen on the OLF meal delivery network.'
          )}
        </p>
      </div>

      {/* Form */}
      <OutletForm
        mode="create"
        defaultStationCode={stationCode}
        defaultVendorId={defaultVendorId}
      />
    </div>
  );
}
