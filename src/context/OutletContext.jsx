import React, { createContext, useContext, useState, useCallback } from 'react';
import { outletService, getStoredOutletsSync } from '../services/outletService';
import { vendorService, getStoredVendorsSync } from '../services/vendorService';
import { mockStations } from '../data/mockStations';

const OutletContext = createContext(null);

export function OutletProvider({ children }) {
  const [stations] = useState(mockStations);
  const [outlets, setOutlets] = useState(() => getStoredOutletsSync());
  const [vendors, setVendors] = useState(() => getStoredVendorsSync());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const [isPushNoticeOpen, setIsPushNoticeOpen] = useState(false);
  const [selectedPushStation, setSelectedPushStation] = useState(null);

  // Refresh outlets helper
  const refreshOutlets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await outletService.getOutlets();
      setOutlets(data);
    } catch (err) {
      console.error('Failed to load outlets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh vendors helper
  const refreshVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendors();
      setVendors(data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toast notification helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // IRCTC notice modal helpers
  const openPushNotice = useCallback((station = null) => {
    setSelectedPushStation(station);
    setIsPushNoticeOpen(true);
  }, []);

  const closePushNotice = useCallback(() => {
    setIsPushNoticeOpen(false);
    setSelectedPushStation(null);
  }, []);

  // ================= OUTLET ACTIONS =================

  // Create outlet
  const createOutlet = useCallback(
    async (outletData) => {
      try {
        const created = await outletService.createOutlet(outletData);
        await refreshOutlets();
        showToast(`Outlet "${created.name}" created successfully.`, 'success');
        return created;
      } catch (err) {
        showToast(err.message || 'Failed to create outlet.', 'error');
        throw err;
      }
    },
    [refreshOutlets, showToast]
  );

  // Update outlet
  const updateOutlet = useCallback(
    async (id, outletData) => {
      try {
        const updated = await outletService.updateOutlet(id, outletData);
        await refreshOutlets();
        showToast(`Outlet "${updated.name}" updated successfully.`, 'success');
        return updated;
      } catch (err) {
        showToast(err.message || 'Failed to update outlet.', 'error');
        throw err;
      }
    },
    [refreshOutlets, showToast]
  );

  // Delete / Archive outlet
  const deleteOutlet = useCallback(
    async (id, hardDelete = false) => {
      try {
        const target = outlets.find((o) => o.id === id);
        await outletService.deleteOutlet(id, hardDelete);
        await refreshOutlets();
        showToast(
          `Outlet "${target ? target.name : id}" has been ${hardDelete ? 'permanently removed' : 'archived'}.`,
          'info'
        );
        return true;
      } catch (err) {
        showToast(err.message || 'Failed to delete outlet.', 'error');
        throw err;
      }
    },
    [outlets, refreshOutlets, showToast]
  );

  // ================= VENDOR ACTIONS =================

  // Create vendor
  const createVendor = useCallback(
    async (vendorData) => {
      try {
        const created = await vendorService.createVendor(vendorData);
        await refreshVendors();
        showToast(`Vendor "${created.businessName}" registered successfully.`, 'success');
        return created;
      } catch (err) {
        showToast(err.message || 'Failed to register vendor.', 'error');
        throw err;
      }
    },
    [refreshVendors, showToast]
  );

  // Update vendor
  const updateVendor = useCallback(
    async (id, vendorData) => {
      try {
        const updated = await vendorService.updateVendor(id, vendorData);
        await refreshVendors();
        showToast(`Vendor "${updated.businessName}" updated successfully.`, 'success');
        return updated;
      } catch (err) {
        showToast(err.message || 'Failed to update vendor.', 'error');
        throw err;
      }
    },
    [refreshVendors, showToast]
  );

  // Archive vendor
  const archiveVendor = useCallback(
    async (id, hardDelete = false) => {
      try {
        const target = vendors.find((v) => v.id === id);
        await vendorService.archiveVendor(id, hardDelete);
        await refreshVendors();
        showToast(
          `Vendor "${target ? target.businessName : id}" marked as archived.`,
          'info'
        );
        return true;
      } catch (err) {
        showToast(err.message || 'Failed to archive vendor.', 'error');
        throw err;
      }
    },
    [vendors, refreshVendors, showToast]
  );

  // Reset to initial mock data (both outlets & vendors)
  const resetToDefaults = useCallback(async () => {
    try {
      await outletService.resetToDefaults();
      await vendorService.resetToDefaults();
      await refreshOutlets();
      await refreshVendors();
      showToast('All mock data (outlets & vendors) reset to original defaults.', 'info');
    } catch {
      showToast('Failed to reset data.', 'error');
    }
  }, [refreshOutlets, refreshVendors, showToast]);

  // ================= DERIVED SELECTORS =================

  // Compute metrics for a specific station
  const getStationMetrics = useCallback(
    (stationCode) => {
      const stationOutlets = (outlets || []).filter(
        (o) =>
          o &&
          o.stationCode &&
          String(o.stationCode).toUpperCase() === String(stationCode || '').toUpperCase()
      );
      return outletService.calculateMetrics(stationOutlets);
    },
    [outlets]
  );

  // Compute metrics globally across all stations
  const getGlobalMetrics = useCallback(() => {
    return outletService.calculateMetrics(outlets || []);
  }, [outlets]);

  // Compute metrics for vendors
  const getVendorMetrics = useCallback(() => {
    return vendorService.calculateMetrics(vendors || [], outlets || []);
  }, [vendors, outlets]);

  // Get single station by code
  const getStation = useCallback(
    (code) => {
      if (!code) return null;
      return (
        (stations || []).find(
          (s) => s && s.code && String(s.code).toUpperCase() === String(code).toUpperCase()
        ) || null
      );
    },
    [stations]
  );

  // Get single outlet by ID
  const getOutlet = useCallback(
    (id) => {
      if (!id) return null;
      return (
        (outlets || []).find(
          (o) => o && o.id && String(o.id).toUpperCase() === String(id).toUpperCase()
        ) || null
      );
    },
    [outlets]
  );

  // Get single vendor by ID
  const getVendor = useCallback(
    (id) => {
      if (!id) return null;
      return (
        (vendors || []).find(
          (v) => v && v.id && String(v.id).toUpperCase() === String(id).toUpperCase()
        ) || null
      );
    },
    [vendors]
  );

  // Get all outlets belonging to a vendor
  const getOutletsByVendor = useCallback(
    (vendorId) => {
      if (!vendorId) return [];
      return (outlets || []).filter(
        (o) =>
          o &&
          o.vendorId &&
          String(o.vendorId).toUpperCase() === String(vendorId).toUpperCase()
      );
    },
    [outlets]
  );

  // Get unique stations where a vendor operates
  const getStationsByVendor = useCallback(
    (vendorId) => {
      const vendorOutlets = getOutletsByVendor(vendorId);
      const stationCodes = Array.from(
        new Set(vendorOutlets.map((o) => o.stationCode).filter(Boolean))
      );
      return (stations || []).filter((s) => s && s.code && stationCodes.includes(s.code));
    },
    [getOutletsByVendor, stations]
  );

  const value = {
    stations,
    outlets,
    vendors,
    loading,
    toast,
    isPushNoticeOpen,
    selectedPushStation,
    showToast,
    hideToast,
    openPushNotice,
    closePushNotice,
    // Outlet methods
    createOutlet,
    updateOutlet,
    deleteOutlet,
    // Vendor methods
    createVendor,
    updateVendor,
    archiveVendor,
    resetToDefaults,
    // Selectors
    getStationMetrics,
    getGlobalMetrics,
    getVendorMetrics,
    getStation,
    getOutlet,
    getVendor,
    getOutletsByVendor,
    getStationsByVendor,
    refreshOutlets,
    refreshVendors,
  };

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlets() {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error('useOutlets must be used within an OutletProvider');
  }
  return context;
}
