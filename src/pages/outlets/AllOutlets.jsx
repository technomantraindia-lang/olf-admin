import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  Building2,
  Train,
  Store,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Banknote,
  CreditCard,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import OutletSummaryCards from '../../components/outlets/OutletSummaryCards';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { exportOutletsToCsv } from '../../utils/exportCsv';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function AllOutlets({ presetFilter = null }) {
  const location = useLocation();

  // Deduce initial filter from path if presetFilter not passed directly
  const pathname = location.pathname;
  let initialStatus = 'ALL';
  let initialPayment = 'ALL';

  if (presetFilter) {
    if (presetFilter === 'prepaid') initialPayment = 'prepaid';
    else initialStatus = presetFilter.charAt(0).toUpperCase() + presetFilter.slice(1);
  } else if (pathname === '/outlets/prepaid') {
    initialPayment = 'prepaid';
  } else if (pathname === '/outlets/pending') {
    initialStatus = 'Pending';
  } else if (pathname === '/outlets/inactive') {
    initialStatus = 'Inactive';
  } else if (pathname === '/outlets/closed') {
    initialStatus = 'Closed';
  } else if (pathname === '/outlets/archived') {
    initialStatus = 'Archived';
  }

  const {
    outlets = [],
    vendors = [],
    stations = [],
    getGlobalMetrics,
    deleteOutlet,
  } = useOutlets();

  // Metrics
  const metrics = useMemo(() => {
    return getGlobalMetrics
      ? getGlobalMetrics()
      : { total: 0, active: 0, pending: 0, inactive: 0, closed: 0 };
  }, [getGlobalMetrics]);

  // Filters State
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState(initialPayment);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete/Archive Confirmation Modal
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Vendor Lookup Map
  const vendorMap = useMemo(() => {
    const map = new Map();
    (vendors || []).forEach((v) => {
      if (v && v.id) map.set(v.id, v);
    });
    return map;
  }, [vendors]);

  // Filter Outlets
  const filteredOutlets = useMemo(() => {
    let result = Array.isArray(outlets) ? [...outlets] : [];

    // Station filter
    if (stationFilter !== 'ALL') {
      result = result.filter(
        (o) =>
          o &&
          o.stationCode &&
          o.stationCode.toUpperCase() === stationFilter.toUpperCase()
      );
    }

    // Vendor filter
    if (vendorFilter !== 'ALL') {
      result = result.filter(
        (o) =>
          o &&
          o.vendorId &&
          o.vendorId.toUpperCase() === vendorFilter.toUpperCase()
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(
        (o) =>
          o &&
          (o.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Payment mode filter
    if (paymentFilter !== 'ALL') {
      if (paymentFilter === 'cod') {
        result = result.filter((o) => o?.paymentModes?.cod);
      } else if (paymentFilter === 'prepaid') {
        result = result.filter((o) => o?.paymentModes?.prepaid);
      } else if (paymentFilter === 'both') {
        result = result.filter(
          (o) => o?.paymentModes?.cod && o?.paymentModes?.prepaid
        );
      }
    }

    // Search query: outlet name, outlet ID, vendor name, vendor ID, station
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((o) => {
        if (!o) return false;
        const v = o.vendorId ? vendorMap.get(o.vendorId) : null;
        const vendorNameMatch =
          v && v.businessName && v.businessName.toLowerCase().includes(q);
        const vendorIdMatch =
          o.vendorId && o.vendorId.toLowerCase().includes(q);

        return Boolean(
          (o.name && o.name.toLowerCase().includes(q)) ||
          (o.id && o.id.toLowerCase().includes(q)) ||
          (o.category && o.category.toLowerCase().includes(q)) ||
          (o.stationCode && o.stationCode.toLowerCase().includes(q)) ||
          (o.stationName && o.stationName.toLowerCase().includes(q)) ||
          (o.contactPerson && o.contactPerson.toLowerCase().includes(q)) ||
          vendorNameMatch ||
          vendorIdMatch
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (!a || !b) return 0;
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';

      if (sortBy === 'newest') {
        valA = a.createdAt || '';
        valB = b.createdAt || '';
        return String(valB).localeCompare(String(valA));
      }

      if (sortBy === 'updatedAt') {
        valA = a.updatedAt || '';
        valB = b.updatedAt || '';
        return String(valB).localeCompare(String(valA));
      }

      if (typeof valA === 'string') {
        const compare = String(valA).localeCompare(String(valB));
        return sortOrder === 'asc' ? compare : -compare;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    outlets,
    stationFilter,
    vendorFilter,
    statusFilter,
    paymentFilter,
    search,
    sortBy,
    sortOrder,
    vendorMap,
  ]);

  // Pagination calculation
  const totalItems = filteredOutlets.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedOutlets = filteredOutlets.slice(startIndex, endIndex);

  // Handlers
  const handleExportCsv = () => {
    const filename = `olf-all-outlets-master-${new Date().toISOString().slice(0, 10)}.csv`;
    exportOutletsToCsv(filteredOutlets, filename, vendors);
  };

  const handleConfirmDelete = async () => {
    if (!outletToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOutlet(outletToDelete.id, false);
      setOutletToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setStationFilter('ALL');
    setVendorFilter('ALL');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
              <Store className="w-5 h-5 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              All Outlets Master Directory
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredOutlets.length} in view
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Network-wide master registry of all food-service outlets across railway stations and associated business vendors.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            leftIcon={Download}
            onClick={handleExportCsv}
            title="Export filtered records as CSV"
          >
            Export CSV
          </Button>

          <Link to="/outlets/BRC/new">
            <Button variant="primary" size="md" leftIcon={Plus}>
              Add Outlet
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <OutletSummaryCards
        metrics={metrics}
        activeStatusFilter={statusFilter}
        onStatusClick={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
      />

      {/* Search and Advanced Filters Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        {/* Top filter row: Search, Station, Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by outlet name, ID, vendor name, or station..."
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Railway Station Filter */}
          <div className="flex items-center gap-1.5">
            <Train className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={stationFilter}
              onChange={(e) => {
                setStationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Stations ({stations.length})</option>
              {stations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Vendors ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName} ({v.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second filter row: Status, Payment Mode, Sort, Page Size */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="prepaid">Prepaid Only</option>
                <option value="cod">COD Only</option>
                <option value="both">Both COD & Prepaid</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 cursor-pointer"
              >
                <option value="name">Sort by Outlet Name</option>
                <option value="stationName">Sort by Railway Station</option>
                <option value="newest">Sort by Newest Created</option>
                <option value="updatedAt">Sort by Last Updated</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                title={`Order: ${sortOrder}`}
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Reset Filters & Page Size */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {(search ||
              stationFilter !== 'ALL' ||
              vendorFilter !== 'ALL' ||
              statusFilter !== 'ALL' ||
              paymentFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={RotateCcw}
                onClick={resetAllFilters}
                className="text-xs py-1"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Outlets Master Data Table */}
      {totalItems === 0 ? (
        <EmptyState
          icon={Store}
          title="No outlets match search criteria"
          description="Try broadening or clearing your station, vendor, status, or keyword filters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Outlet ID</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Outlet Information</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Vendor (Business Entity)</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Railway Station</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Operating Hours</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Payment Modes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Last Updated</th>
                  <th className="py-3.5 px-4 text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedOutlets.map((outlet) => {
                  if (!outlet) return null;
                  const vendor = outlet.vendorId ? vendorMap.get(outlet.vendorId) : null;

                  return (
                    <tr
                      key={outlet.id}
                      className="hover:bg-emerald-50/40 transition-colors duration-150"
                    >
                      {/* Outlet ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-800 border border-slate-200">
                          {outlet.id}
                        </span>
                      </td>

                      {/* Outlet Info */}
                      <td className="py-3.5 px-4">
                        <div>
                          <Link
                            to={`/outlets/${outlet.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline transition-colors block"
                          >
                            {outlet.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">
                              {outlet.category || 'General'}
                            </span>
                            {outlet.contactPerson && (
                              <>
                                <span>•</span>
                                <span>{outlet.contactPerson}</span>
                              </>
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
                              title={`View vendor profile for ${vendor.businessName}`}
                            >
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
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

                      {/* Railway Station */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          to={`/outlets/station/${outlet.stationCode}`}
                          className="font-medium text-slate-800 hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                          title={`View all outlets at ${outlet.stationName}`}
                        >
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                            {outlet.stationCode}
                          </span>
                          <span>{outlet.stationName}</span>
                        </Link>
                      </td>

                      {/* Operating Hours */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {outlet.openingTime || '06:00'} - {outlet.closingTime || '23:00'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {outlet.prepTime || 20}m prep • Min: {formatCurrency(outlet.minOrderValue)}
                        </div>
                      </td>

                      {/* Payment Modes */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {outlet.paymentModes?.cod && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Banknote className="w-2.5 h-2.5" />
                              COD
                            </span>
                          )}
                          {outlet.paymentModes?.prepaid && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <CreditCard className="w-2.5 h-2.5" />
                              Prepaid
                            </span>
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
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/outlets/${outlet.id}`}>
                            <button
                              type="button"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              title="View Outlet Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          <Link to={`/outlets/${outlet.id}/edit`}>
                            <button
                              type="button"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Edit Outlet"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setOutletToDelete(outlet)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete or Archive Outlet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
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

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage(Math.min(currentPage + 1, totalPages))
                }
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

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
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(outletToDelete)}
        onClose={() => setOutletToDelete(null)}
        title="Confirm Outlet Deletion"
        description="Are you sure you want to mark this outlet as deleted/archived?"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOutletToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        {outletToDelete && (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed">
                <strong>Warning:</strong> Deleting{' '}
                <strong>
                  "{outletToDelete.name}" ({outletToDelete.id})
                </strong>{' '}
                will mark its status as <em>Deleted</em> and remove it from active passenger ordering.
              </div>
            </div>
            <p className="text-xs text-slate-500">
              The record will remain in historical archives but will cease dispatching meals to incoming trains.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
