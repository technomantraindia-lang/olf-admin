import React, { useState } from 'react';
import { Download, LayoutDashboard, Bell, CheckCircle2, AlertTriangle, Store } from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';
import Button from '../ui/Button';

export default function DashboardHeader({
  selectedRange,
  onRangeChange,
  onExportCsv,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Havmor Express Kitchen', desc: 'Requested wallet withdrawal of ₹14,500', time: '10m ago', type: 'wallet' },
    { id: 2, title: 'New IRCTC Order #9501', desc: 'Vadodara Junction (BRC) Coach B3-42', time: '24m ago', type: 'order' },
    { id: 3, title: 'Pending Outlet Approval', desc: 'Kalyan Junction Cloud Kitchen KYC submitted', time: '1h ago', type: 'outlet' },
    { id: 4, title: 'Passenger Escalation', desc: 'Delayed meal delivery reported on Train 12952', time: '2h ago', type: 'alert' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <DateRangeSelector
          selectedRange={selectedRange}
          onRangeChange={onRangeChange}
        />

        {onExportCsv && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={Download}
            onClick={onExportCsv}
            title="Export dashboard summary as CSV"
          >
            Export Summary
          </Button>
        )}

        {/* Notification Bell matching screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="16 unread notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
              16
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 select-none">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications (16)</span>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 bg-slate-50 hover:bg-slate-100/80 rounded-lg text-xs transition-colors cursor-pointer">
                    <div className="font-semibold text-slate-800">{n.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{n.desc}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
