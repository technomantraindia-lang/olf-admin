import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Archive,
  Phone,
  Mail,
  Store,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { useOutlets } from '../../context/OutletContext';

export default function VendorTable({
  vendors = [],
  currentPage = 1,
  setCurrentPage = () => {},
  pageSize = 10,
  getOutletsByVendor: propGetOutlets,
  getStationsByVendor: propGetStations,
  onArchiveRequest = () => {},
}) {
  const {
    getOutletsByVendor: ctxGetOutlets,
    getStationsByVendor: ctxGetStations,
  } = useOutlets();

  const getOutlets = propGetOutlets || ctxGetOutlets || (() => []);
  const getStations = propGetStations || ctxGetStations || (() => []);

  // Expandable row state (accordion dropdown)
  const [expandedVendorId, setExpandedVendorId] = useState(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key, e) => {
    e?.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const toggleExpand = (vendorId) => {
    setExpandedVendorId((prev) => (prev === vendorId ? null : vendorId));
  };

  const totalItems = vendors.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentVendors = vendors.slice(startIndex, endIndex);

  if (totalItems === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No vendors found"
        description="Try adjusting your search criteria or register a new vendor partner."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-4 px-4 w-12 text-center"></th>
              <th className="py-4 px-4 whitespace-nowrap">Vendor ID</th>
              <th className="py-4 px-5 min-w-[260px]">Business Name</th>
              <th className="py-4 px-5 min-w-[190px]">Contact Person</th>
              <th className="py-4 px-4 whitespace-nowrap text-center">Outlets</th>
              <th className="py-4 px-4 min-w-[180px]">Stations</th>
              <th className="py-4 px-4 whitespace-nowrap text-right">Gross Value*</th>
              <th className="py-4 px-4 whitespace-nowrap text-right">Earnings*</th>
              <th className="py-4 px-4 whitespace-nowrap">Status</th>
              <th className="py-4 px-4 text-right whitespace-nowrap min-w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {currentVendors.map((vendor) => {
              if (!vendor) return null;
              const vendorOutlets = getOutlets(vendor.id) || [];
              const vendorStations = getStations(vendor.id) || [];
              const isExpanded = expandedVendorId === vendor.id;

              return (
                <React.Fragment key={vendor.id}>
                  {/* Clean, spacious row - NO intrusive hover popovers */}
                  <tr
                    className={`transition-colors duration-150 ${
                      isExpanded
                        ? 'bg-emerald-50/25'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Expand/Collapse Toggle Button */}
                    <td className="py-4.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(vendor.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                        }`}
                        title={isExpanded ? 'Collapse vendor details' : 'Expand vendor details'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Vendor ID */}
                    <td className="py-4.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-800 border border-slate-200">
                          {vendor.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(vendor.id, `id-${vendor.id}`, e)}
                          className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                          title="Copy Vendor ID"
                        >
                          {copiedKey === `id-${vendor.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="py-4.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                          {vendor.businessName ? vendor.businessName.charAt(0).toUpperCase() : 'V'}
                        </div>
                        <div>
                          <Link
                            to={`/outlets/vendors/${vendor.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5 text-[15px] leading-snug"
                          >
                            <span>{vendor.businessName}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0" />
                          </Link>
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {vendor.category || 'Food Service'} • {vendor.city || ''}{vendor.state ? `, ${vendor.state}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="py-4.5 px-5">
                      <div>
                        <span className="font-medium text-slate-900 text-sm block">
                          {vendor.contactPerson || '—'}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 mt-0.5 text-xs">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {vendor.phone || '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Number of Outlets */}
                    <td className="py-4.5 px-4 text-center whitespace-nowrap">
                      <Link
                        to={`/outlets/vendors/${vendor.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors shadow-2xs"
                        title="View vendor outlets"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>{vendorOutlets.length}</span>
                      </Link>
                    </td>

                    {/* Associated Stations */}
                    <td className="py-4.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                        {vendorStations.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">None assigned</span>
                        ) : (
                          <>
                            {vendorStations.slice(0, 3).map((station) => (
                              <Link
                                key={station.code}
                                to={`/outlets/station/${station.code}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                                title={`${station.name} (${station.code})`}
                              >
                                {station.code}
                              </Link>
                            ))}
                            {vendorStations.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                                +{vendorStations.length - 3}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Gross Order Value */}
                    <td className="py-4.5 px-4 text-right whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-900 text-sm block">
                          {formatCurrency(vendor.metrics?.grossOrderValue || 0)}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          {vendor.metrics?.totalOrders || 0} orders*
                        </span>
                      </div>
                    </td>

                    {/* Vendor Earnings */}
                    <td className="py-4.5 px-4 text-right whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-emerald-700 text-sm block">
                          {formatCurrency(vendor.metrics?.vendorEarnings || 0)}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          Illustrative*
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-4 whitespace-nowrap">
                      <StatusBadge status={vendor.status} size="md" />
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/outlets/vendors/${vendor.id}`}>
                          <button
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-all cursor-pointer border border-transparent hover:border-emerald-200"
                            title="View Vendor Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        <Link to={`/outlets/vendors/${vendor.id}/edit`}>
                          <button
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all cursor-pointer border border-transparent hover:border-blue-200"
                            title="Edit Vendor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>

                        {vendor.status !== 'Archived' && (
                          <button
                            type="button"
                            onClick={() => onArchiveRequest(vendor)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer border border-transparent hover:border-rose-200"
                            title="Archive Vendor"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE ROW DRAWER: Clean, Spacious, Minimal & Easy to View */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <td colSpan={10} className="p-5 sm:p-6">
                        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
                          {/* Drawer Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
                                <Building2 className="w-4 h-4 text-emerald-700" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-base">
                                    {vendor.businessName}
                                  </h4>
                                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    {vendor.id}
                                  </span>
                                  <StatusBadge status={vendor.status} size="sm" />
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {vendor.category || 'General Food Service'} • Registered: {vendor.registrationDate || '2025'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <Link
                                to={`/outlets/new?vendorId=${vendor.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Outlet</span>
                              </Link>
                              <Link
                                to={`/outlets/vendors/${vendor.id}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-2xs"
                              >
                                <span>Open Full Page</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>

                          {/* 3 Spacious Minimal Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Associated Outlets */}
                            <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                  <Store className="w-4 h-4 text-indigo-600" />
                                  Associated Outlets ({vendorOutlets.length})
                                </span>
                              </div>

                              {vendorOutlets.length === 0 ? (
                                <p className="text-slate-400 italic text-xs py-3">
                                  No outlets linked to this vendor yet.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {vendorOutlets.map((outlet) => (
                                    <div
                                      key={outlet.id}
                                      className="p-3 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3"
                                    >
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                                            {outlet.stationCode || 'STN'}
                                          </span>
                                          <Link
                                            to={`/outlets/${outlet.id}`}
                                            className="font-semibold text-slate-900 hover:text-emerald-700 text-sm truncate block"
                                          >
                                            {outlet.name}
                                          </Link>
                                        </div>
                                        <span className="text-xs text-slate-500 block mt-1">
                                          {outlet.stationName || 'Platform Kitchen'}
                                        </span>
                                      </div>
                                      <StatusBadge status={outlet.status} size="sm" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Column 2: Legal & Compliance Documents */}
                            <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Compliance & Legal Status
                              </span>

                              <div className="space-y-2.5">
                                <div className="p-3 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="font-semibold text-slate-900 text-xs block">
                                      FSSAI Central Catering License
                                    </span>
                                    <span className="text-xs text-slate-500 mt-0.5 block">
                                      Valid until Dec 2027
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                                    Verified
                                  </span>
                                </div>

                                <div className="p-3 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="font-semibold text-slate-900 text-xs block">
                                      GSTIN Registration
                                    </span>
                                    <span className="text-xs text-slate-500 mt-0.5 block">
                                      Active Taxpayer ID
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                                    Active
                                  </span>
                                </div>

                                <div className="p-3 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="font-semibold text-slate-900 text-xs block">
                                      IRCTC Master Catering Agreement
                                    </span>
                                    <span className="text-xs text-slate-500 mt-0.5 block">
                                      Commercial partner contract active
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                                    Signed
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Headquarters & Primary Contact */}
                            <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-600" />
                                Registered Office & Contact
                              </span>

                              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 space-y-2.5 text-xs">
                                <div>
                                  <span className="text-slate-400 uppercase font-semibold text-[11px] block">
                                    Corporate Address
                                  </span>
                                  <p className="font-medium text-slate-800 text-xs mt-1 leading-relaxed">
                                    {vendor.address || 'Corporate Headquarters'}, {vendor.city}, {vendor.state} - {vendor.pincode || '380001'}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[11px] block">
                                      Phone
                                    </span>
                                    <span className="font-mono font-semibold text-slate-800 text-xs">
                                      {vendor.phone || '—'}
                                    </span>
                                  </div>
                                  {vendor.phone && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(vendor.phone, `drawer-ph-${vendor.id}`, e)}
                                      className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors cursor-pointer"
                                      title="Copy phone"
                                    >
                                      {copiedKey === `drawer-ph-${vendor.id}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                  <span className="text-slate-400 uppercase font-semibold text-[11px] block">
                                    Email
                                  </span>
                                  <span className="font-medium text-slate-800 text-xs truncate block mt-0.5">
                                    {vendor.email || 'corporate@olfstores.in'}
                                  </span>
                                </div>
                              </div>
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
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
        <div>
          Showing{' '}
          <strong className="text-slate-900">
            {totalItems === 0 ? 0 : startIndex + 1}
          </strong>{' '}
          to <strong className="text-slate-900">{endIndex}</strong> of{' '}
          <strong className="text-slate-900">{totalItems}</strong> entries
          <span className="text-xs text-slate-400 ml-2">
            (*Illustrative Phase 1 demonstration metrics)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

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
                    className={`px-3 py-1.5 rounded-md font-semibold text-xs cursor-pointer ${
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

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
