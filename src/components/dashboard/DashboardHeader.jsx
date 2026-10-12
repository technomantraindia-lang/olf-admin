import React from 'react';
import { Download, LayoutDashboard } from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';
import Button from '../ui/Button';

export default function DashboardHeader({
  selectedRange,
  onRangeChange,
  onExportCsv,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <LayoutDashboard className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of orders, outlets and business performance
          </p>
        </div>
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
      </div>
    </div>
  );
}
