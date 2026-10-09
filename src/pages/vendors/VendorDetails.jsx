import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Edit2,
  Plus,
  Store,
  Train,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  FileText,
  History,
  CheckCircle2,
  Clock,
  Eye,
  CreditCard,
  Banknote,
  Search,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Activity,
  Award,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import NotFound from '../NotFound';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

// Mock passenger complaints received specifically across this vendor's outlets
const mockVendorComplaints = [
  {
    id: 'CMP-8421',
    outletId: 'OUT-BRC-01',
    outletName: 'Havmor Express Kitchen',
    stationCode: 'BRC',
    stationName: 'Vadodara Junction',
    pnr: '8421903412',
    trainNumber: '12952',
    trainName: 'Mumbai Central Tejas Rajdhani Express',
    passengerName: 'Rohit Sharma (Coach B4 / Seat 31)',
    category: 'Packaging & Hygiene',
    issue: 'Meal box foil seal was loose upon platform 2 coach berth delivery.',
    severity: 'Medium',
    status: 'Resolved',
    receivedDate: '2026-03-28T14:15:00Z',
    resolutionTime: '2.5 hrs',
    resolutionNote: 'Replacement dessert voucher credited, foil sealing machine recalibrated at BRC base kitchen.',
  },
  {
    id: 'CMP-7914',
    outletId: 'OUT-ADI-02',
    outletName: 'Gwalia Sweets & Restaurant',
    stationCode: 'ADI',
    stationName: 'Ahmedabad Junction',
    pnr: '6721094582',
    trainNumber: '12009',
    trainName: 'Mumbai Central - Ahmedabad Shatabdi Express',
    passengerName: 'Ananya Deshmukh (Coach C2 / Seat 14)',
    category: 'Delivery Delay',
    issue: 'Meal reached passenger berth only 2 minutes before scheduled train departure whistle.',
    severity: 'High',
    status: 'Resolved',
    receivedDate: '2026-03-15T09:40:00Z',
    resolutionTime: '1.8 hrs',
    resolutionNote: 'Platform delivery route optimized; runner dispatch lead time increased from 15m to 20m before halt.',
  },
  {
    id: 'CMP-9102',
    outletId: 'OUT-ABR-01',
    outletName: 'Mount Abu Cloud Bites',
    stationCode: 'ABR',
    stationName: 'Abu Road Railway Station',
    pnr: '9182347102',
    trainNumber: '12958',
    trainName: 'Swarna Jayanti Rajdhani Express',
    passengerName: 'Karan Mehra (Coach A1 / Seat 19)',
    category: 'Food Temperature',
    issue: 'Dal and rice served lukewarm instead of prescribed thermal food safety standard.',
    severity: 'Medium',
    status: 'In Review',
    receivedDate: '2026-04-02T19:30:00Z',
    resolutionTime: 'Pending',
    resolutionNote: 'Outlet manager notified to verify thermal holding bag insulation before station runner dispatch.',
  },
  {
    id: 'CMP-6504',
    outletId: 'OUT-ST-01',
    outletName: 'Surti Zaika Kitchen',
    stationCode: 'ST',
    stationName: 'Surat Railway Station',
    pnr: '4591023847',
    trainNumber: '22954',
    trainName: 'Gujarat Superfast Express',
    passengerName: 'Pooja Varma (Coach D3 / Seat 45)',
    category: 'Missing Item',
    issue: 'Roasted papad and curd cup were missing from the Deluxe Thali combo meal bag.',
    severity: 'Low',
    status: 'Resolved',
    receivedDate: '2026-02-20T12:10:00Z',
    resolutionTime: '45 mins',
    resolutionNote: '₹60 partial refund credited instantly to passenger UPI; packing verification checklist enforced.',
  },
  {
    id: 'CMP-5120',
    outletId: 'OUT-MMCT-01',
    outletName: 'Bombay Dabbawala Express',
    stationCode: 'MMCT',
    stationName: 'Mumbai Central',
    pnr: '7239014589',
    trainNumber: '12951',
    trainName: 'Mumbai Central Rajdhani Express',
    passengerName: 'Sanjay Gupta (Coach B1 / Seat 08)',
    category: 'Taste & Quality',
    issue: 'Paneer gravy had higher spice level than the mild dietary option selected in order.',
    severity: 'Low',
    status: 'Resolved',
    receivedDate: '2026-01-18T16:20:00Z',
    resolutionTime: '3.0 hrs',
    resolutionNote: 'Apology call completed by customer support; complimentary beverage voucher issued for return journey.',
  },
];

export default function VendorDetails() {
  const { vendorId } = useParams();
  const {
    getVendor,
    getOutletsByVendor,
    getStationsByVendor,
  } = useOutlets();

  const vendor = getVendor(vendorId);
  const vendorOutlets = useMemo(
    () => (vendor ? getOutletsByVendor(vendor.id) : []),
    [vendor, getOutletsByVendor]
  );
  const vendorStations = useMemo(
    () => (vendor ? getStationsByVendor(vendor.id) : []),
    [vendor, getStationsByVendor]
  );

  const [activeTab, setActiveTab] = useState('overview');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState(null);
  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Outlets Tab Filter State
  const [outletSearch, setOutletSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [outletStatusFilter, setOutletStatusFilter] = useState('ALL');

  // Complaints Tab State
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('ALL');

  // Outlet breakdown counts
  const outletCounts = {
    total: vendorOutlets.length,
    active: vendorOutlets.filter((o) => o.status === 'Active').length,
    pending: vendorOutlets.filter((o) => o.status === 'Pending').length,
    inactiveOrClosed: vendorOutlets.filter(
      (o) => o.status === 'Inactive' || o.status === 'Closed' || o.status === 'Archived'
    ).length,
  };

  // Visual report data calculations
  const grossValue = vendor?.metrics?.grossOrderValue || 3847500;
  const vendorEarnings = vendor?.metrics?.vendorEarnings || 3078000;
  const platformFee = Math.max(0, grossValue - vendorEarnings);
  const netPct = grossValue > 0 ? Math.round((vendorEarnings / grossValue) * 100) : 80;
  const totalOrders = vendor?.metrics?.totalOrders || 14250;
  const avgOrderVal = totalOrders > 0 ? Math.round(grossValue / totalOrders) : 270;

  const monthlyTrend = useMemo(() => {
    return [
      { month: 'Nov', orders: Math.round(totalOrders * 0.10), pct: 45 },
      { month: 'Dec', orders: Math.round(totalOrders * 0.15), pct: 60 },
      { month: 'Jan', orders: Math.round(totalOrders * 0.18), pct: 72 },
      { month: 'Feb', orders: Math.round(totalOrders * 0.17), pct: 68 },
      { month: 'Mar', orders: Math.round(totalOrders * 0.19), pct: 82 },
      { month: 'Apr', orders: Math.round(totalOrders * 0.21), pct: 95, isPeak: true },
    ];
  }, [totalOrders]);

  const stationDistribution = useMemo(() => {
    const palette = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-amber-500',
      'bg-purple-500',
    ];
    const shares = [34, 28, 18, 12, 8];
    return vendorStations.map((s, idx) => {
      const share = shares[idx % shares.length] || 10;
      const outletsAtStn = vendorOutlets.filter((o) => o.stationCode === s.code).length;
      return {
        code: s.code,
        name: s.name,
        outletsCount: outletsAtStn || 1,
        share,
        estOrders: Math.round(totalOrders * (share / 100)),
        colorClass: palette[idx % palette.length],
      };
    });
  }, [vendorStations, vendorOutlets, totalOrders]);

  // Filtered Outlets for Tab 2
  const filteredOutlets = vendorOutlets.filter((outlet) => {
    if (outletSearch.trim()) {
      const q = outletSearch.toLowerCase().trim();
      const match =
        (outlet.name && outlet.name.toLowerCase().includes(q)) ||
        (outlet.id && outlet.id.toLowerCase().includes(q)) ||
        (outlet.stationName && outlet.stationName.toLowerCase().includes(q)) ||
        (outlet.stationCode && outlet.stationCode.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (stationFilter !== 'ALL' && outlet.stationCode !== stationFilter) {
      return false;
    }
    if (outletStatusFilter !== 'ALL' && outlet.status !== outletStatusFilter) {
      return false;
    }
    return true;
  });

  // Filtered Complaints for Tab 3
  const filteredComplaints = mockVendorComplaints.filter((c) => {
    if (complaintSearch.trim()) {
      const q = complaintSearch.toLowerCase().trim();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.pnr.includes(q) ||
        c.outletName.toLowerCase().includes(q) ||
        c.issue.toLowerCase().includes(q) ||
        c.passengerName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (complaintStatusFilter !== 'ALL' && c.status !== complaintStatusFilter) {
      return false;
    }
    return true;
  });

  if (!vendor) {
    return (
      <NotFound
        message={`Vendor with ID "${vendorId}" was not found or has been removed from the platform.`}
        returnTo="/outlets/vendors"
        returnLabel="Back to Vendor Directory"
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    {
      id: 'outlets',
      label: `Associated Outlets (${vendorOutlets.length})`,
      icon: Store,
    },
    {
      id: 'complaints',
      label: `Received Complaints (${mockVendorComplaints.length})`,
      icon: AlertTriangle,
    },
    { id: 'orders', label: 'Orders Summary', icon: ShoppingBag },
    { id: 'earnings', label: 'Earnings & Payouts', icon: IndianRupee },
    {
      id: 'documents',
      label: `Compliance Documents (${vendor.documents?.length || 0})`,
      icon: FileText,
    },
    { id: 'history', label: 'Audit History', icon: History },
  ];

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between text-xs">
        <Link
          to="/outlets/vendors"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Vendors</span>
        </Link>

        <span className="text-slate-400">
          Registered: {formatDate(vendor.registrationDate, false)}
        </span>
      </div>

      {/* CLEAN & SPACIOUS HERO HEADER */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm">
              {vendor.businessName ? vendor.businessName.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {vendor.businessName}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                  {vendor.id}
                </span>
                <StatusBadge status={vendor.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {vendor.category} • {vendor.city}, {vendor.state} • Operates {vendorOutlets.length} Outlets across {vendorStations.length} Railway Stations
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to={`/outlets/vendors/${vendor.id}/edit`}>
              <Button variant="secondary" size="md" leftIcon={Edit2}>
                Edit Profile
              </Button>
            </Link>

            <Link
              to={`/outlets/${vendorStations[0]?.code || 'BRC'}/new?vendorId=${vendor.id}`}
            >
              <Button variant="primary" size="md" leftIcon={Plus}>
                Add Outlet
              </Button>
            </Link>
          </div>
        </div>

        {/* Clean Metadata & Direct Contact Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-800 font-semibold">Contact:</strong> {vendor.contactPerson}
            </span>

            <span className="flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{vendor.phone}</span>
              <button
                type="button"
                onClick={() => handleCopy(vendor.phone, 'head-phone')}
                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title="Copy phone"
              >
                {copiedKey === 'head-phone' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </span>

            {vendor.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{vendor.email}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(vendor.email, 'head-email')}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Copy email"
                >
                  {copiedKey === 'head-email' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </span>
            )}
          </div>

          {/* Railway Station Hub Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-xs mr-0.5">Stations:</span>
            {vendorStations.map((station) => (
              <Link
                key={station.code}
                to={`/outlets/station/${station.code}`}
                className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition-colors"
                title={`${station.name} (${station.code})`}
              >
                {station.code}
              </Link>
            ))}
          </div>
        </div>

        {vendor.description && (
          <p className="text-xs text-slate-500 leading-relaxed italic pt-1">
            "{vendor.description}"
          </p>
        )}
      </div>

      {/* NAVIGATION TABS HEADER */}
      <div className="border-b border-slate-200 bg-white rounded-xl px-3 py-1 shadow-xs">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isComplaintsTab = tab.id === 'complaints';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isComplaintsTab
                    ? 'text-amber-800 hover:bg-amber-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isComplaintsTab && !isActive ? 'text-amber-600' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Clean, Airy KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Outlets
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {outletCounts.total}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="text-emerald-700 font-semibold">{outletCounts.active} active</span>
                <span>•</span>
                <span className="text-amber-700 font-semibold">{outletCounts.pending} pending</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Railway Stations
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {vendorStations.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Across {new Set(vendorStations.map((s) => s.state)).size} Indian states
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Orders Fulfilled
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {Number(vendor.metrics?.totalOrders || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Aggregated from {vendorOutlets.length} platforms
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Gross Order Value
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-2">
                {formatCurrency(vendor.metrics?.grossOrderValue || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Net Vendor Realization: {netPct}%
              </div>
            </div>
          </div>

          {/* VISUAL PERFORMANCE & OPERATIONS REPORT */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Visual Performance & Operational Analytics
                  </h3>
                  <p className="text-xs text-slate-500">
                    Revenue split flow, monthly growth, and platform delivery SLAs
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                Last 6 Months • 2025–2026
              </span>
            </div>

            {/* Row 1: Revenue Waterfall & Monthly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Flow Realization */}
              <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Revenue Realization & Split Flow
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Net: {netPct}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Gross Customer Billing: <strong className="text-slate-900 font-semibold">{formatCurrency(grossValue)}</strong></span>
                    <span>100% Realization</span>
                  </div>
                  <div className="h-4 w-full bg-slate-200 rounded-md overflow-hidden flex shadow-2xs">
                    <div
                      style={{ width: `${netPct}%` }}
                      className="bg-emerald-600 h-full flex items-center justify-center text-[10px] text-white font-bold"
                    >
                      {netPct}% Net Payout
                    </div>
                    <div
                      style={{ width: `${100 - netPct}%` }}
                      className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
                    >
                      {100 - netPct}% Fee
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Net Vendor Payout</span>
                    <div className="text-lg font-bold text-emerald-700">
                      {formatCurrency(vendorEarnings)}
                    </div>
                    <span className="text-[11px] text-slate-400 block">T+2 settlement via direct bank NEFT</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Platform & IRCTC Share</span>
                    <div className="text-lg font-bold text-slate-800">
                      {formatCurrency(platformFee)}
                    </div>
                    <span className="text-[11px] text-slate-400 block">Concession, cloud infra & gateway</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-200/60">
                  <span>Avg Ticket Size: <strong className="text-slate-800 font-mono">{formatCurrency(avgOrderVal)}</strong></span>
                  <span>Orders Fulfilled: <strong className="text-slate-800 font-mono">{Number(totalOrders).toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Monthly Order Trend */}
              <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Monthly Order Volume Trend
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% QoQ
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200/80">
                  <div className="flex items-end justify-between gap-3 h-36 pt-4 pb-1 px-1">
                    {monthlyTrend.map((item) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-700 transition-colors">
                          {item.orders.toLocaleString()}
                        </span>
                        <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md overflow-hidden flex items-end h-full">
                          <div
                            style={{ height: `${item.pct}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              item.isPeak
                                ? 'bg-gradient-to-t from-emerald-600 to-teal-500'
                                : 'bg-gradient-to-t from-slate-700 to-slate-800 group-hover:from-emerald-600 group-hover:to-teal-500'
                            }`}
                          />
                        </div>
                        <span className={`text-[11px] font-semibold ${item.isPeak ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>Run-rate: <strong className="text-slate-800">{Math.round(totalOrders / 6).toLocaleString()} orders/month</strong></span>
                    <span className="text-emerald-700 font-semibold">Peak: April</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Network: Western & NW Railway</span>
                  <span className="text-slate-700 font-medium">99.2% Platform Uptake</span>
                </div>
              </div>
            </div>

            {/* Row 2: Stations Concentration & Operational Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Station Volume Share */}
              <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Train className="w-4 h-4 text-indigo-600" />
                    Station Network Share
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                    {vendorStations.length} Stations
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200/80 space-y-3">
                  {stationDistribution.map((stn) => (
                    <div key={stn.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                            {stn.code}
                          </span>
                          <span className="font-semibold text-slate-800">{stn.name}</span>
                          <span className="text-slate-400 text-[11px]">({stn.outletsCount} outlet)</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-500">{stn.estOrders.toLocaleString()} meals</span>
                          <strong className="text-slate-900">{stn.share}%</strong>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${stn.share}%` }}
                          className={`h-full rounded-full ${stn.colorClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Quality Radar */}
              <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Operational Quality & Delivery SLAs
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Grade: A+ Verified
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200/80 space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        On-Time Coach Delivery SLA
                      </span>
                      <strong className="text-emerald-700 font-mono text-xs">98.4% (Zero delay penalties)</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[98.4%]" />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        Kitchen Order-to-Dispatch Speed
                      </span>
                      <strong className="text-blue-700 font-mono text-xs">18 mins (Target: &lt; 25m)</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[72%]" />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Passenger Rating & Meal Hygiene
                      </span>
                      <strong className="text-amber-700 font-bold text-xs">4.7 / 5.0 ★</strong>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full w-[94%]" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">2,410+ ratings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEW SECTION: RECEIVED COMPLAINTS ON VENDOR'S OUTLETS */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Received Complaints on Vendor's Outlets
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Passenger Grievances
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Complaints registered via RailMadad and OLF passenger app across this vendor's outlets
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('complaints')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>View All 18 Complaints</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Complaint Summary KPI Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Complaints</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">18</span>
                <span className="text-[10px] text-emerald-700 font-medium">0.12% Complaint Rate</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Resolved</span>
                <span className="text-lg font-bold text-emerald-800 mt-0.5 block">16</span>
                <span className="text-[10px] text-emerald-700 font-medium">88.9% Resolution Rate</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-800 uppercase block">Under Review</span>
                <span className="text-lg font-bold text-amber-800 mt-0.5 block">2</span>
                <span className="text-[10px] text-amber-700 font-medium">Active Investigation</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-800 uppercase block">Avg Resolution SLA</span>
                <span className="text-lg font-bold text-blue-800 mt-0.5 block">3.4 hrs</span>
                <span className="text-[10px] text-blue-700 font-medium">Target: &lt; 6 hrs</span>
              </div>
            </div>

            {/* Recent Complaints Table */}
            <div className="border border-slate-200/80 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Complaint ID</th>
                      <th className="py-2.5 px-3">Outlet & Station</th>
                      <th className="py-2.5 px-3">Passenger PNR / Train</th>
                      <th className="py-2.5 px-4 min-w-[220px]">Issue Details</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockVendorComplaints.slice(0, 3).map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {comp.id}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{comp.outletName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {comp.stationName} ({comp.stationCode})
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono font-semibold text-slate-800">PNR: {comp.pnr}</div>
                          <div className="text-[11px] text-slate-500">
                            Train {comp.trainNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{comp.category}</div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                            {comp.issue}
                          </p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                              comp.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600 leading-snug">
                          {comp.resolutionNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Business & Corporate Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Corporate Credentials
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Registered partner business details
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Business Entity:</span>
                  <span className="font-semibold text-slate-900">
                    {vendor.businessName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Vendor ID:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {vendor.id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Business Category:</span>
                  <span className="font-semibold text-slate-900">
                    {vendor.category}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Registration Date:</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(vendor.registrationDate, false)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Operational Status:</span>
                  <StatusBadge status={vendor.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Corporate Headquarters
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Principal office & administrative contacts
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">
                    Registered Head Office Address:
                  </span>
                  <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {vendor.address}, {vendor.city}, {vendor.state} -{' '}
                      {vendor.pincode}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">
                      Phone Contact
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {vendor.phone}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">
                      Email Address
                    </span>
                    <span className="font-semibold text-slate-900 truncate block">
                      {vendor.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSOCIATED OUTLETS */}
      {activeTab === 'outlets' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={outletSearch}
                  onChange={(e) => setOutletSearch(e.target.value)}
                  placeholder="Search outlets by name, station..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Stations ({vendorStations.length})</option>
                {vendorStations.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              <select
                value={outletStatusFilter}
                onChange={(e) => setOutletStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <Link
              to={`/outlets/${vendorStations[0]?.code || 'BRC'}/new?vendorId=${vendor.id}`}
            >
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Add Outlet for {vendor.businessName}
              </Button>
            </Link>
          </div>

          {filteredOutlets.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No associated outlets match filter"
              description="This vendor currently has no outlets matching the search or station filter."
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Outlet ID</th>
                      <th className="py-3 px-4 min-w-[200px]">Outlet Name</th>
                      <th className="py-3 px-4">Railway Station</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4">Complaints Recd</th>
                      <th className="py-3 px-4">Wallet Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredOutlets.map((outlet) => {
                      const outletComplaintsCount = mockVendorComplaints.filter(
                        (c) => c.outletId === outlet.id || c.stationCode === outlet.stationCode
                      ).length;

                      return (
                        <tr
                          key={outlet.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-800 border border-slate-200">
                              {outlet.id}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <Link
                              to={`/outlets/${outlet.id}`}
                              className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline"
                            >
                              {outlet.name}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {outlet.category}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <Link
                              to={`/outlets/station/${outlet.stationCode}`}
                              className="font-medium text-slate-800 hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                            >
                              <span className="font-mono font-bold text-slate-900">
                                {outlet.stationCode}
                              </span>
                              <span>{outlet.stationName}</span>
                            </Link>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-mono">
                            {outlet.openingTime} - {outlet.closingTime}
                          </td>

                          {/* Complaints Count Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {outletComplaintsCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => setActiveTab('complaints')}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{outletComplaintsCount} logged</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                0 issues
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800 text-xs">
                            {formatCurrency(outlet.wallet?.balance)}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={outlet.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/outlets/${outlet.id}`}>
                                <button
                                  type="button"
                                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="View Outlet Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>

                              <Link to={`/outlets/${outlet.id}/edit`}>
                                <button
                                  type="button"
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Edit Outlet"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECEIVED COMPLAINTS (FULL MODULE) */}
      {activeTab === 'complaints' && (
        <div className="space-y-5">
          {/* Header & Filter Controls */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Search by PNR, Complaint ID, outlet, passenger..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Complaint Statuses ({mockVendorComplaints.length})</option>
                <option value="Resolved">Resolved (16)</option>
                <option value="In Review">Under Review (2)</option>
              </select>
            </div>

            <span className="text-xs text-slate-500">
              Integrated with IRCTC RailMadad Grievance Gateway
            </span>
          </div>

          {/* Complaints Table */}
          {filteredComplaints.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No complaints match filter"
              description="No grievances found for this search or status selection."
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Complaint ID</th>
                      <th className="py-3 px-4">Outlet & Hub</th>
                      <th className="py-3 px-4">Passenger / PNR</th>
                      <th className="py-3 px-5 min-w-[240px]">Issue Details</th>
                      <th className="py-3 px-3">Severity</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 min-w-[240px]">Resolution & SOP Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComplaints.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 block text-center">
                            {comp.id}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1 text-center">
                            {formatDate(comp.receivedDate, false)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{comp.outletName}</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {comp.stationName} ({comp.stationCode})
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-slate-900">PNR: {comp.pnr}</div>
                          <div className="text-[11px] text-slate-600">Train {comp.trainNumber}</div>
                          <div className="text-[10px] text-slate-400">{comp.passengerName}</div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-900 block">{comp.category}</span>
                          <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                            {comp.issue}
                          </p>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${
                              comp.severity === 'High'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : comp.severity === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {comp.severity}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${
                              comp.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 text-xs leading-relaxed">
                            {comp.resolutionNote}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            SLA Closed in: <strong className="font-mono text-slate-600">{comp.resolutionTime}</strong>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORDERS SUMMARY */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-xs text-amber-950 space-y-1">
              <h4 className="font-bold text-sm text-amber-900">
                Future Module Integration: IRCTC e-Catering Orders
              </h4>
              <p className="leading-relaxed">
                Individual passenger orders, PNR assignments, seat delivery manifests, and live coach
                delivery confirmations will be consolidated inside the upcoming <strong>Orders Management Module</strong>.
                The figures below represent demonstration metrics for software architecture validation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Consolidated Orders
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {Number(vendor.metrics?.totalOrders || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Aggregated from {vendorOutlets.length} station outlets
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Order Completion Rate
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-2">
                98.4%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Delivered before train departure halt
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Average Meal Preparation Time
              </span>
              <div className="text-2xl font-bold text-blue-700 mt-2">
                19 mins
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Across all regional platform kitchens
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EARNINGS & PAYOUTS */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-800 shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="text-xs text-blue-950 space-y-1">
              <h4 className="font-bold text-sm text-blue-900">
                Financial Ledger Architecture (Preview)
              </h4>
              <p className="leading-relaxed">
                All financial figures, commission splits, and automated bank settlements will be processed
                via the payment gateway and railway commercial ledger. The values displayed here illustrate
                the planned aggregation structure across the vendor's multiple outlets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Gross Order Value (GOV)
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(vendor.metrics?.grossOrderValue || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Passenger billings across all stations
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Platform Commission & Fee (Est.)
              </span>
              <div className="text-2xl font-bold text-slate-700 mt-2">
                {formatCurrency((vendor.metrics?.grossOrderValue || 0) * 0.15)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                OLF & IRCTC facilitation charges
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Net Vendor Earnings
              </span>
              <div className="text-2xl font-bold text-emerald-800 mt-2">
                {formatCurrency(vendor.metrics?.vendorEarnings || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Accrued payable to vendor account
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Settled Disbursements
              </span>
              <div className="text-2xl font-bold text-blue-800 mt-2">
                {formatCurrency((vendor.metrics?.vendorEarnings || 0) * 0.85)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bank NEFT/RTGS transfers credited
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Pending Settlement (Escrow)
              </span>
              <div className="text-2xl font-bold text-amber-700 mt-2">
                {formatCurrency((vendor.metrics?.vendorEarnings || 0) * 0.15)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Rolling weekly cycle payout
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Compliance & Legal Documentation
            </h3>
            <div className="space-y-3">
              {(vendor.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Category: {doc.category} • Expiry: {doc.expiryDate}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Vendor Activity & Audit Trail
            </h3>
            <div className="space-y-4">
              {(vendor.history || []).map((h) => (
                <div
                  key={h.id}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3.5"
                >
                  <History className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {h.event}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(h.date, true)}
                    </p>
                    {h.notes && (
                      <p className="text-xs text-slate-600 mt-1 italic">
                        "{h.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
