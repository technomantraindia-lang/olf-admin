import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Download,
  Send,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import OutletSummaryCards from '../../components/outlets/OutletSummaryCards';
import OutletFilters from '../../components/outlets/OutletFilters';
import OutletTable from '../../components/outlets/OutletTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import NotFound from '../NotFound';
import { exportOutletsToCsv } from '../../utils/exportCsv';

export default function StationOutlets() {
  const { stationCode, filterType } = useParams();
  const location = useLocation();

  const isAllStations = location.pathname === '/outlets/all' || !stationCode;
  const isFilterShortcut = location.pathname.startsWith('/outlets/filter/');

  const {
    outlets,
    getStation,
    getStationMetrics,
    getGlobalMetrics,
    deleteOutlet,
    openPushNotice,
  } = useOutlets();

  // Validate station
  const currentStation = useMemo(() => {
    if (isAllStations || isFilterShortcut) return null;
    return getStation(stationCode);
  }, [stationCode, isAllStations, isFilterShortcut, getStation]);

  // Initial filter determination based on filterType param
  const initialStatusFilter = useMemo(() => {
    if (!filterType) return 'ALL';
    const lower = filterType.toLowerCase();
    if (['active', 'pending', 'inactive', 'closed', 'deleted'].includes(lower)) {
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return 'ALL';
  }, [filterType]);

  const initialPaymentFilter = useMemo(() => {
    if (!filterType) return 'ALL';
    return filterType.toLowerCase() === 'prepaid' ? 'prepaid' : 'ALL';
  }, [filterType]);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [paymentFilter, setPaymentFilter] = useState(initialPaymentFilter);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Confirmation Modal State
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Outlets
  const filteredOutlets = useMemo(() => {
    let result = Array.isArray(outlets) ? [...outlets] : [];

    // Filter by station (if viewing specific station)
    if (!isAllStations && !isFilterShortcut && currentStation) {
      result = result.filter(
        (o) =>
          o &&
          o.stationCode &&
          o.stationCode.toUpperCase() === currentStation.code.toUpperCase()
      );
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o && (
            (o.name && o.name.toLowerCase().includes(q)) ||
            (o.id && o.id.toLowerCase().includes(q)) ||
            (o.category && o.category.toLowerCase().includes(q)) ||
            (o.stationCode && o.stationCode.toLowerCase().includes(q)) ||
            (o.stationName && o.stationName.toLowerCase().includes(q))
          )
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(
        (o) => o && (o.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Payment mode filter
    if (paymentFilter !== 'ALL') {
      if (paymentFilter === 'cod') {
        result = result.filter((o) => o?.paymentModes?.cod);
      } else if (paymentFilter === 'prepaid') {
        result = result.filter((o) => o?.paymentModes?.prepaid);
      } else if (paymentFilter === 'both') {
        result = result.filter((o) => o?.paymentModes?.cod && o?.paymentModes?.prepaid);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (!a || !b) return 0;
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'wallet') {
        valA = a.wallet?.balance ?? 0;
        valB = b.wallet?.balance ?? 0;
      }

      if (typeof valA === 'string') {
        const compare = String(valA || '').localeCompare(String(valB || ''));
        return sortOrder === 'asc' ? compare : -compare;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    outlets,
    isAllStations,
    isFilterShortcut,
    currentStation,
    search,
    statusFilter,
    paymentFilter,
    sortBy,
    sortOrder,
  ]);

  // Calculate Metrics for summary cards
  const metrics = useMemo(() => {
    return isAllStations || isFilterShortcut
      ? getGlobalMetrics()
      : getStationMetrics(stationCode);
  }, [isAllStations, isFilterShortcut, getGlobalMetrics, getStationMetrics, stationCode]);

  // If specific station code given but station doesn't exist:
  if (!isAllStations && !isFilterShortcut && !currentStation) {
    return (
      <NotFound
        message={`Station with code "${stationCode}" was not found in the OLF railway network.`}
      />
    );
  }

  // Handlers
  const handleExportCsv = () => {
    const filename = currentStation
      ? `olf-outlets-${currentStation.code}-${new Date().toISOString().slice(0, 10)}.csv`
      : `olf-all-outlets-${new Date().toISOString().slice(0, 10)}.csv`;
    exportOutletsToCsv(filteredOutlets, filename);
  };

  const handlePushToIrctc = () => {
    openPushNotice(currentStation);
  };

  const handleConfirmDelete = async () => {
    if (!outletToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOutlet(outletToDelete.id, false); // Soft-delete
      setOutletToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const newOutletUrl = currentStation
    ? `/outlets/${currentStation.code}/new`
    : '/outlets/BRC/new';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/outlets"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Stations</span>
        </Link>
      </div>

      {/* Station Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            {currentStation ? (
              <>
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 text-white tracking-wider">
                  {currentStation.code}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {currentStation.name} Outlets
                </h1>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isFilterShortcut
                  ? `${statusFilter !== 'ALL' ? statusFilter : 'Filtered'} Outlets (All Stations)`
                  : 'All Railway Outlets'}
              </h1>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredOutlets.length} active in view
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            {currentStation ? (
              <>
                <span>{currentStation.fullName}</span>
                <span>•</span>
                <span>{currentStation.zone}</span>
                <span>•</span>
                <span>{currentStation.state}</span>
              </>
            ) : (
              <span>Network-wide view across all managed railway hubs</span>
            )}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Push All to IRCTC */}
          <Button
            variant="secondary"
            size="md"
            leftIcon={Send}
            onClick={handlePushToIrctc}
            className="text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            title="Push station catalog to IRCTC e-catering"
          >
            Push All to IRCTC
          </Button>

          {/* Export Outlets */}
          <Button
            variant="secondary"
            size="md"
            leftIcon={Download}
            onClick={handleExportCsv}
            title="Export filtered records as CSV"
          >
            Export Outlets
          </Button>

          {/* Add New Outlet */}
          <Link to={newOutletUrl}>
            <Button variant="primary" size="md" leftIcon={Plus}>
              Add New Outlet
            </Button>
          </Link>
        </div>
      </div>

      {/* Outlet Summary Cards */}
      <OutletSummaryCards
        metrics={metrics}
        activeStatusFilter={statusFilter}
        onStatusClick={(statusId) => {
          setStatusFilter(statusId);
          setCurrentPage(1);
        }}
      />

      {/* Filter and Search Controls */}
      <OutletFilters
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        paymentFilter={paymentFilter}
        setPaymentFilter={(val) => {
          setPaymentFilter(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        pageSize={pageSize}
        setPageSize={(val) => {
          setPageSize(val);
          setCurrentPage(1);
        }}
        onResetFilters={resetAllFilters}
        totalResults={filteredOutlets.length}
      />

      {/* Outlet Data Table */}
      <OutletTable
        outlets={filteredOutlets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        onDeleteRequest={(outlet) => setOutletToDelete(outlet)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(outletToDelete)}
        onClose={() => setOutletToDelete(null)}
        title="Confirm Outlet Deletion"
        description="Are you sure you want to mark this outlet as deleted?"
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
                <strong>"{outletToDelete.name}" ({outletToDelete.id})</strong> will change
                its status to <em>Deleted</em> and remove it from active passenger ordering.
              </div>
            </div>
            <p className="text-xs text-slate-500">
              The record will be preserved in the archive for auditing, but will no longer
              dispatch meals to incoming trains.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
