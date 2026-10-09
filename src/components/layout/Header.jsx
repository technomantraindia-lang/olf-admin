import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronRight,
  ShieldCheck,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';

export default function Header({ setIsMobileOpen }) {
  const location = useLocation();
  const { getStation, getOutlet, openPushNotice } = useOutlets();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ label: 'Admin', path: '/outlets' }];

    if (path === '/outlets') {
      crumbs.push({ label: 'Outlets Overview', path: '/outlets' });
    } else if (path === '/outlets/all') {
      crumbs.push({ label: 'Outlets', path: '/outlets' });
      crumbs.push({ label: 'All Outlets', path: '/outlets/all' });
    } else if (path.startsWith('/outlets/filter/')) {
      const filterType = path.split('/')[3];
      crumbs.push({ label: 'Outlets', path: '/outlets' });
      crumbs.push({
        label: `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Outlets`,
        path,
      });
    } else if (path.startsWith('/outlets/station/')) {
      const stationCode = path.split('/')[3]?.toUpperCase();
      const station = getStation(stationCode);
      crumbs.push({ label: 'Outlets Overview', path: '/outlets' });
      crumbs.push({
        label: `${station?.name || stationCode} (${stationCode})`,
        path,
      });
    } else if (path.endsWith('/new')) {
      const parts = path.split('/');
      const stationCode = parts[2]?.toUpperCase();
      crumbs.push({ label: 'Outlets Overview', path: '/outlets' });
      if (stationCode && stationCode !== 'OUTLETS') {
        crumbs.push({
          label: `${stationCode} Outlets`,
          path: `/outlets/station/${stationCode}`,
        });
      }
      crumbs.push({ label: 'Add Outlet', path });
    } else if (path.endsWith('/edit')) {
      const parts = path.split('/');
      const outletId = parts[2];
      const outlet = getOutlet(outletId);
      crumbs.push({ label: 'Outlets Overview', path: '/outlets' });
      if (outlet) {
        crumbs.push({
          label: outlet.name,
          path: `/outlets/${outletId}`,
        });
      }
      crumbs.push({ label: 'Edit', path });
    } else if (path.startsWith('/outlets/')) {
      const outletId = path.split('/')[2];
      const outlet = getOutlet(outletId);
      crumbs.push({ label: 'Outlets Overview', path: '/outlets' });
      crumbs.push({
        label: outlet ? outlet.name : outletId,
        path,
      });
    } else {
      const moduleName = path.replace('/', '').replace(/-/g, ' ');
      crumbs.push({
        label: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
        path,
      });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-slate-800 max-w-[200px] truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* IRCTC Integration Indicator */}
        <button
          type="button"
          onClick={() => openPushNotice(null)}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          title="IRCTC e-Catering Integration Status"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>IRCTC Sync Ready</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-medium text-slate-800">
                    New Outlet Onboarded
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    "Sayaji Cloud Kitchen" (BRC) submitted onboarding docs.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15m ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-medium text-slate-800">
                    Wallet Low Balance Alert
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    "Railway Canteen Corner" balance fell below ₹3,000 threshold.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1h ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-medium text-slate-800">
                    IRCTC Catalog Sync Scheduled
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nightly station menu cache sync completed successfully.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">3h ago</span>
                </div>
              </div>
              <div className="px-4 py-1.5 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
              VK
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                Vivek K.
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                Ops Admin
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Vivek Kumar</p>
                <p className="text-[11px] text-slate-500">ops.lead@olfstores.in</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded">
                  Super Admin
                </span>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Station Preferences</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
