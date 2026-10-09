import { initialMockVendors } from '../data/mockVendors';

const VENDOR_STORAGE_KEY = 'olf_stores_vendors_data_v1';

export function getStoredVendorsSync() {
  try {
    const raw = localStorage.getItem(VENDOR_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(initialMockVendors));
      return initialMockVendors;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(initialMockVendors));
      return initialMockVendors;
    }
    return parsed.map((v) => ({
      ...v,
      id: v.id || 'VND-001',
      businessName: v.businessName || 'Unnamed Vendor',
      status: v.status || 'Active',
      metrics: v.metrics || { totalOrders: 0, grossOrderValue: 0, vendorEarnings: 0 },
      documents: v.documents || [],
      history: v.history || [],
    }));
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
        (v) => v.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.businessName.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q) ||
          v.contactPerson.toLowerCase().includes(q) ||
          v.phone.includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(result);
  },

  /**
   * Get single vendor by ID
   */
  async getVendorById(id) {
    const allVendors = getStoredVendorsSync();
    const vendor = allVendors.find((v) => v.id.toUpperCase() === String(id).toUpperCase());
    return Promise.resolve(vendor || null);
  },

  /**
   * Create new vendor
   */
  async createVendor(vendorData) {
    const allVendors = getStoredVendorsSync();
    const newCount = allVendors.length + 1;
    const generatedId =
      vendorData.id?.trim() || `VND-${String(newCount).padStart(3, '0')}`;

    const newVendor = {
      ...vendorData,
      id: generatedId,
      status: vendorData.status || 'Active',
      registrationDate: vendorData.registrationDate || new Date().toISOString().slice(0, 10),
      metrics: {
        totalOrders: 0,
        grossOrderValue: 0,
        vendorEarnings: 0,
      },
      documents: vendorData.documents || [
        { id: `DOC-${Date.now()}-1`, name: 'FSSAI License', category: 'Food Safety', status: 'Pending Review', expiryDate: '2027-12-31' },
        { id: `DOC-${Date.now()}-2`, name: 'GST Certificate', category: 'Tax & Compliance', status: 'Pending Review', expiryDate: '2030-01-01' },
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
    const index = allVendors.findIndex((v) => v.id.toUpperCase() === String(id).toUpperCase());

    if (index === -1) {
      return Promise.reject(new Error(`Vendor with ID ${id} not found.`));
    }

    const current = allVendors[index];
    const updatedVendor = {
      ...current,
      ...updatedFields,
      id: current.id, // Immutable ID
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
      updatedList = allVendors.filter((v) => v.id.toUpperCase() !== String(id).toUpperCase());
    } else {
      updatedList = allVendors.map((v) =>
        v.id.toUpperCase() === String(id).toUpperCase()
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
   * Reset vendors to initial mock defaults
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
    const pending = list.filter((v) => v && v.status === 'Pending').length;
    const inactive = list.filter((v) => v && v.status === 'Inactive').length;
    const archived = list.filter((v) => v && v.status === 'Archived').length;

    // Total associated outlets across active vendors
    const associatedOutlets = outlets.filter(
      (o) => o && o.status !== 'Archived' && o.status !== 'Deleted'
    ).length;

    return {
      total,
      active,
      pending,
      inactive,
      archived,
      totalOutlets: associatedOutlets,
      grandTotal: list.length,
    };
  },
};
