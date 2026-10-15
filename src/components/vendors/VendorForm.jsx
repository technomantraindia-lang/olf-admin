import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutlets } from '../../context/OutletContext';

export default function VendorForm({
  initialData = null,
  mode = 'create', // 'create' | 'edit'
}) {
  const navigate = useNavigate();
  const { createVendor, updateVendor } = useOutlets();

  const [formData, setFormData] = useState({
    contactPerson: initialData?.contactPerson || initialData?.businessName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',
    notes: initialData?.notes || '',
    panNumber: initialData?.panNumber || '',
    gstin: initialData?.gstin || '',

    // Background fields for system stability
    businessName: initialData?.businessName || initialData?.contactPerson || '',
    legalName: initialData?.legalName || initialData?.contactPerson || '',
    brandName: initialData?.brandName || initialData?.contactPerson || '',
    status: initialData?.status || 'Active',
    id: initialData?.id || '',
    commissionRate: initialData?.commissionRate ?? 15,
    payoutCycle: initialData?.payoutCycle || 'Weekly Payment',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanVal = value;

    if (name === 'phone') {
      cleanVal = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      cleanVal = value.replace(/\D/g, '').slice(0, 6);
    } else if (name === 'panNumber') {
      cleanVal = value.toUpperCase().slice(0, 10);
    } else if (name === 'gstin') {
      cleanVal = value.toUpperCase().slice(0, 15);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: cleanVal };
      if (name === 'contactPerson') {
        updated.businessName = cleanVal;
        updated.legalName = cleanVal;
        updated.brandName = cleanVal;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.contactPerson.trim()) {
      errs.contactPerson = 'Please enter contact person name';
    }
    const phoneDigits = String(formData.phone).replace(/\D/g, '');
    if (!phoneDigits) {
      errs.phone = 'Mobile number is required';
    } else if (phoneDigits.length !== 10) {
      errs.phone = 'Mobile number must be 10 digits';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errs.state = 'State is required';
    }
    const pinStr = String(formData.pincode).trim();
    if (!pinStr) {
      errs.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(pinStr)) {
      errs.pincode = 'PIN code must be 6 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const vendorName = formData.contactPerson.trim();
    const payload = {
      ...formData,
      contactPerson: vendorName,
      businessName: formData.businessName || vendorName,
      legalName: formData.legalName || vendorName,
      brandName: formData.brandName || vendorName,
    };

    try {
      if (mode === 'edit') {
        await updateVendor(initialData.id, payload);
        navigate(`/outlets/vendors/${initialData.id}`);
      } else {
        const created = await createVendor(payload);
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 sm:p-7 space-y-6">
        {/* Contact Info (Row 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Owner / Contact Person Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Ramesh Sharma"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 ${
                errors.contactPerson ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.contactPerson && (
              <p className="text-xs text-rose-600 mt-1">{errors.contactPerson}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number (10 digits) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength={10}
              className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 ${
                errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@balajifoods.com"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 ${
                errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Address (Row 2) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Office / Registered Address <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Shop 12, Main Market, Station Road, Opp. Platform 1 Entry"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900"
          />
        </div>

        {/* City, State, PIN (Row 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Bhopal"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 ${
                errors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.city && (
              <p className="text-xs text-rose-600 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Madhya Pradesh"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 ${
                errors.state ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.state && (
              <p className="text-xs text-rose-600 mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Postal Code (PIN - 6 digits) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength={6}
              placeholder="462001"
              className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 ${
                errors.pincode ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.pincode && (
              <p className="text-xs text-rose-600 mt-1">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Internal Notes (Row 4) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Internal Administrative Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Master catering contract approved by Railway Board. Direct bank RTGS agreement signed..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-900 resize-y"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          {mode === 'edit' ? 'Update Vendor' : 'Register Vendor'}
        </button>
      </div>
    </form>
  );
}
