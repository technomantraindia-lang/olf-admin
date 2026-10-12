// Selectors and calculation helpers for OLF Stores Dashboard
// Implements calculation rules defined in OLF_Admin_Dashboard_Specification.md (Section 6, 7, 8, 9, 10, 11)

import { mockOrders, periodSummaries, mockCustomerRatingMetrics } from '../data/mockOrders';
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
 * Returns customer rating performance data (Section 13).
 */
export function getCustomerRatingMetrics() {
  return mockCustomerRatingMetrics;
}
