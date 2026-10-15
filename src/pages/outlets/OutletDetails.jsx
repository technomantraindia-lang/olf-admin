import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw,
  Settings,
  UtensilsCrossed,
  FileCheck,
  FileText,
  Camera,
  CheckCircle,
  Eye,
  X,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import { getFssaiStatus, getOutletComplianceDocs, outletService, BACKEND_URL } from '../../services/outletService';
import OutletMenuTab from '../../components/outlets/OutletMenuTab';

export default function OutletDetails() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const { outlets, stations, updateOutlet, deleteOutlet } = useOutlets();
  const [outlet, setOutlet] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [appDetails, setAppDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('params'); // 'params' | 'menu' | 'docs'
  const [previewDocModal, setPreviewDocModal] = useState(null);

  const fetchLiveStatus = async (stnCode) => {
    setIsSyncing(true);
    try {
      const synced = await outletService.syncOutletWithIRCTC(outletId, stnCode);
      if (synced) {
        setOutlet((prev) => (prev ? { ...prev, ...synced } : synced));
      }

      // Fetch application metadata & documents from backend
      const activeAppId = synced?.applicationId || outlet?.applicationId;
      if (activeAppId) {
        try {
          const appRes = await fetch(`${BACKEND_URL}/api/applications/${activeAppId}`);
          const appData = await appRes.json();
          if (appData?.result?.application) {
            const app = appData.result.application;
            setAppDetails(app);

            const currentRecord = outlets.find((o) => String(o.id).toUpperCase() === String(outletId).toUpperCase());
            if (app.status === 'APPROVED' && currentRecord && currentRecord.status !== 'APPROVED') {
              await updateOutlet(outletId, {
                status: 'APPROVED',
                approvalStatus: 'APPROVED',
                listed: synced?.listed !== undefined ? synced.listed : (currentRecord.listed !== false),
              }, true);
            } else if (app.status === 'REJECTED' && currentRecord && currentRecord.status !== 'REJECTED') {
              await updateOutlet(outletId, {
                status: 'REJECTED',
                approvalStatus: 'REJECTED',
                listed: false,
              }, true);
            }
          }
        } catch (err) {}
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const found = outlets.find((o) => String(o.id).toUpperCase() === String(outletId).toUpperCase());
    if (found) {
      setOutlet(found);
      fetchLiveStatus(found.stationCode);
    }

    // Auto-sync when user switches tabs from Port 5000 back to OLF Admin
    const handleFocus = () => {
      const current = outlets.find((o) => String(o.id).toUpperCase() === String(outletId).toUpperCase());
      if (current) fetchLiveStatus(current.stationCode);
    };
    window.addEventListener('focus', handleFocus);

    // Live background polling every 3 seconds while viewing
    const timer = setInterval(() => {
      const current = outlets.find((o) => String(o.id).toUpperCase() === String(outletId).toUpperCase());
      if (current) fetchLiveStatus(current.stationCode);
    }, 3000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(timer);
    };
  }, [outletId]);

  if (!outlet) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Outlet Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">
          No outlet with ID <code className="font-mono text-slate-700">{outletId}</code> exists.
        </p>
        <Link
          to="/outlets"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition"
        >
          Return to Outlets List
        </Link>
      </div>
    );
  }

  const station = stations.find((s) => s.code.toUpperCase() === (outlet.stationCode || '').toUpperCase());
  const isPureVeg = outlet.mealType === 'PURE_VEG';
  const isListed = outlet.listed !== false;
  const fssai = getFssaiStatus(outlet.fssaiNo, outlet.fssaiValidUpto);
  const isApproved =
    outlet.status === 'APPROVED' ||
    appDetails?.status === 'APPROVED' ||
    outlet.approvalStatus === 'APPROVED';

  const handleToggleListing = async () => {
    try {
      const nextListed = !isListed;
      await updateOutlet(outlet.id, {
        listed: nextListed,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
      });
      setOutlet((prev) => ({ ...prev, listed: nextListed, status: 'APPROVED' }));
    } catch (err) {
      console.error('Failed to toggle listing:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete outlet "${outlet.name}" (${outlet.id})?`)) {
      try {
        await deleteOutlet(outlet.id, true);
        navigate('/outlets');
      } catch (err) {
        console.error('Failed to delete outlet:', err);
      }
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/outlets"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Outlets Management</span>
        </Link>
      </div>

      {/* Header Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {outlet.name}
              </h1>
              {isApproved || outlet.irctcOutletId || outlet.id ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>IRCTC Outlet ID: {outlet.irctcOutletId || outlet.outletId || outlet.id}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                  <span>IRCTC ID: Awaiting Approval (App: {outlet.applicationId})</span>
                </span>
              )}
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isListed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isListed ? '● Listed on IRCTC' : '○ Delisted'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {station ? `${station.name} (${station.code})` : outlet.stationCode} • {station?.zone || 'Indian Railways'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchLiveStatus(outlet.stationCode)}
            disabled={isSyncing}
            title="Fetch real-time listing & operational status from IRCTC"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : 'text-slate-500'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync with IRCTC'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleListing}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              isListed
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            {isListed ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-rose-600" />}
            <span>{isListed ? 'Listed on IRCTC' : 'Delisted'}</span>
          </button>

          <Link
            to={`/outlets/${outlet.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
            title="Delete Outlet"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* IRCTC Kitchen Shutter De-listed Alert Banner */}
      {!isListed && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-950 text-sm">
                Kitchen Shutter Dropped / De-listed on IRCTC 🔴
              </h4>
              <p className="text-rose-800 mt-0.5 leading-relaxed">
                This outlet has been de-listed on IRCTC (Port 5000 / Rail Network). Train passengers cannot view this restaurant or place food orders until it is re-opened.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleListing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shrink-0 shadow-xs cursor-pointer"
          >
            <ToggleRight className="w-4 h-4" />
            <span>Open Shutter (Go Live)</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('params')}
          className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'params'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Operational Parameters & Station Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food Menu & Catalog</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'menu' ? 'bg-blue-700 text-blue-100' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Live Menu
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docs')}
          className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Compliance Documents &amp; Photos</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'docs' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'
            }`}
          >
            7 Docs
          </span>
        </button>
      </div>

      {/* ==========================================================
          OPERATIONAL PARAMETERS & SCHEDULE
          ========================================================== */}
      {activeTab === 'params' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Essential Attributes */}
          <div className="md:col-span-2 space-y-6">
            {/* Statutory Compliance (FSSAI, Proximity, Cutoff) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>IRCTC Statutory & Operational Parameters</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">FSSAI License & Status</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        fssai.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : fssai.status === 'EXPIRING_SOON'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          fssai.status === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : fssai.status === 'EXPIRING_SOON'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {fssai.label}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-900 tracking-wide block">
                    {outlet.fssaiNo || 'Not Configured'}
                  </span>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                    <span>Valid upto: <strong className="text-slate-800">{outlet.fssaiValidUpto || 'Indefinite'}</strong></span>
                    {fssai.daysRemaining !== null && (
                      <span
                        className={`font-medium ${
                          fssai.daysRemaining > 30
                            ? 'text-emerald-700'
                            : fssai.daysRemaining >= 0
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {fssai.daysRemaining >= 0 ? `${fssai.daysRemaining} days left` : 'Expired'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block mb-1">Station Proximity Distance</span>
                  <span className="text-sm font-bold text-slate-900">
                    {outlet.distanceInMeters ? `${(outlet.distanceInMeters / 1000).toFixed(1)} km` : '—'}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({outlet.distanceInMeters || 0} meters)
                    </span>
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    IRCTC Rule: Must be ≤ 7,500m (7.5 km)
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block mb-1">Booking Cut-off Window</span>
                  <span className="text-sm font-bold text-slate-900">
                    {outlet.bookingCutoff || 60} Minutes
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Required lead time before train platform arrival
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block mb-1">Minimum Order Amount</span>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{outlet.minOrderAmount ?? 0}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Applicable across all coach deliveries
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Hours & Location */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Service Schedule & Address</span>
              </h3>

              <div className="space-y-3 pt-1 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Operating Hours</span>
                  <span className="font-semibold text-slate-900">
                    {outlet.schedules?.[0]?.startTime || outlet.startTime || '08:00'} — {outlet.schedules?.[0]?.endTime || outlet.endTime || '22:00'}
                  </span>
                </div>

                {outlet.weeklyClosingDays && outlet.weeklyClosingDays.length > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 text-xs">Weekly Closing Days</span>
                    <span className="font-semibold text-rose-600 text-xs">
                      {outlet.weeklyClosingDays.join(', ')}
                    </span>
                  </div>
                )}

                {outlet.deliveryFeeLimits && outlet.deliveryFeeLimits.length > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 text-xs">Delivery Fee Limits</span>
                    <span className="text-xs font-medium text-purple-700">
                      {outlet.deliveryFeeLimits.map((l) => `₹${l.amount} (₹${l.fee} Fee)`).join(' • ')}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Address</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">
                    {outlet.address || 'Station Premises'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Contact Mobile</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {outlet.contact?.mobile || outlet.phone || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Contact Email</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {outlet.contact?.email || outlet.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Vendor & Tag Information */}
          <div className="space-y-6">
            {/* Vendor Partner Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Vendor Partnership</span>
              </h3>

              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="font-bold text-slate-900 text-base">
                  {outlet.vendorName || `Vendor #${outlet.vendorId}`}
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  Numeric Vendor ID: <span className="font-bold text-blue-700">{outlet.vendorId}</span>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/outlets/vendors/${outlet.vendorId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>View Vendor Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Classification Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                Dietary & Payment Rules
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Meal Classification:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      isPureVeg
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isPureVeg ? 'Pure Veg' : 'Veg & Non-Veg'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Payment Modes:</span>
                  <span className="font-semibold text-slate-800">
                    {outlet.prepaid ? 'Prepaid Only' : 'Prepaid & COD'}
                  </span>
                </div>

                {outlet.gstNo && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono">
                    <span className="text-slate-600 font-sans">GSTIN:</span>
                    <span className="font-bold text-slate-800">{outlet.gstNo}</span>
                  </div>
                )}

                {(outlet.panNo || outlet.panNumber) && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono">
                    <span className="text-slate-600 font-sans">Business PAN:</span>
                    <span className="font-bold text-slate-800">{outlet.panNo || outlet.panNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          FOOD MENU & CATALOG
          ========================================================== */}
      {activeTab === 'menu' && (
        <OutletMenuTab outlet={outlet} isApproved={isApproved} />
      )}

      {/* ==========================================================
          COMPLIANCE DOCUMENTS & FACILITY PHOTOS
          ========================================================== */}
      {activeTab === 'docs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mandatory IRCTC Compliance Documents &amp; Inspection Photos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory FSSAI food licenses, commercial tax registrations, and kitchen hygiene audit photos.
              </p>
            </div>
            <Link
              to={`/outlets/${outlet.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Update Documents</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getOutletComplianceDocs(outlet).map((doc) => {
              return (
                <div
                  key={doc.key}
                  className="bg-white rounded-xl border border-slate-200 p-4 transition-all shadow-2xs hover:border-slate-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                          {doc.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight mt-0.5 truncate">
                          {doc.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        Verified ✓
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3">{doc.desc}</p>

                    {/* Preview Area */}
                    {doc.isImage && doc.preview ? (
                      <div
                        onClick={() => setPreviewDocModal(doc)}
                        className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100 cursor-pointer group"
                      >
                        <img
                          src={doc.preview}
                          alt={doc.title}
                          className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1.5 text-xs font-medium">
                          <Eye className="w-4 h-4" />
                          <span>View Full</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-medium text-slate-800 truncate">
                            {doc.filename}
                          </div>
                          <div className="text-[10px] text-slate-400">{doc.size} • PDF Document</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {doc.size || 'Standard File'}
                    </span>
                    {doc.isImage && doc.preview ? (
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal(doc)}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Available</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewDocModal.title}</h3>
                <p className="text-xs text-slate-400">{previewDocModal.category} • {previewDocModal.filename}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewDocModal.preview}
                alt={previewDocModal.title}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
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
