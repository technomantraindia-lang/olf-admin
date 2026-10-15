import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Store, CheckCircle2, Leaf } from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import { outletService } from '../../services/outletService';
import OutletTable from '../../components/outlets/OutletTable';

export default function OutletsOverview() {
  const { outlets, vendors } = useOutlets();
  const [backendStatus, setBackendStatus] = useState({ checked: false, connected: false, irctcConnected: false });

  useEffect(() => {
    outletService.checkBackendConnection().then((res) => {
      setBackendStatus({
        checked: true,
        connected: res.connected,
        irctcConnected: Boolean(res.data?.irctcConnection?.connected),
      });
    });
  }, []);

  const activeOutlets = outlets.filter(
    (o) => o.status !== 'Archived' && o.status !== 'Deleted' && o.archived !== true
  );
  const totalCount = activeOutlets.length;
  const listedCount = activeOutlets.filter((o) => o.listed !== false).length;
  const pureVegCount = activeOutlets.filter((o) => o.mealType === 'PURE_VEG').length;
  const activePercentage = totalCount > 0 ? ((listedCount / totalCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              OLF Outlets Management
            </h1>

            {/* Micro Eyebrow Badges with distinct glowing indicators */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>IRCTC Sync Ready</span>
              </span>

              {backendStatus.checked && (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold border shadow-2xs ${
                    backendStatus.connected
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title={backendStatus.connected ? 'OLF Express Backend on Port 4000 linked to IRCTC' : 'Start OLF Backend on Port 4000'}
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendStatus.connected ? 'bg-blue-400' : 'bg-slate-400'} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${backendStatus.connected ? 'bg-blue-600' : 'bg-slate-500'}`} />
                  </span>
                  <span>
                    {backendStatus.connected
                      ? `OLF Backend: Port 4000 ${backendStatus.irctcConnected ? '(IRCTC Linked)' : ''}`
                      : 'OLF Backend: Offline'}
                  </span>
                </span>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage railway station restaurants, vendor associations, FSSAI compliance, and IRCTC eCatering v3 live catalog.
          </p>
        </div>

        {/* Quick Directory & Add Outlet Buttons with low border-radius */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/outlets/vendors"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs hover:shadow-xs transition-all"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Vendors Directory ({vendors.length})</span>
          </Link>
          <Link
            to="/outlets/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Outlet</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric / KPI Cards Row with low border-radius and clean low gap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Outlets */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Outlets
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {totalCount}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Across stations ({totalCount} active)</span>
          </div>
        </div>

        {/* Card 2: IRCTC Listed */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              IRCTC Listed
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {listedCount}
          </div>
          <div className="text-xs font-medium text-emerald-600 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{activePercentage}% live in IRCTC catalog</span>
          </div>
        </div>

        {/* Card 3: Pure Veg Outlets */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pure Veg Outlets
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {pureVegCount}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{pureVegCount > 0 ? `${pureVegCount} certified veg` : 'Certified vegetarian'}</span>
          </div>
        </div>

        {/* Card 4: Active Vendors */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Vendors
            </span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {vendors.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Partner brands with numeric IDs</span>
          </div>
        </div>
      </div>

      {/* Main Outlets Table & Filters */}
      <OutletTable defaultView="stations" />
    </div>
  );
}
