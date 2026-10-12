// Dashboard Service Abstraction
// Prepares frontend for future Node.js + Express.js backend and PostgreSQL connection
// (Section 17 & 21 of OLF_Admin_Dashboard_Specification.md)

import {
  getDashboardPeriodData,
  getRecentOrders,
  getOutletHealthMetrics,
} from '../utils/dashboardSelectors';

export const dashboardService = {
  /**
   * Fetches dashboard data for the selected date range.
   * Future: `await fetch('/api/dashboard?range=' + range).then(r => r.json())`
   */
  async getDashboardOverview(dateRange = '7d', outletsList = []) {
    // Simulated async micro-task to match future REST API behavior
    const periodData = getDashboardPeriodData(dateRange);
    const recentOrders = getRecentOrders(5);
    const outletHealth = getOutletHealthMetrics(outletsList);

    return {
      periodData,
      recentOrders,
      outletHealth,
    };
  },
};
