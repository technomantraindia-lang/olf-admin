import React, { useState, useMemo } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import OverviewKpiGrid from '../components/dashboard/OverviewKpiGrid';
import WeeklyOrderAnalytics from '../components/dashboard/WeeklyOrderAnalytics';
import RevenueAnalyticsPanel from '../components/dashboard/RevenueAnalyticsPanel';
import OrdersBySourceChart from '../components/dashboard/OrdersBySourceChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import TopStations from '../components/dashboard/TopStations';
import { useOutlets } from '../context/OutletContext';
import {
  getDashboardPeriodData,
  getRecentOrders,
  getOutletHealthMetrics,
  getPlatformOverviewMetrics,
  getWeeklyOrderAnalytics,
} from '../utils/dashboardSelectors';

export default function Dashboard() {
  const { outlets = [] } = useOutlets();
  const [dateRange, setDateRange] = useState('7d');

  // Derive all data consistently from centralized dataset
  const periodData = useMemo(() => {
    return getDashboardPeriodData(dateRange);
  }, [dateRange]);

  const recentOrders = useMemo(() => {
    return getRecentOrders(5);
  }, []);

  const outletHealth = useMemo(() => {
    return getOutletHealthMetrics(outlets);
  }, [outlets]);

  const platformMetrics = useMemo(() => {
    return getPlatformOverviewMetrics(outlets);
  }, [outlets]);

  const weeklyOrders = useMemo(() => {
    return getWeeklyOrderAnalytics();
  }, []);

  // Functional CSV Export
  const handleExportCsv = () => {
    const filename = `olf-dashboard-summary-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;

    const csvRows = [
      ['OLF Stores - Dashboard Operational Overview'],
      ['Export Date', new Date().toLocaleString()],
      ['Selected Period', periodData.rangeLabel],
      [],
      ['PLATFORM OVERVIEW KPIS'],
      ["Today's Orders", platformMetrics.todayOrders],
      ['Total Orders (All Time)', platformMetrics.totalOrdersAllTime],
      ['Revenue', platformMetrics.revenue],
      ['Customers', platformMetrics.customers],
      ['Total Outlets', platformMetrics.totalOutlets],
      ['Active Outlets', platformMetrics.activeOutlets],
      ['Inactive Outlets', platformMetrics.inactiveOutlets],
      ['Scheduled Close Outlets', platformMetrics.scheduledClose],
      ['Deleted Outlets', platformMetrics.deletedOutlets],
      [],
      ['CHANNEL BREAKDOWN'],
      ['Orders from IRCTC e-Catering', periodData.irctcOrders, `${periodData.irctcShare}%`],
      ['Orders from OLF Website/App', periodData.olfOrders, `${periodData.olfShare}%`],
      ['Total Orders (Period)', periodData.totalOrders],
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
      {/* Header with Title, Description, Date Range, Export & Notification Bell */}
      <DashboardHeader
        selectedRange={dateRange}
        onRangeChange={setDateRange}
        onExportCsv={handleExportCsv}
      />

      {/* Row 1 — 12-Card Overview KPI Grid (Matching Reference Dashboard) */}
      <OverviewKpiGrid metrics={platformMetrics} />

      {/* Row 2 — Side-by-Side Analytics: Order Analytics & Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Analytics (Weekly performance overview) */}
        <WeeklyOrderAnalytics data={weeklyOrders} />

        {/* Revenue Analytics (Monthly revenue performance) */}
        <RevenueAnalyticsPanel />
      </div>

      {/* Row 3 — Railway Channel Breakdown & Top Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Source Donut Chart (IRCTC vs OLF Platform) */}
        <OrdersBySourceChart
          irctcOrders={periodData.irctcOrders}
          olfOrders={periodData.olfOrders}
          totalOrders={periodData.totalOrders}
          irctcShare={periodData.irctcShare}
          olfShare={periodData.olfShare}
          rangeLabel={periodData.rangeLabel}
        />

        {/* Top Stations Ranking */}
        <TopStations
          stations={periodData.topStations}
          rangeLabel={periodData.rangeLabel}
        />
      </div>

      {/* Row 4 — Operational Recent Orders Table */}
      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
}
