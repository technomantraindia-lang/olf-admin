import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import OutletTable from '../../components/outlets/OutletTable';

export default function AllOutlets({ presetFilter }) {
  const { filterType } = useParams();
  const effectiveFilter = presetFilter || filterType || 'all';

  const getFilterDetails = () => {
    switch (effectiveFilter.toLowerCase()) {
      case 'prepaid':
        return {
          title: 'Prepaid Outlets',
          desc: 'Station restaurants configured exclusively for online prepaid orders.',
        };
      case 'pending':
        return {
          title: 'Pending Outlets',
          desc: 'Station outlets awaiting statutory documents or IRCTC corporate review.',
        };
      case 'inactive':
        return {
          title: 'Inactive Outlets',
          desc: 'Station outlets temporarily deactivated or delisted from live passenger ordering.',
        };
      case 'closed':
        return {
          title: 'Closed Outlets',
          desc: 'Station outlets marked as closed for operational or maintenance reasons.',
        };
      case 'archived':
      case 'deleted':
        return {
          title: 'Deleted Outlets',
          desc: 'Outlets deleted or archived from active railway station operations.',
        };
      default:
        return {
          title: 'All Station Outlets',
          desc: 'Comprehensive register of station restaurant outlets across all IRCTC divisions.',
        };
    }
  };

  const details = getFilterDetails();

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/outlets" className="text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {details.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {details.desc}
          </p>
        </div>
        <Link
          to="/outlets/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Outlet Application</span>
        </Link>
      </div>

      {/* Outlets Table with active filter */}
      <OutletTable presetFilter={effectiveFilter} defaultView="table" />
    </div>
  );
}
