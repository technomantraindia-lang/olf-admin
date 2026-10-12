import {
  mockOrders,
  periodSummaries,
  platformOverview,
  weeklyOrderAnalytics,
  monthlyRevenueAnalytics,
} from '../data/mockOrders';
import { initialMockOutlets } from '../data/mockOutlets';

/**
 * Returns KPI metrics, source distribution, trends, and top stations for a given date range.
 * Supports: 'today', '7d', '30d', 'all'
 */
export function getDashboardPeriodData(dateRange = '7d') {
  const summary = periodSummaries[dateRange] || periodSummaries['7d'];

  const totalOrders = summary.totalOrders || 0;
  const irctcOrders = summary.irctcOrders || 0;
  const olfOrders = summary.olfOrders || 0;

  // Exact calculation rules (Section 6.4)
  const irctcShare = totalOrders > 0 ? Number(((irctcOrders / totalOrders) * 100).toFixed(1)) : 0;
  const olfShare = totalOrders > 0 ? Number(((olfOrders / totalOrders) * 100).toFixed(1)) : 0;

  return {
    dateRange,
    rangeLabel: summary.label,
    totalOrders,
    irctcOrders,
    irctcShare,
    olfOrders,
    olfShare,
    revenue: summary.revenue,
    prevTotalOrders: summary.prevTotalOrders,
    prevRevenue: summary.prevRevenue,
    growthRate: summary.growthRate,
    revenueGrowth: summary.revenueGrowth,
    trendDays: summary.trendDays || [],
    topStations: summary.topStations || [],
  };
}

/**
 * Returns the latest recent orders for the operational panel (Section 10).
 */
export function getRecentOrders(limit = 5) {
  return mockOrders.slice(0, limit);
}

/**
 * Returns outlet-health counts (Section 7).
 * Directly derives from actual outlet records.
 */
export function getOutletHealthMetrics(outlets = initialMockOutlets) {
  const list = Array.isArray(outlets) ? outlets : initialMockOutlets;

  const total = list.length;
  const active = list.filter((o) => (o?.status || '').toLowerCase() === 'active').length;
  const pending = list.filter((o) => (o?.status || '').toLowerCase() === 'pending').length;
  const inactive = list.filter((o) => (o?.status || '').toLowerCase() === 'inactive').length;
  const closed = list.filter((o) => (o?.status || '').toLowerCase() === 'closed').length;

  return {
    total,
    active,
    pending,
    inactive,
    closed,
  };
}

/**
 * Returns platform overview 12-metric card values (matching reference dashboard)
 */
export function getPlatformOverviewMetrics(liveOutlets = []) {
  const liveCount = Array.isArray(liveOutlets) ? liveOutlets.length : 0;
  const initialCount = 8;
  const addedOutlets = Math.max(0, liveCount - initialCount);

  return {
    todayOrders: platformOverview.todayOrders,
    totalOrdersAllTime: platformOverview.totalOrdersAllTime,
    revenue: platformOverview.revenue,
    customers: platformOverview.customers,
    totalOutlets: platformOverview.totalOutlets + addedOutlets,
    activeOutlets: platformOverview.activeOutlets + addedOutlets,
    inactiveOutlets: platformOverview.inactiveOutlets,
    scheduledClose: platformOverview.scheduledClose,
    deletedOutlets: platformOverview.deletedOutlets,
    mostComplaints: platformOverview.mostComplaints,
    mostOrderedFrom: platformOverview.mostOrderedFrom,
    topRatedRestaurant: platformOverview.topRatedRestaurant,
  };
}

/**
 * Returns weekly order analytics breakdown
 */
export function getWeeklyOrderAnalytics() {
  return weeklyOrderAnalytics;
}

/**
 * Returns monthly revenue analytics breakdown
 */
export function getMonthlyRevenueAnalytics(rangeKey = 'Oct - Dec 2026') {
  return monthlyRevenueAnalytics[rangeKey] || monthlyRevenueAnalytics['Oct - Dec 2026'];
}

