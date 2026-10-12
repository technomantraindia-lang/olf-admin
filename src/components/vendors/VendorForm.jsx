import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  FileCheck,
  FileText,
  AlertCircle,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import { useOutlets } from '../../context/OutletContext';

export default function VendorForm({
  initialData = null,
  mode = 'create', // 'create' | 'edit'
}) {
  const navigate = useNavigate();
  const { createVendor, updateVendor } = useOutlets();

  // Form State
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || '',
    id: initialData?.id || '',
    category: initialData?.category || 'Multi-Cuisine Quick Service',
    description: initialData?.description || '',
    status: initialData?.status || 'Active',
    registrationDate:
      initialData?.registrationDate || new Date().toISOString().slice(0, 10),

    // Contact
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',

    // Documents (Compliance Checklist)
    documents: initialData?.documents || [
      {
        id: 'DOC-1',
        name: 'FSSAI Central / State License',
        category: 'Food Safety',
        status: 'Verified',
        expiryDate: '2027-12-31',
      },
      {
        id: 'DOC-2',
        name: 'GSTIN Registration Certificate',
        category: 'Tax & Compliance',
        status: 'Verified',
        expiryDate: '2030-01-01',
      },
      {
        id: 'DOC-3',
        name: 'IRCTC Master Catering Agreement',
        category: 'Commercial Agreement',
        status: 'Verified',
        expiryDate: '2026-12-31',
      },
      {
        id: 'DOC-4',
        name: 'Kitchen Hygiene & Safety Audit',
        category: 'Quality & Audit',
        status: 'Pending Review',
        expiryDate: '2026-09-30',
      },
    ],

    // Notes
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Document verification toggle
  const handleDocumentStatusToggle = (docId, newStatus) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId ? { ...doc, status: newStatus } : doc
      ),
    }));
  };

  // Form Validation
  const validate = () => {
    const errs = {};

    // Business info
    if (formData.id && formData.id.trim()) {
      if (!/^\d+$/.test(formData.id.trim())) {
        errs.id = 'Vendor ID must contain numbers only (e.g. 1007)';
      }
    }
    if (!formData.businessName.trim()) {
      errs.businessName = 'Business name is required';
    }
    if (!formData.category.trim()) {
      errs.category = 'Vendor category is required';
    }

    // Contact info
    if (!formData.contactPerson.trim()) {
      errs.contactPerson = 'Contact person name is required';
    }

    const phoneDigits = String(formData.phone).replace(/\D/g, '');
    if (!phoneDigits) {
      errs.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      errs.phone = 'Phone number must be a valid 10-digit number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      errs.address = 'Business address is required';
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errs.state = 'State is required';
    }

    const pinStr = String(formData.pincode).trim();
    if (!pinStr) {
      errs.pincode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(pinStr)) {
      errs.pincode = 'Postal code must be 6 digits';
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
        await updateVendor(initialData.id, formData);
        navigate(`/outlets/vendors/${initialData.id}`);
      } else {
        const created = await createVendor(formData);
        navigate(`/outlets/vendors/${created.id}`);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      navigate(`/outlets/vendors/${initialData.id}`);
    } else {
      navigate('/outlets/vendors');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* 1. Section A: Business Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Business Information
            </h2>
            <p className="text-xs text-slate-500">
              Vendor registered legal entity, category, and operational standing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Business Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">
              Registered Business / Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Havmor Foods Private Limited"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.businessName
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
              }`}
            />
            {errors.businessName && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.businessName}
              </p>
            )}
          </div>

          {/* Vendor ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Vendor Identifier
              <span className="text-slate-400 font-normal ml-1">
                {mode === 'edit'
                  ? '(Fixed System Key)'
                  : '(Generated automatically if blank)'}
              </span>
            </label>
            <input
              type="text"
              name="id"
              inputMode="numeric"
              disabled={mode === 'edit'}
              value={formData.id}
              onChange={(e) => {
                // Only allow numbers
                const val = e.target.value.replace(/\D/g, '');
                handleChange({ target: { name: 'id', value: val } });
              }}
              placeholder="e.g. 1007 (Numeric only)"
              className={`w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all disabled:opacity-60 ${
                errors.id ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.id && (
              <p className="text-xs text-rose-500 font-medium">{errors.id}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Vendor Category <span className="text-rose-500">*</span>
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
              <option value="Multi-Cuisine Quick Service">
                Multi-Cuisine Quick Service
              </option>
              <option value="Regional & Multi-Cuisine">
                Regional & Multi-Cuisine
              </option>
              <option value="Regional Rajasthani Cuisine">
                Regional Rajasthani Cuisine
              </option>
              <option value="Mughlai & Biryani Specialists">
                Mughlai & Biryani Specialists
              </option>
              <option value="Regional Maharashtrian & Fast Food">
                Regional Maharashtrian & Fast Food
              </option>
              <option value="Pure Veg & Regional">Pure Veg & Regional</option>
              <option value="Bakery & Beverages">Bakery & Beverages</option>
              <option value="South Indian Specialty">
                South Indian Specialty
              </option>
            </select>
            {errors.category && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Vendor Operational Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium cursor-pointer"
            >
              <option value="Active">Active (Contracted & Operational)</option>
              <option value="Pending">Pending (Under Verification)</option>
              <option value="Inactive">Inactive (Suspended / Paused)</option>
              <option value="Archived">Archived (De-boarded)</option>
            </select>
          </div>

          {/* Registration Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Agreement / Registration Date
            </label>
            <input
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">
              Business Profile & Specialization
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Overview of commercial capabilities, regional kitchen setup, and meal delivery fleet..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Section B: Contact Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Authorized Contact & Office Address
            </h2>
            <p className="text-xs text-slate-500">
              Primary company officer credentials and corporate head office
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Contact Person */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Contact Person / Director <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Vikram Singhania"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.contactPerson
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
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
              Mobile Phone (10 digits) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9825011223"
              maxLength={10}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                errors.phone
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
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
              Official Corporate Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="corporate@havmorfoods.in"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.email
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Business Address */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-slate-700">
              Corporate Office Street Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Havmor House, 4th Floor, SG Highway, Bodakdev"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.address
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
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
              placeholder="e.g. Ahmedabad"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.city
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
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
                errors.state
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
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
              placeholder="380054"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono ${
                errors.pincode
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
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

      {/* 3. Section C: Business and Compliance Documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Statutory Compliance & Document Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Verify statutory licenses and agreements for railway e-catering compliance
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {formData.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>Category: {doc.category}</span>
                    <span>•</span>
                    <span>Valid until: {doc.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Status toggle buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDocumentStatusToggle(doc.id, 'Verified')
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    doc.status === 'Verified'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDocumentStatusToggle(doc.id, 'Pending Review')
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    doc.status === 'Pending Review'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDocumentStatusToggle(doc.id, 'Not Submitted')
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    doc.status === 'Not Submitted'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Missing
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-slate-400 italic">
          * Note: Document checklist and verification statuses are frontend demonstrations.
          Physical document uploads and automated validation will connect in the future backend.
        </p>
      </div>

      {/* 4. Section D: Internal Notes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Internal Administrative Notes
            </h2>
            <p className="text-xs text-slate-500">
              Confidential internal remarks visible only to OLF Operations administrators
            </p>
          </div>
        </div>

        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder="e.g. Master catering contract approved by Railway Board. Verified platform runner passes..."
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
        />
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
          {mode === 'edit' ? 'Update Vendor Profile' : 'Register Vendor'}
        </Button>
      </div>
    </form>
  );
}
