import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function RecentOrdersTable({ orders = [] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Orders
            </h3>
            <p className="text-xs text-slate-500">
              Latest passenger orders across railway stations
            </p>
          </div>
        </div>

        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-3">Source</th>
              <th className="py-3 px-3">Railway Station</th>
              <th className="py-3 px-4 min-w-[170px]">Outlet Name</th>
              <th className="py-3 px-3 text-right">Order Amount*</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No recent orders available.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isIrctc = order.source === 'IRCTC e-Catering';

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {order.id}
                      </span>
                    </td>

                    {/* Source Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          isIrctc
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {order.source}
                      </span>
                    </td>

                    {/* Railway Station */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 px-1 py-0.2 rounded bg-slate-100 border border-slate-200 text-[10px]">
                          {order.stationCode}
                        </span>
                        <span className="truncate max-w-[130px]">
                          {order.stationName}
                        </span>
                      </div>
                    </td>

                    {/* Outlet Name */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/outlets/${order.outletId}`}
                        className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline truncate block max-w-[180px]"
                      >
                        {order.outletName}
                      </Link>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                      {formatCurrency(order.amount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-500 text-[11px]">
                      {formatDate(order.createdAt, true)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>*Amount reflects gross customer order value</span>
        <span className="text-slate-500 font-medium">
          Showing 5 latest dispatches
        </span>
      </div>
    </div>
  );
}
