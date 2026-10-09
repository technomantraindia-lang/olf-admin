import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Store,
  MapPin,
  Clock,
  Timer,
  CreditCard,
  Banknote,
  Wallet,
  Phone,
  Mail,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ExternalLink,
  Train,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import NotFound from '../NotFound';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function OutletDetails() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const { getOutlet, getVendor, deleteOutlet, updateOutlet } = useOutlets();
  const outlet = getOutlet(outletId);
  const vendor = outlet ? getVendor(outlet.vendorId) : null;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  if (!outlet) {
    return (
      <NotFound
        message={`Outlet with ID "${outletId}" was not found or has been removed from the platform.`}
      />
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOutlet(outlet.id, false);
      setIsDeleteModalOpen(false);
      navigate(`/outlets/station/${outlet.stationCode}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (newStatus) => {
    setIsTogglingStatus(true);
    try {
      await updateOutlet(outlet.id, { status: newStatus });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const isLowBalance = (outlet.wallet?.balance ?? 0) < (outlet.wallet?.threshold ?? 0);
  const balancePercentage = Math.min(
    Math.round(((outlet.wallet?.balance ?? 0) / ((outlet.wallet?.threshold ?? 1) * 2)) * 100),
    100
  );

  return (
    <div className="space-y-6 w-full">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between text-xs">
        <Link
          to={`/outlets/station/${outlet.stationCode}`}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {outlet.stationName} ({outlet.stationCode}) Outlets</span>
        </Link>

        <span className="text-slate-400">
          Last modified: {formatDate(outlet.updatedAt)}
        </span>
      </div>

      {/* Main Outlet Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-900 text-white rounded-md tracking-wider">
                {outlet.id}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {outlet.name}
              </h1>
              <StatusBadge status={outlet.status} size="md" />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {outlet.category}
              </span>
              <span>•</span>
              <Link
                to={`/outlets/station/${outlet.stationCode}`}
                className="flex items-center gap-1 text-slate-700 font-medium hover:text-emerald-700 hover:underline"
              >
                <Train className="w-3.5 h-3.5 text-slate-400" />
                {outlet.stationName} Junction ({outlet.stationCode})
              </Link>
              <span>•</span>
              {vendor && (
                <>
                  <Link
                    to={`/outlets/vendors/${vendor.id}`}
                    className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    title="View Vendor Profile"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vendor: {vendor.businessName}</span>
                  </Link>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {outlet.city}, {outlet.state}
              </span>
            </div>

            {outlet.description && (
              <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 max-w-3xl leading-relaxed">
                {outlet.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/outlets/${outlet.id}/edit`}>
              <Button variant="secondary" size="sm" leftIcon={Edit2}>
                Edit Outlet
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              leftIcon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Status Control Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/60 p-3 rounded-lg">
          <span className="font-medium text-slate-600">
            Quick Status Update:
          </span>
          <div className="flex items-center gap-2">
            {outlet.status !== 'Active' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleToggleStatus('Active')}
                loading={isTogglingStatus}
                className="text-xs py-1"
              >
                Set Active
              </Button>
            )}
            {outlet.status !== 'Inactive' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleToggleStatus('Inactive')}
                loading={isTogglingStatus}
                className="text-xs py-1"
              >
                Pause (Inactive)
              </Button>
            )}
            {outlet.status !== 'Closed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus('Closed')}
                loading={isTogglingStatus}
                className="text-xs py-1 text-rose-600 border-rose-200"
              >
                Mark Closed
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Key Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Associated Business Vendor Card */}
        {vendor ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Vendor Business Entity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Parent operating company managing this kitchen
                  </p>
                </div>
              </div>

              <Link to={`/outlets/vendors/${vendor.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={ExternalLink}
                  className="text-xs text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                >
                  View Vendor Profile
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-1">Company Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {vendor.businessName}
                </span>
                <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                  ID: {vendor.id}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-1">Business Category</span>
                <span className="font-semibold text-slate-800">
                  {vendor.category}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Status: {vendor.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-1">Authorized Contact</span>
                <span className="font-semibold text-slate-800">
                  {vendor.contactPerson}
                </span>
                <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                  {vendor.phone}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-1">Corporate HQ</span>
                <span className="font-medium text-slate-800 truncate block">
                  {vendor.city}, {vendor.state}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                  PIN: {vendor.pincode}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Wallet & Financial Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Wallet Health</h3>
                <p className="text-[11px] text-slate-500">Deposit & order processing credit</p>
              </div>
            </div>
            {isLowBalance ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                Low Balance
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Healthy
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500">Available Balance</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(outlet.wallet?.balance)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500">Minimum Threshold</span>
              <p className="text-xl font-bold text-slate-700 mt-1">
                {formatCurrency(outlet.wallet?.threshold)}
              </p>
            </div>
          </div>

          {/* Visual health bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Threshold Coverage</span>
              <span className="font-semibold text-slate-700">
                {((outlet.wallet?.balance ?? 0) / (outlet.wallet?.threshold || 1)).toFixed(1)}x
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isLowBalance ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(10, balancePercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Operating & Kitchen Rules */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Operating & Delivery Schedule</h3>
              <p className="text-[11px] text-slate-500">Passenger booking parameters</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Kitchen Operational Hours
              </span>
              <span className="font-bold text-slate-900 font-mono">
                {outlet.openingTime} - {outlet.closingTime}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-slate-400" />
                Average Preparation Time
              </span>
              <span className="font-bold text-slate-900">
                {outlet.prepTime} minutes
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-slate-400" />
                Minimum Passenger Order Value
              </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(outlet.minOrderValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Contact & Management</h3>
              <p className="text-[11px] text-slate-500">Authorized outlet point of contact</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Manager / Owner:</span>
              <span className="font-semibold text-slate-800">{outlet.contactPerson}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-semibold text-slate-800 font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {outlet.phone}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Email Address:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {outlet.email}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Address & Payment Modes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Address & Payments</h3>
              <p className="text-[11px] text-slate-500">Location and payment acceptance</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Station Address:</span>
              <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {outlet.address}, {outlet.city}, {outlet.state} - {outlet.pincode}
                </span>
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Payment Modes Accepted:</span>
              <div className="flex items-center gap-2">
                {outlet.paymentModes?.cod ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                    <Banknote className="w-3 h-3 text-emerald-600" />
                    Cash on Delivery (Enabled)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-500 line-through">
                    Cash on Delivery (Disabled)
                  </span>
                )}

                {outlet.paymentModes?.prepaid ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    Prepaid / Online (Enabled)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-500 line-through">
                    Prepaid / Online (Disabled)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IRCTC Compliance Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold">IRCTC e-Catering Ready</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Menu standards and packaging hygiene meet Indian Railway e-catering guidelines.
              Delivery to passenger coach seat is coordinated directly by this outlet.
            </p>
          </div>
        </div>
        <Link to={`/outlets/${outlet.id}/edit`}>
          <Button variant="secondary" size="sm">
            Configure Parameters
          </Button>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Outlet Deletion"
        description="Are you sure you want to delete this outlet?"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <strong>Action Notice:</strong> This will mark{' '}
              <strong>"{outlet.name}"</strong> as deleted in the system.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
