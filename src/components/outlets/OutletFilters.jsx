import React from 'react';
import { Search, X, ArrowUpDown, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

export default function OutletFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  pageSize,
  setPageSize,
  onResetFilters,
  totalResults,
}) {
  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'ALL' ||
    paymentFilter !== 'ALL' ||
    sortBy !== 'name' ||
    sortOrder !== 'asc';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-3.5 mb-6">
      {/* Top Filter Row: Search & Status / Payment selects */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by outlet name, ID, category, or station..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
            <option value="Deleted">Deleted</option>
          </select>
        </div>

        {/* Payment Mode Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Payment:
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value="ALL">All Modes</option>
            <option value="cod">COD Supported</option>
            <option value="prepaid">Prepaid Only</option>
            <option value="both">Both (COD & Prepaid)</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Sorting, Page Size & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Left: Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort By:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="name">Outlet Name</option>
            <option value="id">Outlet ID</option>
            <option value="wallet">Wallet Balance</option>
            <option value="prepTime">Preparation Time</option>
            <option value="minOrder">Min Order Value</option>
            <option value="updatedAt">Last Updated</option>
            <option value="status">Status</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
            title="Toggle sort direction"
          >
            {sortOrder === 'asc' ? 'Ascending (A-Z, Low-High)' : 'Descending (Z-A, High-Low)'}
          </button>
        </div>

        {/* Right: Results Count, Page Size & Clear */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-slate-500">
            Found <strong className="text-slate-800">{totalResults}</strong> outlets
          </span>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-500">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={RotateCcw}
              onClick={onResetFilters}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs px-2 py-1"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
