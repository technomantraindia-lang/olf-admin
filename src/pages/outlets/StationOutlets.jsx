import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin } from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import OutletTable from '../../components/outlets/OutletTable';

export default function StationOutlets() {
  const { stationCode } = useParams();
  const { stations } = useOutlets();

  const code = (stationCode || '').toUpperCase();
  const stationInfo = stations.find((s) => s.code.toUpperCase() === code);

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/outlets"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Outlets</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-800 font-mono font-bold text-sm px-2.5 py-0.5 rounded-md border border-blue-200">
              {code}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {stationInfo ? stationInfo.name : code} Outlets
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {stationInfo?.fullName || 'Railway Station'} • {stationInfo?.division || 'Division'} •{' '}
              {stationInfo?.zone || 'Zone'}
            </span>
          </p>
        </div>
        <Link
          to={`/outlets/${code}/new`}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Outlet at {code}</span>
        </Link>
      </div>

      {/* Table Filtered by this station */}
      <OutletTable presetStation={code} />
    </div>
  );
}
