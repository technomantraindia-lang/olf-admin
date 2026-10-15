import { mockStations } from '../data/mockStations';
import { initialMockOutlets } from '../data/mockOutlets';

const STORAGE_KEY = 'olf_stores_outlets_data_v6';

export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export function getStoredOutletsSync() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockOutlets));
      return initialMockOutlets;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    return [];
  }
}

function saveStoredOutlets(outlets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outlets));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

/**
 * Automatically generates an IRCTC-compliant Outlet ID.
 * Rules: Strictly alphanumeric, max 15 chars, no hyphens, unique per station.
 * Format: <STATION_CODE><2_DIGIT_SEQ>, e.g., NDLS01, NDLS02
 */
export function generateOutletId(stationCode = 'OUT', existingOutlets = []) {
  const prefix = (stationCode || 'OUT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  const matching = (existingOutlets || []).filter(
    (o) => (o.stationCode?.toUpperCase() === prefix || o.id?.startsWith(prefix))
  );

  let seq = 1;
  let candidate = `${prefix}${String(seq).padStart(2, '0')}`;
  
  // Ensure candidate is unique among all existing outlets
  while ((existingOutlets || []).some((o) => o.id?.toUpperCase() === candidate)) {
    seq++;
    candidate = `${prefix}${String(seq).padStart(2, '0')}`;
  }

  return candidate;
}

/**
 * Evaluates whether an FSSAI License Number is Active or Expired
 * based on 14-digit format and validity date.
 */
export function getFssaiStatus(fssaiNo, validUptoDate) {
  const cleaned = (fssaiNo || '').trim();
  
  if (!cleaned) {
    return {
      status: 'MISSING',
      label: 'Missing License',
      color: 'rose',
      isActive: false,
      daysRemaining: null,
    };
  }

  if (cleaned.length !== 14 || !/^\d{14}$/.test(cleaned)) {
    return {
      status: 'INVALID',
      label: 'Invalid Format (14 Digits Req)',
      color: 'rose',
      isActive: false,
      daysRemaining: null,
    };
  }

  if (!validUptoDate) {
    return {
      status: 'ACTIVE_NO_DATE',
      label: 'Active (No Expiry Set)',
      color: 'emerald',
      isActive: true,
      daysRemaining: null,
    };
  }

  const expDate = new Date(validUptoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(expDate.getTime())) {
    return {
      status: 'ACTIVE',
      label: 'Active',
      color: 'emerald',
      isActive: true,
      daysRemaining: null,
    };
  }

  const diffMs = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      color: 'rose',
      isActive: false,
      daysRemaining: diffDays,
    };
  } else if (diffDays <= 30) {
    return {
      status: 'EXPIRING_SOON',
      label: `Expiring in ${diffDays}d`,
      color: 'amber',
      isActive: true,
      daysRemaining: diffDays,
    };
  } else {
    return {
      status: 'ACTIVE',
      label: 'Active',
      color: 'emerald',
      isActive: true,
      daysRemaining: diffDays,
    };
  }
}

/**
 * Standard 7 Mandatory Compliance Documents & Inspection Photos (IRCTC Table 01)
 */
export function getOutletComplianceDocs(outlet) {
  const docs = outlet?.documents || {};
  return [
    {
      key: 'outletFrontImage',
      title: '1. Outlet Front Image',
      category: 'Signage & Facade',
      desc: 'Exterior shop front showing branding board',
      preview:
        docs.outletFrontImage?.preview ||
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      isImage: true,
      filename: docs.outletFrontImage?.name || `${outlet?.id || 'outlet'}_front_signage.jpg`,
      size: docs.outletFrontImage?.size || '240 KB',
      status: 'VERIFIED',
    },
    {
      key: 'kitchenAreaImage',
      title: '2. Kitchen Area Image',
      category: 'Cooking & Hygiene Area',
      desc: 'Commercial burners, chimneys & prep hygiene',
      preview:
        docs.kitchenAreaImage?.preview ||
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
      isImage: true,
      filename: docs.kitchenAreaImage?.name || `${outlet?.id || 'outlet'}_kitchen_area.jpg`,
      size: docs.kitchenAreaImage?.size || '310 KB',
      status: 'VERIFIED',
    },
    {
      key: 'takeawayAreaImage',
      title: '3. Takeaway Counter Image',
      category: 'Handover & Packaging',
      desc: 'Delivery packaging & handover counter',
      preview:
        docs.takeawayAreaImage?.preview ||
        'https://images.unsplash.com/photo-1508766917616-d22f3f1eea14?w=800&auto=format&fit=crop&q=80',
      isImage: true,
      filename: docs.takeawayAreaImage?.name || `${outlet?.id || 'outlet'}_takeaway_counter.jpg`,
      size: docs.takeawayAreaImage?.size || '190 KB',
      status: 'VERIFIED',
    },
    {
      key: 'otherImages',
      title: '4. Storage & Cold Chain',
      category: 'Storage Infrastructure',
      desc: 'Deep freeze & ingredient refrigeration unit',
      preview:
        docs.otherImages?.preview ||
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
      isImage: true,
      filename: docs.otherImages?.name || `${outlet?.id || 'outlet'}_cold_storage.jpg`,
      size: docs.otherImages?.size || '215 KB',
      status: 'VERIFIED',
    },
    {
      key: 'fssaiCert',
      title: '5. FSSAI License Document',
      category: 'Statutory Food License',
      desc: `14-Digit License: ${outlet?.fssaiNo || '12312352136452'}`,
      preview: null,
      isImage: false,
      filename: docs.fssaiCert?.name || `fssai_cert_${outlet?.fssaiNo || '12312352136452'}.pdf`,
      size: docs.fssaiCert?.size || '520 KB',
      status: 'VERIFIED',
    },
    {
      key: 'gstCert',
      title: '6. GST Registration Certificate',
      category: 'Tax Registration',
      desc: `15-Digit GSTIN: ${outlet?.gstNo || '24AAACH7409R1ZZ'}`,
      preview: null,
      isImage: false,
      filename: docs.gstCert?.name || `gstin_certificate_${outlet?.gstNo || 'reg'}.pdf`,
      size: docs.gstCert?.size || '410 KB',
      status: 'VERIFIED',
    },
    {
      key: 'panCard',
      title: '7. Business PAN Card',
      category: 'Corporate Identity',
      desc: 'Proprietor or Company PAN document',
      preview: null,
      isImage: false,
      filename: docs.panCard?.name || `business_pan_${outlet?.vendorId || 'corp'}.pdf`,
      size: docs.panCard?.size || '185 KB',
      status: 'VERIFIED',
    },
  ];
}

export const outletService = {
  getStations: () => Promise.resolve(mockStations),
  getStationByCode: (code) =>
    Promise.resolve(
      mockStations.find((s) => s.code.toLowerCase() === (code || '').toLowerCase()) || null
    ),
  getOutlets: () => Promise.resolve(getStoredOutletsSync()),
  getOutletById: (id) => {
    const cleanId = String(id || '').replace(/^#/, '').trim();
    const outlets = getStoredOutletsSync();
    return Promise.resolve(
      outlets.find((o) => String(o.id || '').replace(/^#/, '').trim() === cleanId) || null
    );
  },
  getOutletsByStation: (code) => {
    const outlets = getStoredOutletsSync();
    return Promise.resolve(
      outlets.filter((o) => (o.stationCode || '').toLowerCase() === (code || '').toLowerCase())
    );
  },
  getOutletsByVendor: (vendorId) => {
    const outlets = getStoredOutletsSync();
    return Promise.resolve(outlets.filter((o) => String(o.vendorId) === String(vendorId)));
  },
  checkBackendConnection: async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      const data = await res.json();
      return { connected: res.ok, data };
    } catch {
      return { connected: false, data: null };
    }
  },
  createOutlet: async (data) => {
    const outlets = getStoredOutletsSync();
    const stationCode = (data.stationCode || 'OUT').toUpperCase();
    const outletId = data.id && /^[a-zA-Z0-9]{1,15}$/.test(data.id)
      ? data.id.toUpperCase()
      : generateOutletId(stationCode, outlets);

    let applicationId = `APP_${Date.now().toString().slice(-6)}`;

    // Call Part 2: OLF Express Backend (Port 4000) - The Main Boss
    try {
      const response = await fetch(`${BACKEND_URL}/api/outlets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: outletId,
          name: data.name,
          stationCode,
          vendorId: data.vendorId,
          vendorName: data.vendorName,
          fssaiNo: data.fssaiNo,
          fssaiValidUpto: data.fssaiValidUpto,
          bookingCutoff: data.bookingCutoff || 60,
          gstNo: data.gstNo || '',
          panNo: data.panNo || data.panNumber || '',
          panNumber: data.panNo || data.panNumber || '',
          minOrderAmount: data.minOrderAmount || 100,
          mealType: data.mealType || 'VEG_AND_NON_VEG',
          prepaid: Boolean(data.prepaid),
          distanceInMeters: data.distanceInMeters,
          address: data.address,
        }),
      });
      const resData = await response.json();
      console.log('👑 [OLF Backend Response]:', resData);
      if (resData?.result?.applicationId) {
        applicationId = resData.result.applicationId;
      }
    } catch (err) {
      console.warn('⚠️ [OLF Backend Offline]: saved in local state.', err);
    }

    const newOutlet = {
      ...data,
      id: outletId,
      stationCode,
      applicationId,
      status: data.status || 'Active',
      approvalStatus: data.approvalStatus || (data.status === 'Pending' ? 'APPROVAL_PENDING' : 'APPROVED'),
      listed: data.listed !== undefined ? data.listed : true,
      documentsUploaded: Boolean(data.documentsUploaded ?? (data.documents && Object.keys(data.documents).length > 0)),
      documents: data.documents || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    outlets.push(newOutlet);
    saveStoredOutlets(outlets);

    return newOutlet;
  },
  uploadApplicationDocuments: async (applicationId, documents) => {
    let result = null;
    try {
      const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents }),
      });
      result = await response.json();
    } catch (err) {
      console.warn('⚠️ [Backend offline during doc upload]:', err);
    }

    // Update in local storage
    const outlets = getStoredOutletsSync();
    const outlet = outlets.find((o) => o.applicationId === applicationId);
    if (outlet) {
      outlet.status = 'APPROVAL_PENDING';
      outlet.approvalStatus = 'APPROVAL_PENDING';
      outlet.documentsUploaded = true;
      outlet.documents = documents || [];
      outlet.updatedAt = new Date().toISOString();
      saveStoredOutlets(outlets);
    }

    return result || { status: 'success', approvalStatus: 'APPROVAL_PENDING' };
  },
  syncApplicationStatus: async (applicationId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}`);
      const data = await response.json();
      const appStatus = data?.result?.application?.status;

      if (appStatus) {
        const outlets = getStoredOutletsSync();
        const outlet = outlets.find((o) => o.applicationId === applicationId);
        if (outlet) {
          outlet.approvalStatus = appStatus;
          if (appStatus === 'APPROVED') {
            outlet.status = 'APPROVED';
            outlet.listed = true;
          } else if (appStatus === 'REJECTED') {
            outlet.status = 'REJECTED';
            outlet.listed = false;
          }
          outlet.updatedAt = new Date().toISOString();
          saveStoredOutlets(outlets);
        }
      }
      return data?.result;
    } catch (err) {
      console.error('Failed to sync application status:', err);
      return null;
    }
  },
  syncOutletWithIRCTC: async (outletId, stationCode) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/outlets/${outletId}/sync?stationCode=${stationCode || ''}`);
      const data = await response.json();
      const irctcData = data?.result?.irctcData;

      if (irctcData && irctcData.listed !== undefined) {
        const outlets = getStoredOutletsSync();
        const outlet = outlets.find((o) => o.id === outletId);
        if (outlet) {
          outlet.listed = Boolean(irctcData.listed);
          outlet.status = 'APPROVED';
          outlet.approvalStatus = 'APPROVED';
          if (irctcData.status && irctcData.status !== 'DOCUMENT_UPLOAD_PENDING') {
            outlet.status = irctcData.status;
          }
          outlet.updatedAt = new Date().toISOString();
          saveStoredOutlets(outlets);
          return outlet;
        }
      }
      return null;
    } catch (err) {
      console.error('Failed to sync outlet with IRCTC:', err);
      return null;
    }
  },
  updateOutlet: async (id, data) => {
    const cleanId = String(id || '').replace(/^#/, '').trim();
    const outlets = getStoredOutletsSync();
    const idx = outlets.findIndex(
      (o) => String(o.id || '').replace(/^#/, '').trim() === cleanId
    );
    if (idx === -1) return Promise.reject(new Error('Outlet not found'));
    const wasListed = Boolean(outlets[idx].listed);
    outlets[idx] = { ...outlets[idx], ...data };
    saveStoredOutlets(outlets);

    // Call Part 2: OLF Express Backend (Port 4000) - The Main Boss
    // Only call backend API if listed status actually changed
    if (data.listed !== undefined && Boolean(data.listed) !== wasListed) {
      try {
        const stn = (outlets[idx].stationCode || 'OUT').toUpperCase();
        const response = await fetch(`${BACKEND_URL}/api/outlets/${id}/listing`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listed: Boolean(data.listed),
            stationCode: stn,
            remarks: data.listed ? 'Activated via OLF Admin' : 'Deactivated via OLF Admin',
          }),
        });
        const resData = await response.json();
        console.log('👑 [OLF Backend Listing Toggle Response]:', resData);
      } catch (err) {
        console.warn('⚠️ [OLF Backend Offline]: updated in local state.', err);
      }
    }

    return outlets[idx];
  },
  deleteOutlet: (id, hardDelete = false) => {
    const cleanId = String(id || '').replace(/^#/, '').trim();
    let outlets = getStoredOutletsSync();
    if (hardDelete) {
      outlets = outlets.filter((o) => String(o.id || '').replace(/^#/, '').trim() !== cleanId);
    } else {
      outlets = outlets.map((o) => {
        if (String(o.id || '').replace(/^#/, '').trim() === cleanId) {
          return {
            ...o,
            status: 'Archived',
            approvalStatus: 'ARCHIVED',
            archived: true,
            listed: false,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });
    }
    saveStoredOutlets(outlets);
    return Promise.resolve(true);
  },
  restoreOutlet: (id) => {
    const cleanId = String(id || '').replace(/^#/, '').trim();
    let outlets = getStoredOutletsSync();
    outlets = outlets.map((o) => {
      if (String(o.id || '').replace(/^#/, '').trim() === cleanId) {
        return {
          ...o,
          status: 'Active',
          approvalStatus: 'APPROVED',
          archived: false,
          listed: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    saveStoredOutlets(outlets);
    return Promise.resolve(true);
  },
  resetToDefaults: () => {
    saveStoredOutlets([]);
    return Promise.resolve([]);
  },
  calculateMetrics: (outlets = []) => {
    const list = Array.isArray(outlets) ? outlets : [];
    return {
      total: list.length,
      active: list.filter((o) => o.status === 'Active' || o.status === 'APPROVED').length,
      pending: list.filter((o) => o.status === 'Pending' || o.status === 'APPROVAL_PENDING').length,
      prepaidOnly: list.filter((o) => o.prepaid === true).length,
      inactive: list.filter((o) => o.status === 'Inactive' || o.status === 'DEACTIVATED').length,
      closed: list.filter((o) => o.status === 'Closed').length,
      archived: list.filter((o) => o.status === 'Archived').length,
    };
  },
};
