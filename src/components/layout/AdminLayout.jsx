import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../ui/Toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useOutlets } from '../../context/OutletContext';
import { Info } from 'lucide-react';

const CURRENT_YEAR = 2026;

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    toast,
    hideToast,
    isPushNoticeOpen,
    closePushNotice,
    selectedPushStation,
  } = useOutlets();

  return (
    <div className="h-screen bg-slate-50 flex flex-col antialiased overflow-hidden">
      {/* Top Header - Spans full width across viewport */}
      <Header setIsMobileOpen={setIsMobileOpen} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Content Wrapper */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          {/* Main Workspace View - Full width fluid layout */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
            <Outlet />
          </main>

          {/* Footer note */}
          <footer className="px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white shrink-0">
            <p>
              &copy; {CURRENT_YEAR} OLF Stores • Railway Meal-Delivery Platform
              (IRCTC Partner Network) • Frontend Outlets Module
            </p>
          </footer>
        </div>
      </div>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />

      {/* IRCTC Push Informational Modal */}
      <Modal
        isOpen={isPushNoticeOpen}
        onClose={closePushNotice}
        title="IRCTC e-Catering Integration Notice"
        description="Live station catalog synchronization status"
        maxWidth="max-w-md"
        footer={
          <Button variant="primary" size="sm" onClick={closePushNotice}>
            Understood
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Integration Notice:</strong> Direct IRCTC e-Catering live push
              integration is currently staged for <em>Phase 2</em> backend deployment.
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All outlet records for{' '}
            <strong>
              {selectedPushStation ? `${selectedPushStation.name} (${selectedPushStation.code})` : 'configured stations'}
            </strong>{' '}
            are validated, cached locally, and comply with the required IRCTC vendor
            schema (operating windows, minimum order values, and kitchen hygiene flags).
          </p>

          <p className="text-xs text-slate-500 leading-relaxed">
            No mock requests are being dispatched to IRCTC production servers. Once the
            Node.js/Express service and IRCTC partner credentials are authenticated in
            Phase 2, automated batch sync will become active.
          </p>
        </div>
      </Modal>
    </div>
  );
}
