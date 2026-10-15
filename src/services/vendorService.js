import { initialMockVendors } from '../data/mockVendors';

const VENDOR_STORAGE_KEY = 'olf_stores_vendors_data_v4';

const legacyVendorIdMap = {
  'VND-001': '1001',
  'VND-002': '1002',
  'VND-003': '1003',
  'VND-004': '1004',
  'VND-005': '1005',
  'VND-006': '1006',
};

export function getStoredVendorsSync() {
  try {
    const raw = localStorage.getItem(VENDOR_STORAGE_KEY);
    if (!raw) {
      if (initialMockVendors.length > 0) {
        localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(initialMockVendors));
      }
      return initialMockVendors;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Migrate any legacy IDs if present
    return parsed.map((v, index) => {
      let cleanId = v.id ? String(v.id).trim() : '';
      if (legacyVendorIdMap[cleanId]) {
        cleanId = legacyVendorIdMap[cleanId];
      } else if (!/^\d+$/.test(cleanId)) {
        const extractedDigits = cleanId.replace(/\D/g, '');
        cleanId = extractedDigits ? String(1000 + parseInt(extractedDigits, 10)) : String(1001 + index);
      }
      return {
        ...v,
        id: cleanId,
        legalName: v.legalName || v.businessName || 'Unnamed Vendor',
        brandName: v.brandName || v.businessName || 'Unnamed Vendor',
        businessName: v.businessName || v.legalName || 'Unnamed Vendor',
        status: v.status || 'Active',
        metrics: v.metrics || { totalOrders: 0, grossOrderValue: 0, vendorEarnings: 0 },
        documents: v.documents || [],
        history: v.history || [],
      };
    });
  } catch (err) {
    console.warn('Error reading vendors from localStorage, using defaults:', err);
    return initialMockVendors;
  }
}

function saveStoredVendors(vendors) {
  try {
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendors));
  } catch (err) {
    console.error('Error saving vendors to localStorage:', err);
  }
}

export const vendorService = {
  /**
   * Get all vendors with optional filtering
   */
  async getVendors(filters = {}) {
    const allVendors = getStoredVendorsSync();
    let result = [...allVendors];

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(
        (v) => (v.status || '').toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.businessName && v.businessName.toLowerCase().includes(q)) ||
          (v.brandName && v.brandName.toLowerCase().includes(q)) ||
          (v.legalName && v.legalName.toLowerCase().includes(q)) ||
          (v.id && String(v.id).toLowerCase().includes(q)) ||
          (v.panNumber && v.panNumber.toLowerCase().includes(q)) ||
          (v.gstin && v.gstin.toLowerCase().includes(q)) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
          (v.phone && String(v.phone).includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.city && v.city.toLowerCase().includes(q)) ||
          (v.category && v.category.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(result);
  },

  /**
   * Get single vendor by ID
   */
  async getVendorById(id) {
    const allVendors = getStoredVendorsSync();
    const vendor = allVendors.find((v) => String(v.id).toUpperCase() === String(id).toUpperCase());
    return Promise.resolve(vendor || null);
  },

  /**
   * Create new vendor with numeric-only ID (e.g. 1007)
   */
  async createVendor(vendorData) {
    const allVendors = getStoredVendorsSync();
    const maxNumericId = allVendors.reduce((max, v) => {
      const num = parseInt(v.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);

    const customId = vendorData.id ? String(vendorData.id).trim() : '';
    const generatedId = customId && /^\d+$/.test(customId) ? customId : String(maxNumericId + 1);

    const newVendor = {
      ...vendorData,
      id: generatedId,
      legalName: vendorData.legalName || vendorData.businessName || '',
      brandName: vendorData.brandName || vendorData.businessName || '',
      businessName: vendorData.businessName || vendorData.legalName || '',
      status: vendorData.status || 'Active',
      registrationDate: vendorData.registrationDate || new Date().toISOString().slice(0, 10),
      metrics: {
        totalOrders: 0,
        grossOrderValue: 0,
        vendorEarnings: 0,
      },
      documents: vendorData.documents || [
        { id: 'DOC-1', name: 'FSSAI Central / State License', category: 'Food Safety', status: 'Pending Review', expiryDate: '2027-12-31' },
        { id: 'DOC-2', name: 'GSTIN Registration Certificate', category: 'Tax & Compliance', status: 'Verified', expiryDate: '2030-01-01' },
        { id: 'DOC-3', name: 'IRCTC Master Catering Agreement', category: 'Commercial Agreement', status: 'Pending Review', expiryDate: '2027-03-31' },
        { id: 'DOC-4', name: 'Kitchen Hygiene & Safety Audit', category: 'Quality & Audit', status: 'Pending Review', expiryDate: '2026-09-30' },
      ],
      history: [
        {
          id: `H-${Date.now()}`,
          event: 'Vendor Registered',
          date: new Date().toISOString(),
          notes: 'New vendor account created via admin portal.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newVendor, ...allVendors];
    saveStoredVendors(updatedList);
    return Promise.resolve(newVendor);
  },

  /**
   * Update vendor record
   */
  async updateVendor(id, updatedFields) {
    const allVendors = getStoredVendorsSync();
    const index = allVendors.findIndex((v) => String(v.id).toUpperCase() === String(id).toUpperCase());

    if (index === -1) {
      return Promise.reject(new Error(`Vendor with ID ${id} not found.`));
    }

    const current = allVendors[index];
    const updatedVendor = {
      ...current,
      ...updatedFields,
      id: current.id,
      legalName: updatedFields.legalName || updatedFields.businessName || current.legalName,
      brandName: updatedFields.brandName || updatedFields.businessName || current.brandName,
      businessName: updatedFields.businessName || updatedFields.legalName || current.businessName,
      history: [
        ...(current.history || []),
        {
          id: `H-${Date.now()}`,
          event: 'Vendor Details Updated',
          date: new Date().toISOString(),
          notes: 'Profile updated in admin portal.',
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    allVendors[index] = updatedVendor;
    saveStoredVendors(allVendors);
    return Promise.resolve(updatedVendor);
  },

  /**
   * Archive or toggle status of vendor
   */
  async archiveVendor(id, hardDelete = false) {
    const allVendors = getStoredVendorsSync();
    let updatedList;

    if (hardDelete) {
      updatedList = allVendors.filter((v) => String(v.id).toUpperCase() !== String(id).toUpperCase());
    } else {
      updatedList = allVendors.map((v) =>
        String(v.id).toUpperCase() === String(id).toUpperCase()
          ? {
              ...v,
              status: 'Archived',
              history: [
                ...(v.history || []),
                {
                  id: `H-${Date.now()}`,
                  event: 'Vendor Archived',
                  date: new Date().toISOString(),
                  notes: 'Vendor marked as archived.',
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : v
      );
    }

    saveStoredVendors(updatedList);
    return Promise.resolve({ success: true, id });
  },

  /**
   * Delete vendor record (permanently removes vendor from storage)
   */
  async deleteVendor(id, hardDelete = true) {
    return this.archiveVendor(id, hardDelete);
  },

  /**
   * Toggle block/unblock vendor status
   */
  async toggleBlockVendor(id) {
    const allVendors = getStoredVendorsSync();
    const index = allVendors.findIndex((v) => String(v.id).toUpperCase() === String(id).toUpperCase());
    if (index === -1) {
      return Promise.reject(new Error(`Vendor with ID ${id} not found.`));
    }
    const current = allVendors[index];
    const newStatus = current.status === 'Blocked' ? 'Active' : 'Blocked';
    const updatedVendor = {
      ...current,
      status: newStatus,
      history: [
        ...(current.history || []),
        {
          id: `H-${Date.now()}`,
          event: newStatus === 'Blocked' ? 'Vendor Blocked' : 'Vendor Unblocked',
          date: new Date().toISOString(),
          notes: `Vendor status toggled to ${newStatus}.`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    allVendors[index] = updatedVendor;
    saveStoredVendors(allVendors);
    return Promise.resolve(updatedVendor);
  },

  /**
   * Reset vendors to initial defaults
   */
  async resetToDefaults() {
    saveStoredVendors(initialMockVendors);
    return Promise.resolve(initialMockVendors);
  },

  /**
   * Calculate summary metrics for vendors
   */
  calculateMetrics(vendorsList = [], outletsList = []) {
    const list = Array.isArray(vendorsList) ? vendorsList : [];
    const outlets = Array.isArray(outletsList) ? outletsList : [];

    const total = list.filter((v) => v && v.status !== 'Archived').length;
    const active = list.filter((v) => v && v.status === 'Active').length;
    const blocked = list.filter((v) => v && v.status === 'Blocked').length;
    const pending = list.filter((v) => v && v.status === 'Pending').length;
    const inactive = list.filter((v) => v && v.status === 'Inactive').length;
    const archived = list.filter((v) => v && v.status === 'Archived').length;

    const associatedOutlets = outlets.filter(
      (o) => o && o.status !== 'Archived' && o.status !== 'Deleted'
    ).length;

    return {
      total,
      active,
      blocked,
      pending,
      inactive,
      archived,
      totalOutlets: associatedOutlets,
      grandTotal: list.length,
    };
  },
};
