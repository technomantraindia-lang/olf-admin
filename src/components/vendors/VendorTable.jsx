import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Archive,
  Phone,
  Store,
  Building2,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  ArrowRight,
  CreditCard,
  Percent,
  Ban,
  CheckCircle2,
  Trash2,
  MoreHorizontal,
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
  onDeleteRequest = () => {},
}) {
  const {
    getOutletsByVendor: ctxGetOutlets,
    getStationsByVendor: ctxGetStations,
    toggleBlockVendor,
  } = useOutlets();

  const getOutlets = propGetOutlets || ctxGetOutlets || (() => []);
  const getStations = propGetStations || ctxGetStations || (() => []);

  // Expandable row state
  const [expandedVendorId, setExpandedVendorId] = useState(null);

  // More actions popover state
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  const toggleExpand = (vendorId) => {
    setExpandedVendorId((prev) => (prev === vendorId ? null : vendorId));
  };

  const handleToggleBlock = async (vendor, e) => {
    e.stopPropagation();
    if (toggleBlockVendor) {
      await toggleBlockVendor(vendor.id);
    }
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
    <div className="space-y-4">
      {/* Floating Card Rows Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-left"
          style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}
        >
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-3 w-10 text-center"></th>
              <th className="py-3 px-4 whitespace-nowrap">Vendor ID</th>
              <th className="py-3 px-5 min-w-[240px]">Vendor / Brand</th>
              <th className="py-3 px-4 min-w-[170px]">Contact Person</th>
              <th className="py-3 px-4 whitespace-nowrap text-center">Outlets</th>
              <th className="py-3 px-4 min-w-[140px]">Stations</th>
              <th className="py-3 px-4 whitespace-nowrap text-right">Orders &amp; Revenue</th>
              <th className="py-3 px-4 whitespace-nowrap">Status</th>
              <th className="py-3 px-4 text-right whitespace-nowrap min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentVendors.map((vendor) => {
              if (!vendor) return null;
              const vendorOutlets = getOutlets(vendor.id) || [];
              const vendorStations = getStations(vendor.id) || [];
              const isExpanded = expandedVendorId === vendor.id;
              const isBlocked = vendor.status === 'Blocked';

              return (
                <React.Fragment key={vendor.id}>
                  {/* Floating Card Row */}
                  <tr
                    className={`group transition-all duration-150 ${
                      isBlocked ? 'opacity-90' : ''
                    }`}
                  >
                    {/* Expand/Collapse Toggle Button */}
                    <td className="py-5 px-3 text-center bg-white border-y border-slate-200/80 group-hover:border-slate-300 first:border-l first:rounded-l-xl shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleExpand(vendor.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${
                          isExpanded
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={isExpanded ? 'Collapse vendor profile' : 'Expand vendor profile'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Vendor ID */}
                    <td className="py-5 px-4 whitespace-nowrap bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg border border-slate-200/80">
                        #{vendor.id}
                      </span>
                    </td>

                    {/* Vendor Name & Brand Display */}
                    <td className="py-5 px-5 bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 border ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}
                        >
                          {(vendor.brandName || vendor.businessName || 'V')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/outlets/vendors/${vendor.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors inline-block text-sm leading-snug truncate"
                          >
                            {vendor.brandName || vendor.businessName}
                          </Link>
                          <span className="text-xs text-slate-400 block truncate mt-0.5">
                            {vendor.category || 'Food Service'}
                            {vendor.city ? ` • ${vendor.city}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Owner Contact */}
                    <td className="py-5 px-4 bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block">
                          {vendor.contactPerson || '—'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 mt-0.5 block">
                          {vendor.phone || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Total Outlets */}
                    <td className="py-5 px-4 text-center whitespace-nowrap bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleExpand(vendor.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs border transition cursor-pointer ${
                          vendorOutlets.length > 0
                            ? 'bg-blue-50 hover:bg-blue-100/80 text-blue-700 border-blue-200/70'
                            : 'bg-slate-50 text-slate-400 border-slate-200/60'
                        }`}
                        title="Click to view linked outlets"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>{vendorOutlets.length} Outlets</span>
                      </button>
                    </td>

                    {/* Stations */}
                    <td className="py-5 px-4 bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-[160px]">
                        {vendorStations.length === 0 ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : (
                          <>
                            {vendorStations.slice(0, 3).map((station) => (
                              <Link
                                key={station.code}
                                to={`/outlets/station/${station.code}`}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                              >
                                {station.code}
                              </Link>
                            ))}
                            {vendorStations.length > 3 && (
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                +{vendorStations.length - 3}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Total Orders & Volume */}
                    <td className="py-5 px-4 text-right whitespace-nowrap bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          {(vendor.metrics?.totalOrders || 1420).toLocaleString()} Orders
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 mt-0.5 block">
                          {formatCurrency(vendor.metrics?.grossOrderValue || 384750)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-5 px-4 whitespace-nowrap bg-white border-y border-slate-200/80 group-hover:border-slate-300 shadow-2xs">
                      <StatusBadge status={vendor.status} size="md" />
                    </td>

                    {/* Streamlined Minimal Actions */}
                    <td className="py-5 px-4 whitespace-nowrap text-right bg-white border-y border-slate-200/80 group-hover:border-slate-300 last:border-r last:rounded-r-xl shadow-2xs relative">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Full Details */}
                        <Link
                          to={`/outlets/vendors/${vendor.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200/70 hover:border-blue-200 transition cursor-pointer"
                          title="View Vendor Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          to={`/outlets/vendors/${vendor.id}/edit`}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/70 hover:border-slate-300 transition cursor-pointer"
                          title="Edit Vendor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* More Actions Dropdown */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId((prev) =>
                                prev === vendor.id ? null : vendor.id
                              );
                            }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              activeActionMenuId === vendor.id
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-slate-200/70'
                            }`}
                            title="More Actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeActionMenuId === vendor.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                }}
                              />
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl z-30 py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-150"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleExpand(vendor.id);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
                                >
                                  <Store className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{isExpanded ? 'Hide' : 'Show'} Outlets</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    handleToggleBlock(vendor, e);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
                                >
                                  {isBlocked ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Unblock Vendor</span>
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Suspend / Block</span>
                                    </>
                                  )}
                                </button>

                                {vendor.status !== 'Archived' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onArchiveRequest(vendor);
                                      setActiveActionMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Archive Vendor</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteRequest(vendor);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-medium transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Vendor</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE ROW DRAWER */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="py-2 px-1">
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
                          {/* Drawer Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {vendor.brandName || vendor.businessName}
                                  </h4>
                                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                    #{vendor.id}
                                  </span>
                                  <StatusBadge status={vendor.status} size="sm" />
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {vendor.legalName && vendor.legalName !== (vendor.brandName || vendor.businessName) && (
                                    <>Legal Name: <span className="font-medium text-slate-600">{vendor.legalName}</span> • </>
                                  )}
                                  {vendor.city ? `${vendor.city}, ${vendor.state || 'India'}` : 'Registered Partner'}
                                  {vendor.category && vendor.category !== 'Multi-Cuisine Quick Service' && vendor.category !== 'Food Service' && (
                                    <> • {vendor.category}</>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <Link
                                to={`/outlets/new?vendorId=${vendor.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Outlet</span>
                              </Link>
                              <Link
                                to={`/outlets/vendors/${vendor.id}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs"
                              >
                                <span>Open Vendor Dossier</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>

                          {/* Attribute Cards: Only display details that are actually provided */}
                          {(() => {
                            const hasTaxOrBanking = Boolean(
                              vendor.panNumber ||
                              vendor.gstin ||
                              vendor.bankAccountNumber ||
                              (vendor.bankName && vendor.bankName !== 'HDFC Bank')
                            );

                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                {/* Card 1: Contact Details */}
                                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs">
                                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-blue-600" /> Contact Details
                                  </span>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Contact Person</span>
                                    <span className="font-semibold text-slate-900">
                                      {vendor.contactPerson || vendor.businessName || '—'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Mobile Phone</span>
                                    <span className="font-mono font-medium text-slate-900">
                                      {vendor.phone || '—'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Email</span>
                                    <span className="font-medium text-slate-700 truncate block">
                                      {vendor.email || '—'}
                                    </span>
                                  </div>
                                </div>

                                {/* Card 2: Registered Address & Location */}
                                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs">
                                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Registered Address
                                  </span>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Office Address</span>
                                    <span className="font-medium text-slate-800 line-clamp-2">
                                      {vendor.address || 'Address not specified'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">City &amp; State</span>
                                    <span className="font-medium text-slate-700">
                                      {vendor.city ? `${vendor.city}, ${vendor.state || 'India'}` : '—'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">PIN Code</span>
                                    <span className="font-mono font-medium text-slate-900">
                                      {vendor.pincode || '—'}
                                    </span>
                                  </div>
                                </div>

                                {/* Card 3: Registration & Status */}
                                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs">
                                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Registration &amp; Status
                                  </span>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Registered Date</span>
                                    <span className="font-medium text-slate-800">
                                      {vendor.registrationDate ||
                                        (vendor.createdAt
                                          ? new Date(vendor.createdAt).toISOString().slice(0, 10)
                                          : '—')}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Operational Status</span>
                                    <span className="font-semibold text-slate-800">
                                      {vendor.status || 'Active'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">Notes / Remarks</span>
                                    <span className="text-slate-600 line-clamp-2 italic">
                                      {vendor.notes || 'None recorded'}
                                    </span>
                                  </div>
                                </div>

                                {/* Card 4: Associated Outlets */}
                                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 mb-2">
                                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                        <Store className="w-3.5 h-3.5 text-blue-600" /> Associated Outlets
                                      </span>
                                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                                        {vendorOutlets.length}
                                      </span>
                                    </div>

                                    {vendorOutlets.length === 0 ? (
                                      <div className="py-2.5 text-center space-y-2">
                                        <p className="text-slate-400 text-xs">No outlets linked yet</p>
                                        <Link
                                          to={`/outlets/new?vendorId=${vendor.id}`}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Add Outlet</span>
                                        </Link>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5 max-h-[135px] overflow-y-auto pr-1">
                                        {vendorOutlets.map((outlet) => (
                                          <Link
                                            key={outlet.id}
                                            to={`/outlets/${outlet.id}`}
                                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-center justify-between text-xs group"
                                          >
                                            <div className="min-w-0 pr-1.5">
                                              <span className="font-semibold text-slate-800 group-hover:text-blue-600 truncate block text-[11px]">
                                                {outlet.name}
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-mono">
                                                {outlet.stationCode} • #{outlet.id}
                                              </span>
                                            </div>
                                            <StatusBadge status={outlet.status} size="sm" />
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {vendorOutlets.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                      <span className="text-slate-400 font-medium">
                                        {vendorStations.length} station{vendorStations.length !== 1 ? 's' : ''}
                                      </span>
                                      <Link
                                        to={`/outlets/new?vendorId=${vendor.id}`}
                                        className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                      >
                                        <span>+ Add Outlet</span>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
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

      {/* Pagination Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
        <div>
          Showing{' '}
          <strong className="text-slate-800">
            {totalItems === 0 ? 0 : startIndex + 1}
          </strong>{' '}
          to <strong className="text-slate-800">{endIndex}</strong> of{' '}
          <strong className="text-slate-800">{totalItems}</strong> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-600"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-600"
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
                    className={`px-3 py-1 rounded-lg font-semibold text-xs cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
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
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-600"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-600"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
