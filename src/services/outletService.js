import { mockStations } from '../data/mockStations';
import { initialMockOutlets } from '../data/mockOutlets';

const STORAGE_KEY = 'olf_stores_outlets_data_v3';

const legacyVendorIdMap = {
  'VND-001': '1001',
  'VND-002': '1002',
  'VND-003': '1003',
  'VND-004': '1004',
  'VND-005': '1005',
  'VND-006': '1006',
};

/**
 * Helper to get outlets from LocalStorage or initialize with mock data
 */
export function getStoredOutletsSync() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockOutlets));
      return initialMockOutlets;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockOutlets));
      return initialMockOutlets;
    }
    return parsed.map((o) => ({
      ...o,
      vendorId: legacyVendorIdMap[o.vendorId] || o.vendorId || '1001',
      stationCode: o.stationCode || 'BRC',
      stationName: o.stationName || 'Vadodara',
      status: o.status || 'Active',
      name: o.name || 'Unnamed Outlet',
      wallet: o.wallet || { balance: 10000, threshold: 4000 },
      paymentModes: o.paymentModes || { cod: true, prepaid: true },
    }));
  } catch (err) {
    console.warn('Error reading from localStorage, using initial mock data:', err);
    return initialMockOutlets;
  }
}

/**
 * Helper to save outlets to LocalStorage
 */
function saveStoredOutlets(outlets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outlets));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

export const outletService = {
  /**
   * Get all railway stations
   */
  async getStations() {
    return Promise.resolve([...mockStations]);
  },

  /**
   * Get station details by station code
   */
  async getStationByCode(code) {
    const station = mockStations.find(
      (s) => s.code.toUpperCase() === String(code).toUpperCase()
    );
    return Promise.resolve(station || null);
  },

  /**
   * Get all outlets with optional filtering
   */
  async getOutlets(filters = {}) {
    const allOutlets = getStoredOutletsSync();
    let result = [...allOutlets];

    if (filters.stationCode && filters.stationCode !== 'ALL') {
      result = result.filter(
        (o) => o.stationCode.toUpperCase() === filters.stationCode.toUpperCase()
      );
    }

    if (filters.vendorId && filters.vendorId !== 'ALL') {
      result = result.filter(
        (o) => o.vendorId && o.vendorId.toUpperCase() === filters.vendorId.toUpperCase()
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(
        (o) => o.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.paymentMode && filters.paymentMode !== 'ALL') {
      if (filters.paymentMode === 'cod') {
        result = result.filter((o) => o.paymentModes?.cod);
      } else if (filters.paymentMode === 'prepaid') {
        result = result.filter((o) => o.paymentModes?.prepaid);
      } else if (filters.paymentMode === 'both') {
        result = result.filter((o) => o.paymentModes?.cod && o.paymentModes?.prepaid);
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          o.stationCode.toLowerCase().includes(q) ||
          o.stationName.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(result);
  },

  /**
   * Get a single outlet by ID
   */
  async getOutletById(id) {
    const allOutlets = getStoredOutletsSync();
    const outlet = allOutlets.find((o) => o.id === id);
    return Promise.resolve(outlet || null);
  },

  /**
   * Create a new outlet
   */
  async createOutlet(outletData) {
    const allOutlets = getStoredOutletsSync();

    // Generate unique ID if not provided
    const stationCode = (outletData.stationCode || 'GEN').toUpperCase();
    const stationCount = allOutlets.filter((o) => o.stationCode === stationCode).length + 1;
    const generatedId =
      outletData.id?.trim() ||
      `OLF-${stationCode}-${String(stationCount).padStart(3, '0')}`;

    const newOutlet = {
      ...outletData,
      id: generatedId,
      stationCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newOutlet, ...allOutlets];
    saveStoredOutlets(updatedList);
    return Promise.resolve(newOutlet);
  },

  /**
   * Update an existing outlet
   */
  async updateOutlet(id, updatedFields) {
    const allOutlets = getStoredOutletsSync();
    const index = allOutlets.findIndex((o) => o.id === id);

    if (index === -1) {
      return Promise.reject(new Error(`Outlet with ID ${id} not found.`));
    }

    const updatedOutlet = {
      ...allOutlets[index],
      ...updatedFields,
      id, // Preserve id
      updatedAt: new Date().toISOString(),
    };

    allOutlets[index] = updatedOutlet;
    saveStoredOutlets(allOutlets);
    return Promise.resolve(updatedOutlet);
  },

  /**
   * Soft-delete an outlet (mark status as 'Deleted' or remove based on preference)
   */
  async deleteOutlet(id, hardDelete = false) {
    const allOutlets = getStoredOutletsSync();
    let updatedList;

    if (hardDelete) {
      updatedList = allOutlets.filter((o) => o.id !== id);
    } else {
      updatedList = allOutlets.map((o) =>
        o.id === id ? { ...o, status: 'Deleted', updatedAt: new Date().toISOString() } : o
      );
    }

    saveStoredOutlets(updatedList);
    return Promise.resolve({ success: true, id });
  },

  /**
   * Reset mock data to original defaults
   */
  async resetToDefaults() {
    saveStoredOutlets(initialMockOutlets);
    return Promise.resolve(initialMockOutlets);
  },

  /**
   * Calculate summary metrics for all stations or a specific station
   */
  calculateMetrics(outletsList = []) {
    const list = Array.isArray(outletsList) ? outletsList : [];
    const total = list.filter((o) => o && o.status !== 'Deleted' && o.status !== 'Archived').length;
    const active = list.filter((o) => o && o.status === 'Active').length;
    const pending = list.filter((o) => o && o.status === 'Pending').length;
    const inactive = list.filter((o) => o && o.status === 'Inactive').length;
    const closed = list.filter((o) => o && o.status === 'Closed').length;
    const archived = list.filter((o) => o && (o.status === 'Deleted' || o.status === 'Archived')).length;

    return {
      total,
      active,
      pending,
      inactive,
      closed,
      archived,
      deleted: archived,
      grandTotal: list.length,
    };
  },
};
