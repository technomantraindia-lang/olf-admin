import React, { useState, useMemo } from 'react';
import { ShoppingBag, TrendingUp, IndianRupee, Layers } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MetricCard from '../components/dashboard/MetricCard';
import OutletHealthMetrics from '../components/dashboard/OutletHealthMetrics';
import OrdersBySourceChart from '../components/dashboard/OrdersBySourceChart';
import OrderTrendChart from '../components/dashboard/OrderTrendChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import TopStations from '../components/dashboard/TopStations';
import CustomerRatingMetrics from '../components/dashboard/CustomerRatingMetrics';
import { useOutlets } from '../context/OutletContext';
import {
  getDashboardPeriodData,
  getRecentOrders,
  getOutletHealthMetrics,
  getCustomerRatingMetrics,
} from '../utils/dashboardSelectors';
import { formatCurrency } from '../utils/formatCurrency';

export default function Dashboard() {
  const { outlets = [] } = useOutlets();
  const [dateRange, setDateRange] = useState('7d');

  // Derive all data consistently from centralized dataset (Section 6, 8, 9, 10, 11)
  const periodData = useMemo(() => {
    return getDashboardPeriodData(dateRange);
  }, [dateRange]);

  const recentOrders = useMemo(() => {
    return getRecentOrders(5);
  }, []);

  const outletHealth = useMemo(() => {
    return getOutletHealthMetrics(outlets);
  }, [outlets]);

  const ratingMetrics = useMemo(() => {
    return getCustomerRatingMetrics();
  }, []);

  // Functional CSV Export (Section 19: "If included, export visible dataset to CSV")
  const handleExportCsv = () => {
    const filename = `olf-dashboard-summary-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;

    const csvRows = [
      ['OLF Stores - Dashboard Operational Overview'],
      ['Export Date', new Date().toLocaleString()],
      ['Selected Period', periodData.rangeLabel],
      [],
      ['PRIMARY KPIS'],
      ['Total Orders', periodData.totalOrders],
      ['Orders from IRCTC e-Catering', periodData.irctcOrders, `${periodData.irctcShare}%`],
      ['Orders from OLF Website/App', periodData.olfOrders, `${periodData.olfShare}%`],
      ['Revenue (Order Value)', periodData.revenue],
      [],
      ['OUTLET HEALTH (CURRENT STATE)'],
      ['Total Outlets', outletHealth.total],
      ['Active Outlets', outletHealth.active],
      ['Pending Outlets', outletHealth.pending],
      ['Inactive Outlets', outletHealth.inactive],
      ['Closed Outlets', outletHealth.closed],
      [],
      ['TOP STATIONS BY ORDERS'],
      ['Rank', 'Station Code', 'Station Name', 'Order Count', 'Share %'],
      ...periodData.topStations.map((s, idx) => [
        idx + 1,
        s.code,
        `"${s.name}"`,
        s.orders,
        `${s.share}%`,
      ]),
      [],
      ['RECENT ORDERS (LATEST 5)'],
      ['Order ID', 'Source', 'Station', 'Outlet', 'Amount (INR)', 'Status', 'Timestamp'],
      ...recentOrders.map((o) => [
        o.id,
        `"${o.source}"`,
        o.stationCode,
        `"${o.outletName}"`,
        o.amount,
        o.status,
        o.createdAt,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header with Title, Description, Date Range & Export */}
      <DashboardHeader
        selectedRange={dateRange}
        onRangeChange={setDateRange}
        onExportCsv={handleExportCsv}
      />

      {/* Row 1 — Four Primary KPI Cards (Section 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Orders */}
        <MetricCard
          title="Total Orders"
          value={periodData.totalOrders.toLocaleString()}
          icon={ShoppingBag}
          badgeText={periodData.rangeLabel}
          growthRate={periodData.growthRate}
          growthLabel="vs prev period"
          accentColor="slate"
        />

        {/* 2. Orders from IRCTC */}
        <MetricCard
          title="Orders from IRCTC"
          value={periodData.irctcOrders.toLocaleString()}
          icon={Layers}
          badgeText={`${periodData.irctcShare}% share`}
          badgeColor="blue"
          subtext="IRCTC e-Catering"
          accentColor="blue"
        />

        {/* 3. Orders from OLF */}
        <MetricCard
          title="Orders from OLF"
          value={periodData.olfOrders.toLocaleString()}
          icon={TrendingUp}
          badgeText={`${periodData.olfShare}% share`}
          badgeColor="orange"
          subtext="OLF Website/App"
          accentColor="orange"
        />

        {/* 4. Revenue */}
        <MetricCard
          title="Revenue (Order Value)"
          value={formatCurrency(periodData.revenue)}
          icon={IndianRupee}
          badgeText={periodData.rangeLabel}
          badgeColor="emerald"
          growthRate={periodData.revenueGrowth}
          growthLabel="vs prev period"
          accentColor="emerald"
          disclaimer="*Illustrative mock financial metric"
        />
      </div>

      {/* Row 2 — Compact Outlet-Health Metrics (Section 7) */}
      <OutletHealthMetrics metrics={outletHealth} />

      {/* Row 3 — Two Analytics Panels (Section 8 & 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Panel A: Orders by Source Donut Chart */}
        <OrdersBySourceChart
          irctcOrders={periodData.irctcOrders}
          olfOrders={periodData.olfOrders}
          totalOrders={periodData.totalOrders}
          irctcShare={periodData.irctcShare}
          olfShare={periodData.olfShare}
          rangeLabel={periodData.rangeLabel}
        />

        {/* Analytics Panel B: Order Trend Line Chart */}
        <OrderTrendChart
          trendData={periodData.trendDays}
          rangeLabel={periodData.rangeLabel}
        />
      </div>

      {/* Row 4 — Operational Panels (Section 10 & 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Cols on Desktop) */}
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>

        {/* Top Stations Ranking (1 Col on Desktop) */}
        <div className="lg:col-span-1">
          <TopStations
            stations={periodData.topStations}
            rangeLabel={periodData.rangeLabel}
          />
        </div>
      </div>

      {/* Row 5 — Customer Rating Metrics (Section 13) */}
      <CustomerRatingMetrics ratingData={ratingMetrics} />
    </div>
  );
}
