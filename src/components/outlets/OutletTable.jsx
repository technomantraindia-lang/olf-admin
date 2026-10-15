import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  Trash2,
  Edit2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  CreditCard,
  Pencil,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  FileText,
  X,
  Utensils,
  MapPin,
  ExternalLink,
  Train,
  Building,
  Store,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import { getOutletComplianceDocs } from '../../services/outletService';

// High-quality Indian food thumbnails for visual presentation
const FOOD_THUMBNAILS = [
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=120&h=120&q=80',
];

// Curated harmonious color themes for station cards and quick filters
const STATION_COLOR_THEMES = [
  {
    iconBadge: 'bg-blue-50 text-blue-600 border border-blue-200/90 group-hover:border-blue-300 group-hover:bg-blue-100/50',
    codeBadge: 'bg-blue-50 text-blue-700 border-blue-200/90',
    countBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    hoverShadow: 'hover:shadow-blue-500/10',
    titleHover: 'group-hover:text-blue-600',
    viewLink: 'text-blue-600 group-hover:text-blue-700',
  },
  {
    iconBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200/90 group-hover:border-emerald-300 group-hover:bg-emerald-100/50',
    codeBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    countBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    hoverShadow: 'hover:shadow-emerald-500/10',
    titleHover: 'group-hover:text-emerald-600',
    viewLink: 'text-emerald-600 group-hover:text-emerald-700',
  },
  {
    iconBadge: 'bg-purple-50 text-purple-600 border border-purple-200/90 group-hover:border-purple-300 group-hover:bg-purple-100/50',
    codeBadge: 'bg-purple-50 text-purple-700 border-purple-200/90',
    countBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    hoverShadow: 'hover:shadow-purple-500/10',
    titleHover: 'group-hover:text-purple-600',
    viewLink: 'text-purple-600 group-hover:text-purple-700',
  },
  {
    iconBadge: 'bg-amber-50 text-amber-600 border border-amber-200/90 group-hover:border-amber-300 group-hover:bg-amber-100/50',
    codeBadge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    countBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    hoverShadow: 'hover:shadow-amber-500/10',
    titleHover: 'group-hover:text-amber-700',
    viewLink: 'text-amber-600 group-hover:text-amber-700',
  },
  {
    iconBadge: 'bg-rose-50 text-rose-600 border border-rose-200/90 group-hover:border-rose-300 group-hover:bg-rose-100/50',
    codeBadge: 'bg-rose-50 text-rose-700 border-rose-200/90',
    countBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    hoverBorder: 'hover:border-rose-400',
    hoverShadow: 'hover:shadow-rose-500/10',
    titleHover: 'group-hover:text-rose-600',
    viewLink: 'text-rose-600 group-hover:text-rose-700',
  },
  {
    iconBadge: 'bg-indigo-50 text-indigo-600 border border-indigo-200/90 group-hover:border-indigo-300 group-hover:bg-indigo-100/50',
    codeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200/90',
    countBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    hoverShadow: 'hover:shadow-indigo-500/10',
    titleHover: 'group-hover:text-indigo-600',
    viewLink: 'text-indigo-600 group-hover:text-indigo-700',
  },
  {
    iconBadge: 'bg-teal-50 text-teal-600 border border-teal-200/90 group-hover:border-teal-300 group-hover:bg-teal-100/50',
    codeBadge: 'bg-teal-50 text-teal-800 border-teal-200/90',
    countBadge: 'bg-teal-50 text-teal-800 border-teal-200',
    hoverBorder: 'hover:border-teal-400',
    hoverShadow: 'hover:shadow-teal-500/10',
    titleHover: 'group-hover:text-teal-700',
    viewLink: 'text-teal-600 group-hover:text-teal-700',
  },
  {
    iconBadge: 'bg-cyan-50 text-cyan-700 border border-cyan-200/90 group-hover:border-cyan-300 group-hover:bg-cyan-100/50',
    codeBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200/90',
    countBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    hoverShadow: 'hover:shadow-cyan-500/10',
    titleHover: 'group-hover:text-cyan-700',
    viewLink: 'text-cyan-600 group-hover:text-cyan-700',
  },
];

export default function OutletTable({ presetStation = null, presetFilter = null, defaultView = 'table' }) {
  const navigate = useNavigate();
  const { filterType } = useParams();
  const effectiveFilter = (presetFilter || filterType || '').toLowerCase();
  const { outlets, stations, updateOutlet, deleteOutlet, restoreOutlet, showToast, openPushNotice } = useOutlets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(presetStation || 'ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [pageSize, setPageSize] = useState('20');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [viewMode, setViewMode] = useState(defaultView || 'table'); // 'table' (flat table) | 'stations' (cards per station)

  // Sync viewMode with defaultView prop on navigation
  useEffect(() => {
    if (defaultView) {
      setViewMode(defaultView);
    }
  }, [defaultView]);

  // Available states for state selector
  const availableStates = useMemo(() => {
    const statesSet = new Set();
    stations.forEach((s) => {
      if (s.state && s.state.trim()) {
        statesSet.add(s.state.trim());
      }
    });
    return Array.from(statesSet).sort();
  }, [stations]);

  // Count of stations per state
  const stateStationCounts = useMemo(() => {
    const counts = {};
    stations.forEach((s) => {
      if (s.state && s.state.trim()) {
        const st = s.state.trim();
        counts[st] = (counts[st] || 0) + 1;
      }
    });
    return counts;
  }, [stations]);

  const [inspectingOutletDocs, setInspectingOutletDocs] = useState(null);
  const [activeDocPreview, setActiveDocPreview] = useState(null);

  // Filtered outlets
  const filteredOutlets = useMemo(() => {
    return outlets.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesId = String(item.id || '').toLowerCase().includes(q);
        const matchesIrctc = String(item.irctcOutletId || '').toLowerCase().includes(q);
        const matchesStation = item.stationCode?.toLowerCase().includes(q);
        const matchesVendor = (item.vendorName || '')?.toLowerCase().includes(q);
        const matchesFssai = item.fssaiNo?.includes(q);
        if (!matchesName && !matchesId && !matchesIrctc && !matchesStation && !matchesVendor && !matchesFssai) {
          return false;
        }
      }

      // Station filter
      if (selectedStation !== 'ALL') {
        if (item.stationCode?.toUpperCase() !== selectedStation.toUpperCase()) {
          return false;
        }
      }

      // State filter
      if (selectedState !== 'ALL') {
        const stn = stations.find(
          (s) => s.code.toUpperCase() === (item.stationCode || '').toUpperCase()
        );
        if (!stn || (stn.state || '').toLowerCase() !== selectedState.toLowerCase()) {
          return false;
        }
      }

      // Category / Tab Preset Filter
      if (effectiveFilter) {
        if (effectiveFilter === 'prepaid') {
          const isPrepaid =
            Boolean(item.prepaid) ||
            item.paymentMode === 'PREPAID ONLY' ||
            item.paymentMode === 'PREPAID' ||
            item.paymentMode?.toLowerCase().includes('prepaid only');
          if (!isPrepaid) return false;
        } else if (effectiveFilter === 'pending') {
          const isPending =
            item.status?.toLowerCase() === 'pending' ||
            item.status === 'DOCUMENT_UPLOAD_PENDING' ||
            item.status === 'APPROVAL_PENDING' ||
            item.approvalStatus === 'APPROVAL_PENDING' ||
            item.approvalStatus === 'DOCUMENT_UPLOAD_PENDING' ||
            item.approvalStatus === 'PENDING';
          if (!isPending) return false;
        } else if (effectiveFilter === 'inactive') {
          const isInactive =
            item.status?.toLowerCase() === 'inactive' ||
            item.status === 'DEACTIVATED' ||
            item.approvalStatus === 'DEACTIVATED' ||
            (item.listed === false &&
              item.status !== 'Closed' &&
              item.status !== 'Archived' &&
              item.status !== 'Deleted' &&
              item.status !== 'Pending' &&
              item.approvalStatus !== 'APPROVAL_PENDING' &&
              item.approvalStatus !== 'DOCUMENT_UPLOAD_PENDING');
          if (!isInactive) return false;
        } else if (effectiveFilter === 'closed') {
          const isClosed = item.status?.toLowerCase() === 'closed' || item.isClosed === true;
          if (!isClosed) return false;
        } else if (effectiveFilter === 'archived' || effectiveFilter === 'deleted') {
          const isArchived =
            item.status?.toLowerCase() === 'archived' ||
            item.status?.toLowerCase() === 'deleted' ||
            item.archived === true ||
            item.isDeleted === true;
          if (!isArchived) return false;
        } else if (effectiveFilter === 'all') {
          // Hide archived/deleted outlets from All Outlets
          if (item.status === 'Archived' || item.status === 'Deleted' || item.archived === true) {
            return false;
          }
        }
      } else {
        // By default on Overview, hide archived/deleted outlets
        if (item.status === 'Archived' || item.status === 'Deleted' || item.archived === true) {
          return false;
        }
      }

      return true;
    });
  }, [outlets, searchQuery, selectedStation, selectedState, effectiveFilter, stations]);

  // Group all outlets by Station for the minimal Station Cards Grid
  const stationGroups = useMemo(() => {
    const stationMap = new Map();

    // 1. Seed with known registered stations
    stations.forEach((stn) => {
      stationMap.set(stn.code.toUpperCase(), {
        station: stn,
        outlets: [],
      });
    });

    // 2. Distribute all active outlets across stations
    outlets.forEach((outlet) => {
      if (outlet.status === 'Archived' || outlet.status === 'Deleted' || outlet.archived === true) {
        return;
      }
      const code = (outlet.stationCode || 'OTHER').toUpperCase();
      if (!stationMap.has(code)) {
        stationMap.set(code, {
          station: {
            code,
            name: code,
            fullName: `${code} Railway Station`,
            zone: 'IRCTC Network',
            state: '',
          },
          outlets: [],
        });
      }
      stationMap.get(code).outlets.push(outlet);
    });

    let groups = Array.from(stationMap.values());

    // Sort: stations with outlets first, then alphabetical by station name
    groups.sort((a, b) => {
      if (b.outlets.length !== a.outlets.length) {
        return b.outlets.length - a.outlets.length;
      }
      return a.station.name.localeCompare(b.station.name);
    });

    // Filter by State if selected
    if (selectedState !== 'ALL') {
      groups = groups.filter(
        (g) => (g.station.state || '').toLowerCase() === selectedState.toLowerCase()
      );
    }

    // If search query is present, filter stations
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      groups = groups.filter((g) => {
        const matchesStation =
          g.station.code.toLowerCase().includes(q) ||
          g.station.name.toLowerCase().includes(q) ||
          (g.station.fullName || '').toLowerCase().includes(q) ||
          (g.station.zone || '').toLowerCase().includes(q) ||
          (g.station.state || '').toLowerCase().includes(q);
        const hasMatchingOutlet = g.outlets.some(
          (o) =>
            (o.name || '').toLowerCase().includes(q) ||
            String(o.id || '').toLowerCase().includes(q)
        );
        return matchesStation || hasMatchingOutlet;
      });
    }

    return groups;
  }, [stations, outlets, searchQuery, selectedState]);

  // Export Outlets as CSV
  const handleExportCSV = () => {
    const headers = ['Outlet ID', 'Name', 'Station', 'Timings', 'Prep Cutoff', 'Min Order', 'Payment Mode', 'FSSAI No', 'Wallet Balance', 'Status'];
    const rows = filteredOutlets.map((o) => [
      o.id,
      `"${(o.name || '').replace(/"/g, '""')}"`,
      o.stationCode,
      `"${o.startTime || '10:00'} - ${o.endTime || '22:00'}"`,
      `${o.bookingCutoff || 40}m`,
      o.minOrderAmount || 100,
      o.prepaid ? 'PREPAID ONLY' : 'COD & PREPAID',
      o.fssaiNo || '12312352136452',
      o.walletBalance ?? -207.00,
      o.status || 'Active',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `olf_outlets_${selectedStation !== 'ALL' ? selectedStation : 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Outlets exported successfully as CSV.', 'success');
  };

  // Push All to IRCTC Handler
  const handlePushAll = () => {
    const targetStation = stations.find((s) => s.code.toUpperCase() === selectedStation.toUpperCase()) || null;
    openPushNotice?.(targetStation);
  };

  // Delete handler (moves to Deleted Outlets by default, or hard deletes if already in Deleted Outlets)
  const handleDelete = async (id, name) => {
    const isAlreadyArchived = effectiveFilter === 'archived' || effectiveFilter === 'deleted';
    const confirmMsg = isAlreadyArchived
      ? `Permanently purge outlet "${name}" (#${id}) from database? This cannot be undone.`
      : `Move outlet "${name}" (#${id}) to Deleted Outlets?`;

    if (window.confirm(confirmMsg)) {
      try {
        await deleteOutlet(id, isAlreadyArchived);
      } catch (err) {
        console.error('Failed to delete outlet:', err);
      }
    }
  };

  // Restore handler
  const handleRestore = async (id, name) => {
    try {
      await restoreOutlet(id);
    } catch (err) {
      console.error('Failed to restore outlet:', err);
    }
  };

  // Helper station label
  const getStationLabel = (code) => {
    const stn = stations.find((s) => s.code.toUpperCase() === (code || '').toUpperCase());
    return stn ? `${stn.name.toUpperCase()} - ${stn.code}` : `${code} - ${code}`;
  };

  // Format date cleanly
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch {
      return dateStr;
    }
  };

  const getHeaderTitle = () => {
    if (effectiveFilter) {
      switch (effectiveFilter) {
        case 'prepaid':
          return 'Prepaid Outlets';
        case 'pending':
          return 'Pending Outlets';
        case 'inactive':
          return 'Inactive Outlets';
        case 'closed':
          return 'Closed Outlets';
        case 'archived':
        case 'deleted':
          return 'Deleted Outlets';
        case 'all':
          return 'All Station Outlets';
        default:
          return `${effectiveFilter.charAt(0).toUpperCase() + effectiveFilter.slice(1)} Outlets`;
      }
    }
    return 'Outlets Overview';
  };

  const headerTitle = getHeaderTitle();

  // Render a Single Outlet Row with Increased, Highly-Legible Font Sizes
  const renderOutletRow = (outlet, idx, showStationTag = true) => {
    const isPureVeg = outlet.mealType === 'PURE_VEG';
    const isExpanded = expandedRowId === outlet.id;
    const walletBal = outlet.walletBalance !== undefined ? outlet.walletBalance : -207.00;
    const isNegativeWallet = walletBal < 0;
    const imageSrc = outlet.image || FOOD_THUMBNAILS[idx % FOOD_THUMBNAILS.length];

    const cellBase =
      'py-4.5 px-4.5 sm:px-5 align-top bg-white border-y border-slate-200/90 shadow-2xs group-hover:bg-blue-50/20 transition-colors';

    return (
      <React.Fragment key={outlet.id}>
        <tr className="group transition-all">
          {/* 1. OUTLET ID & Image */}
          <td className={`${cellBase} rounded-l-lg border-l whitespace-nowrap`}>
            <Link
              to={`/outlets/${outlet.id}`}
              className="inline-flex items-center font-mono text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-md transition shadow-2xs"
            >
              #{outlet.irctcOutletId || outlet.id}
            </Link>
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/90 mt-2.5 shrink-0 flex items-center justify-center shadow-2xs">
              <img
                src={imageSrc}
                alt={outlet.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Utensils className="w-5 h-5 text-slate-400" />
            </div>
          </td>

          {/* 2. RESTAURANT INFO: Name, Station Pill, Veg Symbol, Vendor */}
          <td className={cellBase}>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/outlets/${outlet.id}`}
                className="font-extrabold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition tracking-tight leading-snug"
              >
                {outlet.name}
              </Link>
              {showStationTag && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/90 px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  {getStationLabel(outlet.stationCode)}
                </span>
              )}
              {/* Pure Veg / Non Veg Square Mark */}
              {isPureVeg ? (
                <div
                  className="w-4 h-4 border border-emerald-600 p-0.5 rounded-xs flex items-center justify-center ml-0.5 shrink-0"
                  title="Pure Vegetarian"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
              ) : (
                <div
                  className="w-4 h-4 border border-rose-700 p-0.5 rounded-xs flex items-center justify-center ml-0.5 shrink-0"
                  title="Non-Vegetarian &amp; Vegetarian"
                >
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-rose-700" />
                </div>
              )}
            </div>

            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">
              {outlet.vendorName ? (
                <Link
                  to={`/outlets/vendors/${outlet.vendorId || 101}`}
                  className="text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5"
                >
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>Vendor: {outlet.vendorName}</span>
                </Link>
              ) : (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>Vendor #{outlet.vendorId || 101}</span>
                </span>
              )}
            </div>

            {outlet.address && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{outlet.address}</span>
              </div>
            )}
          </td>

          {/* 3. TIMINGS & PREP */}
          <td className={`${cellBase} whitespace-nowrap`}>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{outlet.startTime || '10:00'} - {outlet.endTime || '22:00'}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-slate-200">
                Prep: {outlet.bookingCutoff || 45}m
              </span>
            </div>
          </td>

          {/* 4. ORDER & PAYMENT */}
          <td className={`${cellBase} whitespace-nowrap`}>
            <div className="text-base font-extrabold text-slate-900 tracking-tight">
              ₹ {outlet.minOrderAmount || 100} <span className="text-xs font-bold text-slate-500">Min</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase border ${
                  outlet.prepaid
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-slate-700 bg-slate-100 border-slate-200'
                }`}
              >
                {outlet.prepaid ? 'PREPAID ONLY' : (outlet.paymentMode || 'COD & PREPAID')}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{outlet.distanceInMeters || 250}m to platform</span>
            </div>
          </td>

          {/* 5. WALLET */}
          <td className={`${cellBase} whitespace-nowrap`}>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-base font-extrabold border ${
                isNegativeWallet
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {walletBal < 0 ? `-₹${Math.abs(walletBal).toFixed(2)}` : `₹${walletBal.toFixed(2)}`}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
              <span>thrshld: ₹{(outlet.walletThreshold || 0).toFixed(2)}</span>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Edit Threshold"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-1">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                DEFAULT
              </span>
            </div>
          </td>

          {/* 6. STATUS */}
          <td className={`${cellBase} whitespace-nowrap`}>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                (outlet.status === 'Active' || outlet.status === 'APPROVED') && outlet.listed !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : outlet.status === 'Pending' ||
                    outlet.status === 'DOCUMENT_UPLOAD_PENDING' ||
                    outlet.status === 'APPROVAL_PENDING' ||
                    outlet.approvalStatus === 'APPROVAL_PENDING' ||
                    outlet.approvalStatus === 'DOCUMENT_UPLOAD_PENDING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : outlet.status === 'Closed'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  (outlet.status === 'Active' || outlet.status === 'APPROVED') && outlet.listed !== false
                    ? 'bg-emerald-500'
                    : outlet.status === 'Pending' ||
                      outlet.status === 'DOCUMENT_UPLOAD_PENDING' ||
                      outlet.status === 'APPROVAL_PENDING' ||
                      outlet.approvalStatus === 'APPROVAL_PENDING' ||
                      outlet.approvalStatus === 'DOCUMENT_UPLOAD_PENDING'
                    ? 'bg-amber-500'
                    : outlet.status === 'Closed'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <span>{outlet.status || 'Active'}</span>
            </span>
            <div className="text-xs text-slate-400 mt-1.5 font-mono">
              {formatDate(outlet.createdAt || '2025-10-03 20:24')}
            </div>
          </td>

          {/* 7. ACTIONS */}
          <td className={`${cellBase} rounded-r-lg border-r text-right whitespace-nowrap`}>
            {effectiveFilter === 'archived' || effectiveFilter === 'deleted' ? (
              <div className="flex items-center justify-end gap-2">
                {/* Restore Button */}
                <button
                  type="button"
                  onClick={() => handleRestore(outlet.id, outlet.name)}
                  className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-transparent rounded-md shadow-2xs transition-colors cursor-pointer"
                  title="Restore to Active Outlets"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Permanently Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(outlet.id, outlet.name)}
                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-transparent rounded-md shadow-2xs transition-colors cursor-pointer"
                  title="Permanently Purge Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-1.5">
                {/* Expand toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedRowId(isExpanded ? null : outlet.id)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  title="Toggle Full Compliance Dossier"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(outlet.id, outlet.name)}
                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-transparent rounded-md shadow-2xs transition-colors cursor-pointer"
                  title="Delete Outlet (Move to Deleted Outlets)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Edit Button */}
                <Link
                  to={`/outlets/${outlet.id}/edit`}
                  className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-transparent rounded-md shadow-2xs transition-colors cursor-pointer"
                  title="Edit Outlet"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
              </div>
            )}
          </td>
        </tr>

        {/* Collapsible Row for IRCTC Statutory Details */}
        {isExpanded && (
          <tr className="animate-in fade-in duration-100">
            <td colSpan="7" className="p-4 sm:p-5 bg-slate-50/90 rounded-lg border border-slate-200 shadow-2xs">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-800">
                      IRCTC Statutory Compliance: {outlet.name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({outlet.stationCode})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingOutletDocs(outlet)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inspect 7 Filed Documents</span>
                    </button>
                    <Link
                      to={`/outlets/${outlet.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                    >
                      <span>View Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">14-Digit FSSAI License:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {outlet.fssaiNo || '12312352136452'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">FSSAI Expiry:</span>
                    <span className="font-medium text-slate-800">
                      {outlet.fssaiValidUpto || '2028-12-31'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Vendor Partner:</span>
                    <span className="font-medium text-slate-800">
                      {outlet.vendorName || `Vendor #${outlet.vendorId || 101}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Station Proximity:</span>
                    <span className="font-medium text-slate-800">
                      {outlet.distanceInMeters || 250} meters to platform
                    </span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar Container with Colorful Action Buttons & Reduced Border Radius */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {headerTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Managing station kitchen registries, live menus &amp; compliance status.
          </p>
        </div>

        {/* 3 Colorful Action Buttons with Reduced Rounded-md Edges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Push All to IRCTC (Royal Indigo) */}
          <button
            type="button"
            onClick={handlePushAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Push All to IRCTC</span>
          </button>

          {/* 2. Export Outlets (Vibrant Purple) */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Outlets</span>
          </button>

          {/* 3. Add New Outlet (Vibrant Brand Blue) */}
          <Link
            to={selectedStation !== 'ALL' ? `/outlets/${selectedStation}/new` : '/outlets/new'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Outlet</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar: Search Bar, Station Pills, and View Switcher with Low Border Radius */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3 sm:p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by outlet name, station, id..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/70 focus:bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Per Page Dropdown */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="px-2.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-md text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Quick Filter: All Stations + State Selector */}
        <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
            Stations:
          </span>

          {/* 1. All Stations Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedStation('ALL');
              setSelectedState('ALL');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedStation === 'ALL' && selectedState === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
            }`}
          >
            <span>All Stations</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                selectedStation === 'ALL' && selectedState === 'ALL'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {stations.length}
            </span>
          </button>

          {/* 2. States Selector Dropdown right beside All Stations Button */}
          <div className="relative inline-flex items-center">
            <MapPin className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
              selectedState !== 'ALL' ? 'text-blue-600' : 'text-slate-400'
            }`} />
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedStation('ALL');
              }}
              className={`appearance-none pl-7 pr-7 py-1.5 text-xs font-semibold rounded-md border shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition ${
                selectedState !== 'ALL'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
              aria-label="Filter by State"
            >
              <option value="ALL">All States ({availableStates.length} States)</option>
              {availableStates.map((state) => {
                const count = stateStationCounts[state] || 0;
                return (
                  <option key={state} value={state}>
                    {state} ({count} {count === 1 ? 'Station' : 'Stations'})
                  </option>
                );
              })}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 absolute right-2 pointer-events-none transition-colors ${
              selectedState !== 'ALL' ? 'text-blue-600' : 'text-slate-400'
            }`} />
          </div>

          {/* Active State Filter Tag */}
          {selectedState !== 'ALL' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-in fade-in">
              <span>State: <strong>{selectedState}</strong> ({stateStationCounts[selectedState] || 0} stations)</span>
              <button
                type="button"
                onClick={() => setSelectedState('ALL')}
                className="hover:text-blue-900 p-0.5 rounded cursor-pointer"
                title="Clear state filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          CASE 1: INDIVIDUAL STATION VIEW (When user clicks into a station)
          ======================================================== */}
      {selectedStation !== 'ALL' && (
        <div className="space-y-3.5">
          {/* Station Banner */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedStation('ALL')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Stations</span>
              </button>

              <div className="flex items-center gap-2">
                {(() => {
                  const currentStation = stations.find(
                    (s) => s.code.toUpperCase() === selectedStation.toUpperCase()
                  ) || {
                    code: selectedStation,
                    name: selectedStation,
                    fullName: `${selectedStation} Railway Station`,
                    zone: 'IRCTC Partner Network',
                    state: '',
                  };
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => openPushNotice?.(currentStation)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Sync {currentStation.code}</span>
                      </button>

                      <Link
                        to={`/outlets/${currentStation.code}/new`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Outlet</span>
                      </Link>
                    </>
                  );
                })()}
              </div>
            </div>

            {(() => {
              const currentStation = stations.find(
                (s) => s.code.toUpperCase() === selectedStation.toUpperCase()
              ) || {
                code: selectedStation,
                name: selectedStation,
                fullName: `${selectedStation} Railway Station`,
                zone: 'IRCTC Partner Network',
                state: '',
              };
              const currentStationOutlets = filteredOutlets.filter(
                (o) => (o.stationCode || '').toUpperCase() === selectedStation.toUpperCase()
              );

              return (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/90 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    <Train className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {currentStation.name} ({currentStation.code}) Outlets
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {currentStationOutlets.length} {currentStationOutlets.length === 1 ? 'Outlet' : 'Outlets'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentStation.fullName || `${currentStation.name} Railway Station`} •{' '}
                      {currentStation.state ? `${currentStation.state} • ` : ''}
                      {currentStation.zone || currentStation.division || 'IRCTC Partner Network'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Table of Outlets for this station */}
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table
                className="w-full text-left text-sm text-slate-700"
                style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}
              >
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 w-24">OUTLET ID</th>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 min-w-[200px]">RESTAURANT INFO</th>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 min-w-[140px]">TIMINGS &amp; PREP</th>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 min-w-[160px]">ORDER &amp; PAYMENT</th>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 w-36">WALLET</th>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 w-32">STATUS</th>
                    <th className="pb-2 pt-1 px-4.5 sm:px-5 w-28 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutlets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <p className="text-sm font-semibold text-slate-700">
                          No restaurants registered at {selectedStation} yet.
                        </p>
                        <Link
                          to={`/outlets/${selectedStation}/new`}
                          className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-2xs transition"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Register First Restaurant at {selectedStation}</span>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    filteredOutlets.map((outlet, idx) => renderOutletRow(outlet, idx, false))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CASE 2: CLEAN & MINIMAL STATION CARDS GRID (When on All Stations)
          ======================================================== */}
      {selectedStation === 'ALL' && viewMode === 'stations' && (
        <div>
          {stationGroups.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
              <Train className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No Railway Stations Found</p>
              <p className="text-xs text-slate-400 mt-0.5">No stations match your current search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {stationGroups.map((group, idx) => {
                const { station, outlets: stationOutlets } = group;
                const count = stationOutlets.length;
                const theme = STATION_COLOR_THEMES[idx % STATION_COLOR_THEMES.length];
                return (
                  <div
                    key={station.code}
                    onClick={() => setSelectedStation(station.code)}
                    className={`group bg-white rounded-lg border border-slate-200/90 ${theme.hoverBorder} ${theme.hoverShadow} p-5 sm:p-5.5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between min-h-[185px] hover:-translate-y-1 hover:shadow-md`}
                  >
                    {/* Station Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-200 group-hover:scale-105 shadow-2xs ${theme.iconBadge}`}
                        >
                          <Train className="w-6 h-6 stroke-[2.2]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            className={`text-base font-bold text-slate-900 ${theme.titleHover} transition-colors tracking-tight truncate`}
                            title={station.name}
                          >
                            {station.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 truncate font-medium">
                            {station.state ? `${station.state} • ` : ''}
                            {station.zone || station.division || 'IRCTC Network'}
                          </p>
                        </div>
                      </div>

                      {/* Station Code Badge (Top-Right: High-contrast, bold, uncongested) */}
                      <div className="shrink-0">
                        <span
                          className="inline-flex items-center justify-center font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-md bg-slate-900 text-white shadow-2xs group-hover:bg-blue-600 transition-colors"
                          title={`Station Code: ${station.code}`}
                        >
                          {station.code}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Status & View Outlets */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        {count > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded-md shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{count} {count === 1 ? 'outlet live' : 'outlets live'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-md">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            <span>0 registered</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/outlets/${station.code}/new`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-white hover:bg-blue-600 border border-slate-200/90 hover:border-blue-600 rounded-md transition-all shadow-2xs"
                          title={`Add outlet at ${station.code}`}
                        >
                          + Add
                        </Link>
                        <span className={`inline-flex items-center gap-1 font-bold text-xs ${theme.viewLink} transition-colors px-1 py-1`}>
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          CASE 3: UNIFIED FLAT TABLE VIEW (When user switches to Table)
          ======================================================== */}
      {selectedStation === 'ALL' && viewMode === 'table' && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-sm text-slate-700"
              style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}
            >
              <thead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 w-24">OUTLET ID</th>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 min-w-[200px]">OUTLET INFO</th>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 min-w-[140px]">TIMINGS &amp; PREP</th>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 min-w-[160px]">ORDER &amp; PAYMENT</th>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 w-36">WALLET</th>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 w-32">STATUS</th>
                  <th className="pb-2 pt-1 px-4.5 sm:px-5 w-28 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutlets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200 shadow-2xs"
                    >
                      <div className="max-w-md mx-auto space-y-1.5">
                        <p className="text-base font-bold text-slate-800">
                          {effectiveFilter === 'pending'
                            ? 'No Pending Outlets Found'
                            : effectiveFilter === 'prepaid'
                            ? 'No Prepaid-Only Outlets Found'
                            : effectiveFilter === 'inactive'
                            ? 'No Inactive Outlets Found'
                            : effectiveFilter === 'closed'
                            ? 'No Closed Outlets Found'
                            : effectiveFilter === 'archived' || effectiveFilter === 'deleted'
                            ? 'No Deleted Outlets Found'
                            : 'No Outlets Found'}
                        </p>
                        <p className="text-xs text-slate-400">
                          No outlets match your current search or station criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOutlets.map((outlet, idx) => renderOutletRow(outlet, idx, true))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Exact Results count and Pagination buttons */}
          <div className="px-4.5 py-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
            <div>
              Showing 1 to {filteredOutlets.length} of {filteredOutlets.length} results
            </div>

            {/* Pagination buttons with reduced border radius */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="px-2 py-1 rounded-md border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed font-medium text-xs"
              >
                &laquo;
              </button>
              <button
                type="button"
                disabled
                className="px-2 py-1 rounded-md border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed font-medium text-xs"
              >
                &lt;
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs shadow-2xs"
              >
                1
              </button>
              <button
                type="button"
                disabled
                className="px-2 py-1 rounded-md border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed font-medium text-xs"
              >
                &gt;
              </button>
              <button
                type="button"
                disabled
                className="px-2 py-1 rounded-md border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed font-medium text-xs"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          7 COMPLIANCE DOCUMENTS INSPECTION MODAL (Table 01)
          ========================================================== */}
      {inspectingOutletDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {inspectingOutletDocs.name}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      #{inspectingOutletDocs.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {getStationLabel(inspectingOutletDocs.stationCode)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    IRCTC eCatering v3 Specifications (Table 01) • 7 Mandatory Onboarding Documents
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/outlets/${inspectingOutletDocs.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                >
                  <span>Open Full Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectingOutletDocs(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Subheader Alert */}
            <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>IRCTC Outlet ID:</strong> <code className="font-mono">#{inspectingOutletDocs.id}</code> • Status: <strong>{inspectingOutletDocs.status || 'Active'}</strong>
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> 7 / 7 Documents Filed &amp; Verified
              </span>
            </div>

            {/* Modal Body: 7 Documents Grid */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getOutletComplianceDocs(inspectingOutletDocs).map((doc) => (
                  <div
                    key={doc.key}
                    className="bg-slate-50/70 rounded-md border border-slate-200 overflow-hidden hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail Preview */}
                      {doc.isImage && doc.preview ? (
                        <div className="relative h-32 w-full overflow-hidden bg-slate-100 group">
                          <img
                            src={doc.preview}
                            alt={doc.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setActiveDocPreview(doc)}
                              className="px-2.5 py-1 rounded-md bg-white/90 hover:bg-white text-slate-800 font-semibold text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Inspect Photo</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 w-full bg-linear-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-3 text-center border-b border-slate-200">
                          <div className="w-9 h-9 rounded-md bg-white shadow-xs flex items-center justify-center text-blue-600 mb-1">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700 truncate max-w-[180px]">
                            {doc.filename}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{doc.size}</span>
                        </div>
                      )}

                      {/* Body Content */}
                      <div className="p-3 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{doc.title}</h4>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{doc.desc}</p>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{doc.category}</span>
                      <button
                        type="button"
                        onClick={() => setActiveDocPreview(doc)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Official IRCTC Table 01 Documentation Dossier
              </span>
              <button
                type="button"
                onClick={() => setInspectingOutletDocs(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          FULL IMAGE LIGHTBOX
          ========================================================== */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{activeDocPreview.title}</h4>
                <span className="text-xs text-slate-400 font-mono">{activeDocPreview.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDocPreview(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[70vh] overflow-auto">
              {activeDocPreview.isImage && activeDocPreview.preview ? (
                <img
                  src={activeDocPreview.preview}
                  alt={activeDocPreview.title}
                  className="max-h-[60vh] max-w-full rounded-md shadow-md object-contain"
                />
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h5 className="font-semibold text-slate-800 text-sm">{activeDocPreview.filename}</h5>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Verified statutory certificate filed under IRCTC Table 01 specifications.
                  </p>
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 bg-white border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setActiveDocPreview(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
