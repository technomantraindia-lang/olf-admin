import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  AlertTriangle,
  Building2,
  Trash2,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import VendorSummaryCards from '../../components/vendors/VendorSummaryCards';
import VendorTable from '../../components/vendors/VendorTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { exportVendorsToCsv } from '../../utils/exportCsv';

export default function VendorManagement() {
  const {
    vendors = [],
    outlets = [],
    getVendorMetrics,
    archiveVendor,
    deleteVendor,
    getOutletsByVendor,
    getStationsByVendor,
  } = useOutlets();

  // Metrics
  const metrics = useMemo(() => {
    return getVendorMetrics ? getVendorMetrics() : { total: 0, active: 0, pending: 0, inactive: 0, totalOutlets: 0 };
  }, [getVendorMetrics]);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('businessName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Archive Modal State
  const [vendorToArchive, setVendorToArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Delete Modal State
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered and Sorted Vendors
  const filteredVendors = useMemo(() => {
    let result = Array.isArray(vendors) ? [...vendors] : [];

    // Search query (name, id, contact person, phone, city)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v && (
            (v.businessName && v.businessName.toLowerCase().includes(q)) ||
            (v.brandName && v.brandName.toLowerCase().includes(q)) ||
            (v.legalName && v.legalName.toLowerCase().includes(q)) ||
            (v.panNumber && v.panNumber.toLowerCase().includes(q)) ||
            (v.gstin && v.gstin.toLowerCase().includes(q)) ||
            (v.id && String(v.id).toLowerCase().includes(q)) ||
            (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
            (v.phone && String(v.phone).includes(q)) ||
            (v.city && v.city.toLowerCase().includes(q))
          )
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(
        (v) => v && (v.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a ? a[sortBy] : '';
      let valB = b ? b[sortBy] : '';

      if (typeof valA === 'string') {
        const compare = (valA || '').localeCompare(valB || '');
        return sortOrder === 'asc' ? compare : -compare;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vendors, search, statusFilter, sortBy, sortOrder]);

  const handleExportCsv = () => {
    const filename = `olf-vendors-master-${new Date().toISOString().slice(0, 10)}.csv`;
    exportVendorsToCsv(filteredVendors, filename, outlets);
  };

  const handleConfirmArchive = async () => {
    if (!vendorToArchive) return;
    setIsArchiving(true);
    try {
      await archiveVendor(vendorToArchive.id, false);
      setVendorToArchive(null);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVendor(vendorToDelete.id, true);
      setVendorToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSortBy('businessName');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Associated outlets of vendor pending archive/delete
  const associatedOutletsCount = vendorToArchive && getOutletsByVendor
    ? getOutletsByVendor(vendorToArchive.id).length
    : 0;

  const deleteOutletsCount = vendorToDelete && getOutletsByVendor
    ? getOutletsByVendor(vendorToDelete.id).length
    : 0;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Vendor Management
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredVendors.length} registered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage vendor profiles, linked station outlets, and compliance status.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            leftIcon={Download}
            onClick={handleExportCsv}
            title="Export filtered vendors as CSV"
          >
            Export Vendors
          </Button>

          <Link to="/outlets/vendors/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <VendorSummaryCards
        metrics={metrics}
        activeStatusFilter={statusFilter}
        onStatusClick={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
      />

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by vendor name, vendor ID, contact person, city..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Vendor Statuses</option>
              <option value="Active">Active Vendors</option>
              <option value="Blocked">Blocked Vendors</option>
              <option value="Pending">Pending Review</option>
              <option value="Inactive">Inactive Vendors</option>
              <option value="Archived">Archived Vendors</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 cursor-pointer"
            >
              <option value="businessName">Sort by Name</option>
              <option value="registrationDate">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition"
              title={`Sorting: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>

          {/* Reset Filters */}
          {(search || statusFilter !== 'ALL' || sortBy !== 'businessName') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={resetAllFilters}
              className="shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Vendor Table */}
      <VendorTable
        vendors={filteredVendors}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        getOutletsByVendor={getOutletsByVendor}
        getStationsByVendor={getStationsByVendor}
        onArchiveRequest={(vendor) => setVendorToArchive(vendor)}
        onDeleteRequest={(vendor) => setVendorToDelete(vendor)}
      />

      {/* Archive Safeguard Confirmation Modal */}
      <Modal
        isOpen={Boolean(vendorToArchive)}
        onClose={() => setVendorToArchive(null)}
        title="Archive Vendor Business Entity"
        description="Review associated platform outlets before archiving this vendor."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVendorToArchive(null)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmArchive}
              loading={isArchiving}
            >
              Confirm Archive
            </Button>
          </>
        }
      >
        {vendorToArchive && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Business Rule Guard:</strong> You are about to archive{' '}
                <strong>"{vendorToArchive.brandName || vendorToArchive.businessName}" ({vendorToArchive.id})</strong>.
                {associatedOutletsCount > 0 ? (
                  <p className="mt-1">
                    This vendor currently operates{' '}
                    <strong className="text-amber-950 font-bold">
                      {associatedOutletsCount} outlet(s)
                    </strong>{' '}
                    across railway stations. Archiving the vendor preserves its records for
                    historical compliance and prevents orphan outlet records.
                  </p>
                ) : (
                  <p className="mt-1">
                    This vendor currently has no active outlets assigned.
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              The vendor status will be updated to <em>Archived</em>. Associated outlets can remain
              viewable under vendor history or be reassigned to another licensed entity.
            </p>
          </div>
        )}
      </Modal>

      {/* Delete Vendor Permanently Modal */}
      <Modal
        isOpen={Boolean(vendorToDelete)}
        onClose={() => setVendorToDelete(null)}
        title="Delete Vendor"
        description="Permanently remove this vendor partner and its platform record."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVendorToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={Trash2}
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Permanently Delete Vendor
            </Button>
          </>
        }
      >
        {vendorToDelete && (
          <div className="space-y-3">
            <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed">
                <strong>Permanent Deletion:</strong> You are about to permanently delete{' '}
                <strong>"{vendorToDelete.brandName || vendorToDelete.businessName}" (Vendor #{vendorToDelete.id})</strong>.
                {deleteOutletsCount > 0 ? (
                  <p className="mt-1.5 font-bold text-rose-950">
                    ⚠️ Warning: This vendor is currently assigned to {deleteOutletsCount} physical station kitchen(s).
                    Deleting will completely remove the vendor from the system.
                  </p>
                ) : (
                  <p className="mt-1 text-slate-600">
                    This vendor currently has no linked station kitchens.
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action cannot be undone. All statutory compliance documents, bank payout records, and commercial credentials for this vendor will be erased.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
