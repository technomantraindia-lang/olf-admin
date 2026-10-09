import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Train,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import OutletSummaryCards from '../../components/outlets/OutletSummaryCards';
import StationCard from '../../components/outlets/StationCard';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

export default function OutletsOverview() {
  const navigate = useNavigate();
  const { stations, getStationMetrics, getGlobalMetrics, resetToDefaults } = useOutlets();
  const [stationSearch, setStationSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');

  // Compute global summary counts
  const globalMetrics = useMemo(() => {
    return getGlobalMetrics();
  }, [getGlobalMetrics]);

  // Extract unique states for filter
  const uniqueStates = useMemo(() => {
    const states = stations.map((s) => s.state);
    return ['ALL', ...Array.from(new Set(states))];
  }, [stations]);

  // Filter stations based on search and state
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const q = stationSearch.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        station.name.toLowerCase().includes(q) ||
        station.code.toLowerCase().includes(q) ||
        station.state.toLowerCase().includes(q) ||
        (station.division && station.division.toLowerCase().includes(q));

      const matchesState =
        stateFilter === 'ALL' || station.state.toLowerCase() === stateFilter.toLowerCase();

      return matchesSearch && matchesState;
    });
  }, [stations, stationSearch, stateFilter]);

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Outlets Management
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Station-First View
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage restaurant outlets across railway stations and monitor their associated vendors.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            leftIcon={RotateCcw}
            onClick={resetToDefaults}
            title="Reset to default mock data"
          >
            Reset Data
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/outlets/all')}
          >
            View All Outlets
          </Button>

          <Button
            variant="secondary"
            size="md"
            leftIcon={Plus}
            onClick={() => navigate('/outlets/vendors/new')}
            className="text-emerald-800 border-emerald-200 hover:bg-emerald-50"
          >
            Add Vendor
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={Plus}
            onClick={() => navigate('/outlets/BRC/new')}
          >
            Add Outlet
          </Button>
        </div>
      </div>

      {/* Global Outlets Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            Network Operational Summary
          </h2>
          <span className="text-xs text-slate-500">
            Across {stations.length} Indian Railway Junctions
          </span>
        </div>

        <OutletSummaryCards
          metrics={globalMetrics}
          activeStatusFilter="ALL"
          onStatusClick={(statusId) => {
            if (statusId === 'ALL') {
              navigate('/outlets/all');
            } else {
              navigate(`/outlets/filter/${statusId.toLowerCase()}`);
            }
          }}
        />
      </div>

      {/* Railway Stations Grid Section */}
      <div className="space-y-4">
        {/* Section title & Station Search/Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Train className="w-4 h-4 text-emerald-600" />
              Railway Station Hubs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any station to inspect its vendor outlets, menus, and wallet health
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Station Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                placeholder="Search station or code (e.g. BRC)..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all w-52 sm:w-64"
              />
            </div>

            {/* State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="ALL">All States</option>
              {uniqueStates
                .filter((st) => st !== 'ALL')
                .map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Stations Grid - Spacious responsive layout */}
        {filteredStations.length === 0 ? (
          <EmptyState
            icon={Train}
            title="No railway stations found"
            description={`No railway station matches "${stationSearch}". Try clearing the search query or state filter.`}
            actionLabel="Reset Search"
            onAction={() => {
              setStationSearch('');
              setStateFilter('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
            {filteredStations.map((station) => {
              const metrics = getStationMetrics(station.code);
              return (
                <StationCard
                  key={station.code}
                  station={station}
                  metrics={metrics}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
