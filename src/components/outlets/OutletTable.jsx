import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Timer,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Store,
  Building2,
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useOutlets } from '../../context/OutletContext';

export default function OutletTable({
  outlets,
  currentPage,
  setCurrentPage,
  pageSize,
  onDeleteRequest,
}) {
  const { vendors } = useOutlets();
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Vendor Lookup Map
  const vendorMap = React.useMemo(() => {
    const map = new Map();
    (vendors || []).forEach((v) => map.set(v.id, v));
    return map;
  }, [vendors]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Pagination calculation
  const totalItems = outlets.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentOutlets = outlets.slice(startIndex, endIndex);

  if (totalItems === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No outlets match criteria"
        description="Try adjusting or clearing your search term, station, or status filters."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10"></th>
              <th className="py-3.5 px-4">Outlet ID</th>
              <th className="py-3.5 px-4 min-w-[260px]">Outlet Information</th>
              <th className="py-3.5 px-4 min-w-[190px]">Vendor</th>
              <th className="py-3.5 px-4 min-w-[140px]">Wallet</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 min-w-[130px]">Last Updated</th>
              <th className="py-3.5 px-4 text-right min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {currentOutlets.map((outlet) => {
              const isExpanded = expandedRows.has(outlet.id);
              const isLowBalance =
                (outlet.wallet?.balance ?? 0) < (outlet.wallet?.threshold ?? 0);
              const vendor = vendorMap.get(outlet.vendorId);

              return (
                <React.Fragment key={outlet.id}>
                  {/* Main Row */}
                  <tr
                    className={`hover:bg-emerald-50/40 transition-colors duration-150 ${
                      isExpanded ? 'bg-slate-50/70 border-b border-transparent' : ''
                    }`}
                  >
                    {/* Expand/Collapse Trigger */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRow(outlet.id)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse row' : 'Expand details'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Outlet ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-800 border border-slate-200">
                        {outlet.id}
                      </span>
                    </td>

                    {/* Outlet Information */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/outlets/${outlet.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline transition-colors"
                          >
                            {outlet.name}
                          </Link>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {outlet.category}
                          </span>
                        </div>

                        {/* Sub-info pills */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">
                            {outlet.stationName} ({outlet.stationCode})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {outlet.openingTime} - {outlet.closingTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3 text-slate-400" />
                            {outlet.prepTime} mins prep
                          </span>
                          <span>•</span>
                          <span>Min: {formatCurrency(outlet.minOrderValue)}</span>
                        </div>

                        {/* Payment pills */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {outlet.paymentModes?.cod && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Banknote className="w-2.5 h-2.5" />
                              COD
                            </span>
                          )}
                          {outlet.paymentModes?.prepaid && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <CreditCard className="w-2.5 h-2.5" />
                              Prepaid
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vendor Cell */}
                    <td className="py-3.5 px-4">
                      {vendor ? (
                        <div>
                          <Link
                            to={`/outlets/vendors/${vendor.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1.5 transition-colors"
                            title={`View ${vendor.businessName} vendor profile`}
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {vendor.businessName}
                            </span>
                          </Link>
                          <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                            {vendor.id}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Wallet */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-bold text-slate-900">
                          {formatCurrency(outlet.wallet?.balance)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Threshold: {formatCurrency(outlet.wallet?.threshold)}
                        </div>
                        {isLowBalance && (
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>Low Balance</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={outlet.status} size="sm" />
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      <div>{formatDate(outlet.updatedAt, false)}</div>
                      <div className="text-[11px] text-slate-400">
                        {outlet.updatedAt
                          ? new Date(outlet.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/outlets/${outlet.id}`}>
                          <button
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-110 active:scale-95 rounded-md transition-all cursor-pointer shadow-2xs"
                            title="View Outlet Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        <Link to={`/outlets/${outlet.id}/edit`}>
                          <button
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 hover:scale-110 active:scale-95 rounded-md transition-all cursor-pointer shadow-2xs"
                            title="Edit Outlet"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => onDeleteRequest(outlet)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:scale-110 active:scale-95 rounded-md transition-all cursor-pointer shadow-2xs"
                          title="Delete Outlet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row Detail View */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <td colSpan={8} className="p-4 pl-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-lg border border-slate-200">
                          {/* Column 1: Contact Information */}
                          <div>
                            <span className="font-semibold text-slate-800 block mb-2 uppercase tracking-wider text-[10px]">
                              Contact Details
                            </span>
                            <div className="space-y-1.5 text-slate-600">
                              <p className="font-medium text-slate-900">
                                {outlet.contactPerson || 'Not provided'}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {outlet.phone || '—'}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {outlet.email || '—'}
                              </p>
                            </div>
                          </div>

                          {/* Column 2: Address & Location */}
                          <div>
                            <span className="font-semibold text-slate-800 block mb-2 uppercase tracking-wider text-[10px]">
                              Station Address
                            </span>
                            <div className="space-y-1 text-slate-600">
                              <p className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>
                                  {outlet.address}, {outlet.city}, {outlet.state} -{' '}
                                  {outlet.pincode}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Column 3: Description & Operations */}
                          <div>
                            <span className="font-semibold text-slate-800 block mb-2 uppercase tracking-wider text-[10px]">
                              Outlet Overview
                            </span>
                            <p className="text-slate-600 leading-relaxed italic">
                              "{outlet.description || 'No description provided.'}"
                            </p>
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                              <span>IRCTC Delivery: Passenger Coach Delivery</span>
                              <Link
                                to={`/outlets/${outlet.id}`}
                                className="text-emerald-700 font-semibold hover:underline"
                              >
                                Full Profile &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing{' '}
          <strong className="text-slate-900">
            {totalItems === 0 ? 0 : startIndex + 1}
          </strong>{' '}
          to <strong className="text-slate-900">{endIndex}</strong> of{' '}
          <strong className="text-slate-900">{totalItems}</strong> entries
        </div>

        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
            )
            .map((page, idx, arr) => {
              const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                      currentPage === page
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
