import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Building2,
  ShieldCheck,
  Clock,
  Leaf,
  UtensilsCrossed,
  Banknote,
  CreditCard,
  CheckCircle2,
  XCircle,
  Plus,
  Check,
  Sparkles,
  User,
  Phone,
  Mail,
  Hash,
  Upload,
  FileText,
  Camera,
  Image as ImageIcon,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import { generateOutletId, getFssaiStatus } from '../../services/outletService';

const COMPLIANCE_DOCS_CONFIG = [
  {
    key: 'fssaiCert',
    title: 'FSSAI License Certificate',
    category: 'Food Safety',
    desc: '14-digit central/state food safety license',
    icon: FileText,
    accept: '.pdf,image/*',
    isPhoto: false,
  },
  {
    key: 'gstCert',
    title: 'GSTIN Registration Certificate',
    category: 'Tax Registration',
    desc: '15-character commercial GST certificate',
    icon: FileText,
    accept: '.pdf,image/*',
    isPhoto: false,
  },
  {
    key: 'panCard',
    title: 'Business PAN Card',
    category: 'Corporate Identity',
    desc: 'Company or proprietor PAN card copy',
    icon: FileText,
    accept: '.pdf,image/*',
    isPhoto: false,
  },
  {
    key: 'outletFrontImage',
    title: 'Outlet Front Signage',
    category: 'Storefront Facade',
    desc: 'Exterior signage board & branding photo',
    icon: Camera,
    accept: 'image/*',
    isPhoto: true,
  },
  {
    key: 'kitchenAreaImage',
    title: 'Kitchen Cooking Area',
    category: 'Hygiene & Prep',
    desc: 'Commercial prep stations & cooking stoves',
    icon: Camera,
    accept: 'image/*',
    isPhoto: true,
  },
  {
    key: 'takeawayAreaImage',
    title: 'Takeaway Packaging Counter',
    category: 'Order Dispatch',
    desc: 'Meal packing, sealing & handover station',
    icon: Camera,
    accept: 'image/*',
    isPhoto: true,
  },
  {
    key: 'otherImages',
    title: 'Cold Storage & Infrastructure',
    category: 'Storage Infrastructure',
    desc: 'Deep freeze, ingredient racks & refrigeration',
    icon: ImageIcon,
    accept: 'image/*',
    isPhoto: true,
  },
];

export default function OutletForm({
  initialData = null,
  mode = 'create', // 'create' | 'edit'
  defaultStationCode = '',
  defaultVendorId = '',
}) {
  const navigate = useNavigate();
  const { stations, vendors, outlets, createOutlet, updateOutlet } = useOutlets();

  // Initial station determination
  const initialStation =
    initialData?.stationCode || defaultStationCode || stations[0]?.code || 'NDLS';

  // Form State: strictly Vendor Info, Basic Details, Business Details, Order Settings
  const [formData, setFormData] = useState({
    // 1. Vendor Info
    vendorId:
      initialData?.vendorId ||
      defaultVendorId ||
      (vendors.length > 0 ? String(vendors[0].id) : ''),

    // 2. Basic Details
    stationCode: initialStation,
    id:
      initialData?.id ||
      (mode === 'create' ? generateOutletId(initialStation, outlets) : ''),
    name: initialData?.name || '',
    address: initialData?.address || '',
    managerName: initialData?.contact?.name || initialData?.managerName || '',
    phone: initialData?.contact?.mobile || initialData?.phone || '',
    email: initialData?.contact?.email || initialData?.email || '',

    // 3. Business Details
    fssaiNo: initialData?.fssaiNo || '',
    fssaiValidUpto: initialData?.fssaiValidUpto || '',
    gstNo: initialData?.gstNo || initialData?.gstin || '',
    panNo: initialData?.panNo || initialData?.panNumber || initialData?.pan || '',
    mealType: initialData?.mealType === 'PURE_VEG' ? 'PURE_VEG' : 'NON_VEG',

    // 4. Order Settings
    bookingCutoff: initialData?.bookingCutoff ?? 30,
    minOrderAmount: initialData?.minOrderAmount ?? 0,
    distanceInMeters: initialData?.distanceInMeters ?? 250,
    startTime: initialData?.schedules?.[0]?.startTime || initialData?.startTime || '08:00',
    endTime: initialData?.schedules?.[0]?.endTime || initialData?.endTime || '22:00',
    prepaid:
      initialData?.prepaid === true || initialData?.paymentMode === 'PREPAID ONLY',
    paymentMode:
      initialData?.paymentMode ||
      (initialData?.prepaid ? 'PREPAID ONLY' : 'COD & PREPAID'),
    deliveryFeeLimits: Array.isArray(initialData?.deliveryFeeLimits)
      ? initialData.deliveryFeeLimits
      : [],
    weeklyClosingDays: Array.isArray(initialData?.weeklyClosingDays)
      ? initialData.weeklyClosingDays
      : [],
    status: initialData?.status || 'Active',
    listed: initialData?.listed !== false,
  });

  // 5. Compliance Documents & Kitchen Photos State
  const [documents, setDocuments] = useState(() => {
    const defaultDocs = {
      fssaiCert: null,
      gstCert: null,
      panCard: null,
      outletFrontImage: null,
      kitchenAreaImage: null,
      takeawayAreaImage: null,
      otherImages: null,
    };
    if (
      initialData?.documents &&
      typeof initialData.documents === 'object' &&
      !Array.isArray(initialData.documents)
    ) {
      return { ...defaultDocs, ...initialData.documents };
    }
    return defaultDocs;
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate Outlet ID on create mode when station changes
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      const activeStn =
        formData.stationCode || defaultStationCode || stations[0]?.code || 'NDLS';
      const autoId = generateOutletId(activeStn, outlets);
      setFormData((prev) => ({
        ...prev,
        stationCode: activeStn,
        id: autoId,
      }));
    }
  }, [formData.stationCode, defaultStationCode, stations, outlets, mode, initialData]);

  // Set default vendor if not set
  useEffect(() => {
    if (defaultVendorId && !initialData) {
      setFormData((prev) => ({ ...prev, vendorId: String(defaultVendorId) }));
    } else if (!formData.vendorId && vendors.length > 0) {
      setFormData((prev) => ({ ...prev, vendorId: String(vendors[0].id) }));
    }
  }, [defaultVendorId, vendors, initialData, formData.vendorId]);

  // Find currently selected vendor
  const selectedVendor = vendors.find(
    (v) => String(v.id) === String(formData.vendorId)
  );

  // Handle generic input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: finalVal };
      if (name === 'stationCode' && mode === 'create') {
        next.id = generateOutletId(finalVal, outlets);
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // State and handlers for Delivery Fee Limits and Weekly Closing Days
  const [deliveryInput, setDeliveryInput] = useState({ amount: '', fee: '' });

  const handleAddDeliveryFeeLimit = () => {
    if (deliveryInput.amount === '' && deliveryInput.fee === '') return;
    const amountVal = deliveryInput.amount !== '' ? Number(deliveryInput.amount) : 0;
    const feeVal = deliveryInput.fee !== '' ? Number(deliveryInput.fee) : 0;
    setFormData((prev) => ({
      ...prev,
      deliveryFeeLimits: [
        ...(prev.deliveryFeeLimits || []),
        { amount: amountVal, fee: feeVal },
      ],
    }));
    setDeliveryInput({ amount: '', fee: '' });
  };

  const handleRemoveDeliveryFeeLimit = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      deliveryFeeLimits: (prev.deliveryFeeLimits || []).filter(
        (_, i) => i !== indexToRemove
      ),
    }));
  };

  const handleToggleClosingDay = (day) => {
    setFormData((prev) => {
      const current = prev.weeklyClosingDays || [];
      const exists = current.includes(day);
      return {
        ...prev,
        weeklyClosingDays: exists
          ? current.filter((d) => d !== day)
          : [...current, day],
      };
    });
  };

  // Document file selection handler
  const handleDocFileChange = (docKey, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          preview: isImg ? URL.createObjectURL(file) : null,
        },
      }));
    }
  };

  // Remove document handler
  const handleRemoveDoc = (docKey) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: null,
    }));
  };

  // Auto-fill sample compliance documents for swift testing
  const handleAutoFillSampleDocs = () => {
    setDocuments({
      fssaiCert: {
        name: `fssai_license_${formData.fssaiNo || '10019011000123'}.pdf`,
        size: '520 KB',
        type: 'application/pdf',
        preview: null,
        uploadedAt: new Date().toISOString(),
      },
      gstCert: {
        name: `gstin_certificate_${formData.gstNo || '07AAAAA0000A1Z5'}.pdf`,
        size: '410 KB',
        type: 'application/pdf',
        preview: null,
        uploadedAt: new Date().toISOString(),
      },
      panCard: {
        name: `business_pan_${formData.panNo || 'AAACH7409R'}.pdf`,
        size: '185 KB',
        type: 'application/pdf',
        preview: null,
        uploadedAt: new Date().toISOString(),
      },
      outletFrontImage: {
        name: 'outlet_front_signage.jpg',
        size: '240 KB',
        type: 'image/jpeg',
        preview:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
      },
      kitchenAreaImage: {
        name: 'kitchen_cooking_hygiene.jpg',
        size: '310 KB',
        type: 'image/jpeg',
        preview:
          'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
      },
      takeawayAreaImage: {
        name: 'takeaway_delivery_counter.jpg',
        size: '190 KB',
        type: 'image/jpeg',
        preview:
          'https://images.unsplash.com/photo-1508766917616-d22f3f1eea14?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
      },
      otherImages: {
        name: 'cold_storage_rack.jpg',
        size: '215 KB',
        type: 'image/jpeg',
        preview:
          'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
      },
    });
  };

  // Live FSSAI status helper
  const fssaiStatus = getFssaiStatus(formData.fssaiNo, formData.fssaiValidUpto);

  // Uploaded docs counter
  const uploadedDocsCount = Object.values(documents).filter(Boolean).length;

  // Validation
  const validate = () => {
    const errs = {};

    // 1. Vendor Info
    if (!formData.vendorId) errs.vendorId = 'Select an operating vendor partner';

    // 2. Basic Details
    if (!formData.stationCode) errs.stationCode = 'Select a delivery station';

    const rawName = formData.name?.trim() || '';
    if (!rawName) {
      errs.name = 'Outlet display name is required';
    } else if (/(\b(off|discount|free delivery|sale|coupon|flat)\b)|%/i.test(rawName)) {
      errs.name = 'Promotional slogans or discounts are not permitted in outlet name';
    }

    if (!formData.address?.trim()) {
      errs.address = 'Kitchen physical address is required';
    }

    if (!formData.phone?.trim()) {
      errs.phone = '10-digit mobile number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.email?.trim()) {
      errs.email = 'Manager email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    // 3. Business Details
    const rawFssai = formData.fssaiNo?.trim() || '';
    if (!rawFssai) {
      errs.fssaiNo = 'FSSAI License is required (14 digits)';
    } else if (!/^\d{14}$/.test(rawFssai)) {
      errs.fssaiNo = 'FSSAI License must be exactly 14 digits';
    }

    if (!formData.fssaiValidUpto) {
      errs.fssaiValidUpto = 'FSSAI expiry date is required';
    } else {
      const expDate = new Date(formData.fssaiValidUpto);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expDate <= today) {
        errs.fssaiValidUpto = 'FSSAI license must have a future expiry date';
      }
    }

    const rawGst = (formData.gstNo || '').trim();
    if (!rawGst) {
      errs.gstNo = 'GSTIN is required (15 characters)';
    } else if (rawGst.length !== 15) {
      errs.gstNo = 'GSTIN must be exactly 15 characters';
    }

    const rawPan = (formData.panNo || '').trim().toUpperCase();
    if (!rawPan) {
      errs.panNo = 'Business PAN Number is required (10 characters)';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(rawPan)) {
      errs.panNo = 'Enter a valid 10-character PAN (e.g. AAACH7409R)';
    }

    if (!formData.mealType) {
      errs.mealType = 'Select dietary classification';
    }

    // 4. Order Settings
    if (!formData.startTime) {
      errs.startTime = 'Opening time is required';
    }
    if (!formData.endTime) {
      errs.endTime = 'Closing time is required';
    }

    const cutoff = Number(formData.bookingCutoff);
    if (isNaN(cutoff) || cutoff < 1) {
      errs.bookingCutoff = 'Enter order preparation time in minutes';
    }

    const minAmount = Number(formData.minOrderAmount);
    if (isNaN(minAmount) || minAmount < 0) {
      errs.minOrderAmount = 'Enter a valid minimum order amount (₹)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: formData.id.trim().toUpperCase(),
        name: formData.name.trim(),
        outletName: formData.name.trim(),
        stationCode: formData.stationCode.toUpperCase(),
        vendorId: String(formData.vendorId),
        vendorName: selectedVendor
          ? selectedVendor.businessName || selectedVendor.brandName
          : `Vendor #${formData.vendorId}`,
        fssaiNo: formData.fssaiNo.trim(),
        fssaiValidUpto: formData.fssaiValidUpto,
        fssaiActive: fssaiStatus.isActive,
        gstNo: formData.gstNo ? formData.gstNo.trim().toUpperCase() : '',
        gstin: formData.gstNo ? formData.gstNo.trim().toUpperCase() : '',
        panNo: formData.panNo ? formData.panNo.trim().toUpperCase() : '',
        panNumber: formData.panNo ? formData.panNo.trim().toUpperCase() : '',
        address: formData.address.trim(),
        contact: {
          name: formData.managerName?.trim() || '',
          mobile: formData.phone.trim(),
          email: formData.email.trim(),
        },
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        bookingCutoff: Number(formData.bookingCutoff || 30),
        baseCutoffTime: Number(formData.bookingCutoff || 30),
        prepTime: Number(formData.bookingCutoff || 30),
        preparationTime: Number(formData.bookingCutoff || 30),
        mealType: formData.mealType,
        distanceInMeters: Number(formData.distanceInMeters || 250),
        minOrderAmount: Number(formData.minOrderAmount ?? 0),
        prepaid: Boolean(formData.prepaid),
        paymentMode: formData.prepaid ? 'PREPAID ONLY' : 'COD & PREPAID',
        deliveryFeeLimits: formData.deliveryFeeLimits || [],
        weeklyClosingDays: formData.weeklyClosingDays || [],
        schedules: [
          {
            startTime: formData.startTime || '08:00',
            endTime: formData.endTime || '22:00',
          },
        ],
        startTime: formData.startTime || '08:00',
        endTime: formData.endTime || '22:00',
        status: formData.status || 'Active',
        approvalStatus:
          formData.status === 'Active'
            ? 'APPROVED'
            : formData.status === 'Pending'
            ? 'APPROVAL_PENDING'
            : formData.status === 'Inactive'
            ? 'DEACTIVATED'
            : 'APPROVED',
        listed: formData.status === 'Active' && formData.listed !== false,
        archived: formData.status === 'Archived',
        documents,
        documentsUploaded: Object.values(documents).some(Boolean),
        updatedAt: new Date().toISOString(),
      };

      if (mode === 'create') {
        payload.createdAt = new Date().toISOString();
        const created = await createOutlet(payload);
        navigate(`/outlets/${created?.id || payload.id}`);
      } else {
        await updateOutlet(formData.id, payload);
        navigate(`/outlets/${formData.id}`);
      }
    } catch (err) {
      console.error('Failed to save outlet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-12">
      {/* 2-Column Balanced Form Grid for Sections 1 to 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: VENDOR INFO + BASIC DETAILS */}
        <div className="space-y-6">
          {/* SECTION 1: VENDOR INFO */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Vendor Info</h2>
                  <p className="text-[11px] text-slate-400">
                    Operating vendor partner managing this outlet
                  </p>
                </div>
              </div>

              <Link
                to="/outlets/vendors/new"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100/70 px-2.5 py-1 rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vendor</span>
              </Link>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Operating Vendor Partner <span className="text-rose-500">*</span>
              </label>
              {vendors.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  No registered vendors found. Please add a vendor first.
                </div>
              ) : (
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 transition cursor-pointer"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      Vendor #{v.id} — {v.businessName || v.brandName} {v.city ? `(${v.city})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.vendorId && (
                <p className="text-xs text-rose-600 mt-1">{errors.vendorId}</p>
              )}
            </div>

            {/* Selected Vendor Quick Info Preview */}
            {selectedVendor && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {selectedVendor.businessName || selectedVendor.brandName}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    ID: {selectedVendor.id}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400">Contact:</span>{' '}
                    <span className="font-medium text-slate-700">
                      {selectedVendor.contactPerson || selectedVendor.contact?.name || 'Manager'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{' '}
                    <span className="font-medium text-slate-700">
                      {selectedVendor.phone || selectedVendor.contact?.mobile || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  {selectedVendor.gstin && !formData.gstNo && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => {
                          const next = { ...prev, gstNo: selectedVendor.gstin };
                          if (!prev.panNo) {
                            next.panNo =
                              selectedVendor.panNumber || selectedVendor.gstin.slice(2, 12);
                          }
                          return next;
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Auto-fill GSTIN ({selectedVendor.gstin})</span>
                    </button>
                  )}

                  {selectedVendor.panNumber && !formData.panNo && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          panNo: selectedVendor.panNumber,
                        }))
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Auto-fill PAN ({selectedVendor.panNumber})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: BASIC DETAILS */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Basic Details</h2>
                <p className="text-[11px] text-slate-400">
                  Station location, outlet identity and kitchen contact
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Station */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Delivery Station <span className="text-rose-500">*</span>
                </label>
                <select
                  name="stationCode"
                  value={formData.stationCode}
                  onChange={handleChange}
                  disabled={mode === 'edit'}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 font-medium transition cursor-pointer"
                >
                  {stations.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
                {errors.stationCode && (
                  <p className="text-xs text-rose-600 mt-1">{errors.stationCode}</p>
                )}
              </div>

              {/* Outlet Identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Outlet Code (Auto-Generated)
                </label>
                <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm font-bold text-slate-700">
                  <Hash className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                  <span>{formData.id || 'AUTO_ID'}</span>
                </div>
              </div>
            </div>

            {/* Outlet Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Outlet Display Name (Passenger-Facing) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Comesum Food Plaza, Sagar Ratna, Haldiram's"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 transition"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Kitchen Physical Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kitchen Physical Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows="2"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Platform / Concourse / Street address, City, State, Pincode"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition resize-none"
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-600 mt-1">{errors.address}</p>
              )}
            </div>

            {/* Manager Contact Sub-group */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Operations Manager Contact <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Manager Name */}
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleChange}
                    placeholder="Manager Name"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition"
                  />
                </div>

                {/* Mobile Number */}
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData((prev) => ({ ...prev, phone: num }));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    placeholder="10-Digit Mobile"
                    maxLength={10}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold transition"
                  />
                </div>

                {/* Email Address */}
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Manager Email"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition"
                  />
                </div>
              </div>

              {(errors.phone || errors.email) && (
                <div className="flex flex-wrap gap-4 mt-1.5">
                  {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
                  {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: BUSINESS DETAILS + ORDER SETTINGS */}
        <div className="space-y-6">
          {/* SECTION 3: BUSINESS DETAILS */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Business Details</h2>
                  <p className="text-[11px] text-slate-400">
                    FSSAI food license, GST &amp; PAN registration, and dietary type
                  </p>
                </div>
              </div>

              {/* FSSAI Status Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  fssaiStatus.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : fssaiStatus.status === 'EXPIRING_SOON'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {fssaiStatus.isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-rose-600" />
                )}
                <span>FSSAI: {fssaiStatus.label}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FSSAI License Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    FSSAI License (14 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formData.fssaiNo.length}/14
                  </span>
                </div>
                <input
                  type="text"
                  name="fssaiNo"
                  value={formData.fssaiNo}
                  onChange={(e) => {
                    const num = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setFormData((prev) => ({ ...prev, fssaiNo: num }));
                    if (errors.fssaiNo) setErrors((prev) => ({ ...prev, fssaiNo: null }));
                  }}
                  placeholder="e.g. 10019011000123"
                  maxLength={14}
                  className="w-full px-3 py-2 text-sm font-mono tracking-wider bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold transition"
                />
                {errors.fssaiNo && (
                  <p className="text-xs text-rose-600 mt-1">{errors.fssaiNo}</p>
                )}
              </div>

              {/* FSSAI Expiry Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    FSSAI Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  {fssaiStatus.daysRemaining !== null && (
                    <span
                      className={`text-[10px] font-medium ${
                        fssaiStatus.daysRemaining > 30 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {fssaiStatus.daysRemaining >= 0
                        ? `${fssaiStatus.daysRemaining}d left`
                        : 'Expired'}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  name="fssaiValidUpto"
                  value={formData.fssaiValidUpto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition cursor-pointer"
                />
                {errors.fssaiValidUpto && (
                  <p className="text-xs text-rose-600 mt-1">{errors.fssaiValidUpto}</p>
                )}
              </div>
            </div>

            {/* Commercial GSTIN & Business PAN (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Commercial GSTIN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Commercial GSTIN (15 Chars) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formData.gstNo.length}/15
                  </span>
                </div>
                <input
                  type="text"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={(e) => {
                    const cleaned = e.target.value.toUpperCase().slice(0, 15);
                    setFormData((prev) => {
                      const next = { ...prev, gstNo: cleaned };
                      // If PAN is empty and GSTIN has at least 12 chars (chars 3 to 12)
                      if (!prev.panNo && cleaned.length >= 12) {
                        const panPart = cleaned.slice(2, 12);
                        if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panPart)) {
                          next.panNo = panPart;
                        }
                      }
                      return next;
                    });
                    if (errors.gstNo) setErrors((prev) => ({ ...prev, gstNo: null }));
                  }}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  maxLength={15}
                  className="w-full px-3.5 py-2 text-sm font-mono tracking-wider bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold uppercase transition"
                />
                {errors.gstNo && <p className="text-xs text-rose-600 mt-1">{errors.gstNo}</p>}
              </div>

              {/* Business PAN Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Business PAN Number (10 Chars) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formData.panNo.length}/10
                  </span>
                </div>
                <input
                  type="text"
                  name="panNo"
                  value={formData.panNo}
                  onChange={(e) => {
                    const cleaned = e.target.value.toUpperCase().slice(0, 10);
                    setFormData((prev) => ({ ...prev, panNo: cleaned }));
                    if (errors.panNo) setErrors((prev) => ({ ...prev, panNo: null }));
                  }}
                  placeholder="e.g. AAACH7409R"
                  maxLength={10}
                  className="w-full px-3.5 py-2 text-sm font-mono tracking-wider bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold uppercase transition"
                />
                {errors.panNo && <p className="text-xs text-rose-600 mt-1">{errors.panNo}</p>}
              </div>
            </div>

            {/* Dietary Classification (Meal Type) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dietary Classification <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mealType: 'PURE_VEG' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    formData.mealType === 'PURE_VEG'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Pure Veg</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mealType: 'NON_VEG' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    formData.mealType === 'NON_VEG'
                      ? 'bg-slate-100 text-slate-900 border-slate-300 ring-1 ring-slate-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-slate-700" />
                  <span>Veg & Non-Veg</span>
                </button>
              </div>
              {errors.mealType && (
                <p className="text-xs text-rose-600 mt-1">{errors.mealType}</p>
              )}
            </div>
          </div>

          {/* SECTION 4: ORDER SETTINGS */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Order Settings</h2>
                <p className="text-[11px] text-slate-400">
                  Operating timings, preparation lead time, minimum order, delivery limits and payment
                </p>
              </div>
            </div>

            {/* Row 1: Opening Time & Closing Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Opening Time<span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono transition"
                  />
                </div>
                {errors.startTime && (
                  <p className="text-xs text-rose-600 mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Closing Time<span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono transition"
                  />
                </div>
                {errors.endTime && (
                  <p className="text-xs text-rose-600 mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Row 2: Order Preparation Time & Minimum Order Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Order Preparation Time (minutes)<span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="bookingCutoff"
                  value={formData.bookingCutoff}
                  onChange={handleChange}
                  min={1}
                  max={120}
                  placeholder="30"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                />
                {errors.bookingCutoff && (
                  <p className="text-xs text-rose-600 mt-1">{errors.bookingCutoff}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Minimum Order Amount (₹)<span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  min={0}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                />
                {errors.minOrderAmount && (
                  <p className="text-xs text-rose-600 mt-1">{errors.minOrderAmount}</p>
                )}
              </div>
            </div>

            {/* Row 3: Delivery Fee Limits & Accept Prepaid Orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Fee Limits Box */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-2.5">
                    Delivery Fee Limits
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Amoun"
                      value={deliveryInput.amount}
                      onChange={(e) =>
                        setDeliveryInput((prev) => ({ ...prev, amount: e.target.value }))
                      }
                      className="flex-1 min-w-0 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                    />
                    <input
                      type="number"
                      placeholder="Fee"
                      value={deliveryInput.fee}
                      onChange={(e) =>
                        setDeliveryInput((prev) => ({ ...prev, fee: e.target.value }))
                      }
                      className="flex-1 min-w-0 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliveryFeeLimit}
                      className="w-9 h-9 shrink-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-base transition shadow-2xs cursor-pointer"
                      title="Add delivery fee limit"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {formData.deliveryFeeLimits && formData.deliveryFeeLimits.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {formData.deliveryFeeLimits.map((limit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200"
                      >
                        <span>₹{limit.amount} → ₹{limit.fee} Fee</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliveryFeeLimit(idx)}
                          className="text-purple-400 hover:text-purple-700 font-bold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Accepted Payment Mode Box */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2.5">
                    Accepted Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          prepaid: false,
                          paymentMode: 'COD & PREPAID',
                        }))
                      }
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        !formData.prepaid
                          ? 'bg-blue-50 text-blue-900 border-blue-300 ring-1 ring-blue-300 shadow-2xs font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className={`w-3.5 h-3.5 ${!formData.prepaid ? 'text-blue-700' : 'text-slate-500'}`} />
                      <span>COD &amp; Prepaid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          prepaid: true,
                          paymentMode: 'PREPAID ONLY',
                        }))
                      }
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        formData.prepaid
                          ? 'bg-blue-50 text-blue-900 border-blue-300 ring-1 ring-blue-300 shadow-2xs font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className={`w-3.5 h-3.5 ${formData.prepaid ? 'text-blue-700' : 'text-slate-500'}`} />
                      <span>Prepaid Only</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  {!formData.prepaid
                    ? 'Customers can pay cash upon delivery or pay online'
                    : 'Customers must pay online at the time of placing order'}
                </p>
              </div>
            </div>

            {/* Row 4: Weekly Closing Days */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <h3 className="text-xs font-bold text-slate-800">
                Weekly Closing Days
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                Select days when the outlet is closed
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Sunday',
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                ].map((day) => {
                  const isChecked = (formData.weeklyClosingDays || []).includes(day);
                  return (
                    <label
                      key={day}
                      className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleClosingDay(day)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>{day}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: COMPLIANCE DOCUMENTS & KITCHEN PHOTOS */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Compliance Documents &amp; Facility Photos
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {uploadedDocsCount}/7 Uploaded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Statutory FSSAI &amp; GST certificates, PAN card, and commercial kitchen photos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoFillSampleDocs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Auto-Fill Sample Docs</span>
          </button>
        </div>

        {/* 7 Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {COMPLIANCE_DOCS_CONFIG.map((doc) => {
            const IconComp = doc.icon;
            const docState = documents[doc.key];
            const isUploaded = Boolean(docState);

            return (
              <div
                key={doc.key}
                className={`rounded-xl border p-4 transition-all shadow-2xs flex flex-col justify-between ${
                  isUploaded
                    ? 'border-emerald-300 bg-emerald-50/15'
                    : 'border-slate-200/80 bg-slate-50/40 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isUploaded
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-white border border-slate-200 text-slate-500'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{doc.category}</p>
                      </div>
                    </div>

                    {isUploaded ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Thumbnail if image preview available */}
                  {docState?.preview && (
                    <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-100 group">
                      <img
                        src={docState.preview}
                        alt={doc.title}
                        className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.key)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-rose-600"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Non-image document pill */}
                  {isUploaded && !docState?.preview && (
                    <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200 text-[11px] font-mono text-slate-700">
                      <span className="truncate pr-2 font-medium">{docState.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.key)}
                        className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer p-0.5"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <label className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isUploaded ? 'Replace File' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept={doc.accept}
                      onChange={(e) => handleDocFileChange(doc.key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/outlets')}
          className="px-5 py-2.5 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Saving Outlet...'
              : mode === 'create'
              ? 'Add Outlet'
              : 'Save Changes'}
          </span>
        </button>
      </div>
    </form>
  );
}
