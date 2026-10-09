import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  AlertCircle,
  Save,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Button from '../ui/Button';
import { useOutlets } from '../../context/OutletContext';

export default function OutletForm({
  initialData = null,
  mode = 'create', // 'create' | 'edit'
  defaultStationCode = '',
  defaultVendorId = '',
}) {
  const navigate = useNavigate();
  const { stations, vendors, createOutlet, updateOutlet } = useOutlets();

  // Find preselected station
  const preselectedStation =
    stations.find(
      (s) =>
        s.code.toUpperCase() ===
        (initialData?.stationCode || defaultStationCode || '').toUpperCase()
    ) || stations[0];

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    id: initialData?.id || '',
    category: initialData?.category || 'Multi-Cuisine & Fast Food',
    vendorId:
      initialData?.vendorId ||
      defaultVendorId ||
      (vendors[0]?.id || 'VND-001'),
    stationCode:
      initialData?.stationCode || preselectedStation?.code || 'BRC',
    stationName:
      initialData?.stationName || preselectedStation?.name || 'Vadodara',
    description: initialData?.description || '',

    // Contact
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: initialData?.city || preselectedStation?.city || '',
    state: initialData?.state || preselectedStation?.state || '',
    pincode: initialData?.pincode || '',

    // Operations
    openingTime: initialData?.openingTime || '07:00',
    closingTime: initialData?.closingTime || '23:00',
    prepTime: initialData?.prepTime ?? 20,
    minOrderValue: initialData?.minOrderValue ?? 150,
    status: initialData?.status || 'Active',

    // Payments
    paymentModes: {
      cod: initialData?.paymentModes?.cod ?? true,
      prepaid: initialData?.paymentModes?.prepaid ?? true,
    },

    // Wallet
    wallet: {
      balance: initialData?.wallet?.balance ?? 10000,
      threshold: initialData?.wallet?.threshold ?? 4000,
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync station name when stationCode changes
  const handleStationChange = (code) => {
    const selected = stations.find((s) => s.code === code);
    setFormData((prev) => ({
      ...prev,
      stationCode: code,
      stationName: selected ? selected.name : prev.stationName,
      city: selected ? selected.city : prev.city,
      state: selected ? selected.state : prev.state,
    }));
  };

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error on edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Nested payment handler
  const handlePaymentToggle = (modeKey) => {
    setFormData((prev) => {
      const nextPayment = {
        ...prev.paymentModes,
        [modeKey]: !prev.paymentModes[modeKey],
      };
      return {
        ...prev,
        paymentModes: nextPayment,
      };
    });
    if (errors.paymentModes) {
      setErrors((prev) => ({ ...prev, paymentModes: null }));
    }
  };

  // Nested wallet handler
  const handleWalletChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        [field]: Number(value) || 0,
      },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Form Validation
  const validate = () => {
    const errs = {};

    // Basic
    if (!formData.name.trim()) errs.name = 'Outlet name is required';
    if (!formData.category.trim()) errs.category = 'Outlet category is required';
    if (!formData.vendorId) errs.vendorId = 'Please select a vendor business entity';
    if (!formData.stationCode) errs.stationCode = 'Please select a railway station';

    // Contact
    if (!formData.contactPerson.trim())
      errs.contactPerson = 'Contact person name is required';

    const phoneDigits = String(formData.phone).replace(/\D/g, '');
    if (!phoneDigits) {
      errs.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      errs.phone = 'Phone number must be a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim())
      errs.address = 'Street/Platform address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';

    const pinStr = String(formData.pincode).trim();
    if (!pinStr) {
      errs.pincode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(pinStr)) {
      errs.pincode = 'Postal code must be 6 digits';
    }

    // Operating
    if (!formData.openingTime) errs.openingTime = 'Opening time is required';
    if (!formData.closingTime) errs.closingTime = 'Closing time is required';
    if (Number(formData.prepTime) <= 0)
      errs.prepTime = 'Preparation time must be greater than 0';
    if (Number(formData.minOrderValue) < 0)
      errs.minOrderValue = 'Minimum order value cannot be negative';

    // Payment Modes
    if (!formData.paymentModes.cod && !formData.paymentModes.prepaid) {
      errs.paymentModes =
        'At least one payment mode (COD or Prepaid) must be enabled';
    }

    // Wallet
    if (Number(formData.wallet.threshold) < 0) {
      errs.threshold = 'Wallet threshold cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit') {
        await updateOutlet(initialData.id, formData);
        navigate(`/outlets/${initialData.id}`);
      } else {
        await createOutlet(formData);
        navigate(`/outlets/station/${formData.stationCode}`);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      navigate(`/outlets/${initialData.id}`);
    } else if (defaultStationCode) {
      navigate(`/outlets/station/${defaultStationCode}`);
    } else {
      navigate('/outlets');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* 1. Basic Information & Vendor Assignment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Basic Information & Vendor Assignment
            </h2>
            <p className="text-xs text-slate-500">
              Outlet identity, primary category, associated business vendor, and railway station
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Outlet Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">
              Outlet Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Havmor Express Kitchen"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Vendor Assignment Dropdown */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Associated Business Vendor</span>
                <span className="text-rose-500">*</span>
              </label>
              {formData.vendorId && (
                <a
                  href={`/outlets/vendors/${formData.vendorId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Open Vendor Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <select
              name="vendorId"
              value={formData.vendorId}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer font-medium ${
                errors.vendorId
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
              }`}
            >
              <option value="">-- Select Registered Vendor Business Entity --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName} ({v.id}) - {v.city}, {v.state} [{v.status}]
                </option>
              ))}
            </select>
            {errors.vendorId && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.vendorId}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Each outlet must belong to exactly one registered vendor entity. Orders & earnings roll up to this vendor.
            </p>
          </div>

          {/* Outlet ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Outlet ID
              <span className="text-slate-400 font-normal ml-1">
                {mode === 'edit' ? '(Fixed)' : '(Auto-generated if empty)'}
              </span>
            </label>
            <input
              type="text"
              name="id"
              disabled={mode === 'edit'}
              value={formData.id}
              onChange={handleChange}
              placeholder={`e.g. OLF-${formData.stationCode}-005`}
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all disabled:opacity-60"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Outlet Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer ${
                errors.category
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
              }`}
            >
              <option value="Multi-Cuisine & Fast Food">Multi-Cuisine & Fast Food</option>
              <option value="Pure Veg & Regional">Pure Veg & Regional</option>
              <option value="North Indian & Mughlai">North Indian & Mughlai</option>
              <option value="South Indian">South Indian</option>
              <option value="Bakery & Beverages">Bakery & Beverages</option>
              <option value="Breakfast & Snacks">Breakfast & Snacks</option>
              <option value="Biryani & Kebabs">Biryani & Kebabs</option>
            </select>
            {errors.category && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Station Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Railway Station <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.stationCode}
              onChange={(e) => handleStationChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer font-medium"
            >
              {stations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) - {s.state}
                </option>
              ))}
            </select>
          </div>

          {/* Station Code Badge preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Station Code</label>
            <div className="px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-semibold flex items-center justify-between">
              <span>{formData.stationCode}</span>
              <span className="text-xs font-sans text-slate-500">{formData.stationName}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of meals, specialty dishes, or kitchen certifications..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Contact & Location</h2>
            <p className="text-xs text-slate-500">
              Manager credentials and physical platform address
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Contact Person */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Contact Person <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Rajesh Mehta"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.contactPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.contactPerson && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.contactPerson}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Phone Number (10 digits) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9825123456"
              maxLength={10}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="outlet@olfstores.in"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-slate-700">
              Platform Address / Shop Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Platform 1, Near Escalator Exit, Vadodara Junction"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.address && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.address}
              </p>
            )}
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Vadodara"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.city && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.city}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Gujarat"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.state ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.state && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.state}
              </p>
            )}
          </div>

          {/* Postal Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Postal Code (PIN) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength={6}
              placeholder="390002"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                errors.pincode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.pincode && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.pincode}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Operating Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Operating Information</h2>
            <p className="text-xs text-slate-500">
              Kitchen operating schedule, lead times, and active status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Opening Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Opening Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              name="openingTime"
              value={formData.openingTime}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
            />
          </div>

          {/* Closing Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Closing Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              name="closingTime"
              value={formData.closingTime}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
            />
          </div>

          {/* Prep Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Prep Time (mins) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="prepTime"
              min="5"
              max="120"
              value={formData.prepTime}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                errors.prepTime ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.prepTime && (
              <p className="text-xs text-rose-600 mt-1">{errors.prepTime}</p>
            )}
          </div>

          {/* Minimum Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Min Order (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="minOrderValue"
              min="0"
              step="10"
              value={formData.minOrderValue}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                errors.minOrderValue ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.minOrderValue && (
              <p className="text-xs text-rose-600 mt-1">{errors.minOrderValue}</p>
            )}
          </div>

          {/* Outlet Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Outlet Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium cursor-pointer"
            >
              <option value="Active">Active (Accepting)</option>
              <option value="Pending">Pending Review</option>
              <option value="Inactive">Inactive (Paused)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Payment & Wallet Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Payment Modes</h2>
              <p className="text-xs text-slate-500">
                Customer checkout methods supported by this outlet
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.paymentModes.cod}
                onChange={() => handlePaymentToggle('cod')}
                className="mt-0.5 h-4 w-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Cash on Delivery (COD)
                </span>
                <span className="text-slate-500">
                  Passenger pays the outlet delivery executive on coach arrival.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.paymentModes.prepaid}
                onChange={() => handlePaymentToggle('prepaid')}
                className="mt-0.5 h-4 w-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Prepaid / Online Payments
                </span>
                <span className="text-slate-500">
                  Accept UPI, Cards, and Netbanking via IRCTC / OLF gateway.
                </span>
              </div>
            </label>

            {errors.paymentModes && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.paymentModes}
              </p>
            )}
          </div>
        </div>

        {/* Wallet Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Wallet Configuration</h2>
              <p className="text-xs text-slate-500">
                Operating balance and safety threshold in Indian Rupees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Current Wallet Balance (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.wallet.balance}
                onChange={(e) => handleWalletChange('balance', e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Wallet Threshold (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.wallet.threshold}
                onChange={(e) => handleWalletChange('threshold', e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                  errors.threshold ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.threshold && (
                <p className="text-xs text-rose-600 mt-1">{errors.threshold}</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 leading-relaxed">
            When balance falls below the threshold, the outlet is flagged with a Low Balance
            warning in admin reports and notified for top-up.
          </div>
        </div>
      </div>

      {/* 5. Section F: Integration Information */}
      <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold">IRCTC Integration Notice</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              IRCTC integration will be connected in a future backend phase. Partner credentials and push sync hooks are reserved.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 shrink-0">
          Not Connected
        </span>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          leftIcon={Save}
          loading={isSubmitting}
        >
          {mode === 'edit' ? 'Update Outlet' : 'Save Outlet'}
        </Button>
      </div>
    </form>
  );
}
