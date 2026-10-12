import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Wallet,
  Train,
  HelpCircle,
  Users,
  BookOpen,
  AlertTriangle,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
} from 'lucide-react';

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) {
  const location = useLocation();

  // Keep submenus expanded if child route is active
  const isOutletsActive = location.pathname.startsWith('/outlets');
  const isOrdersActive = location.pathname.startsWith('/orders');
  const isReportsActive = location.pathname.startsWith('/reports');
  const isStationsActive = location.pathname.startsWith('/stations');

  const [outletsExpanded, setOutletsExpanded] = useState(true);
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [stationsExpanded, setStationsExpanded] = useState(false);

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Orange theme active and hover states matching reference screenshot
  const navItemClass = (isActive) =>
    clsx(
      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group cursor-pointer',
      isActive
        ? 'bg-orange-50 text-orange-600 font-semibold border-r-2 border-orange-500 shadow-2xs'
        : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50 hover:translate-x-0.5'
    );

  const subItemClass = (isActive) =>
    clsx(
      'flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 pl-9 cursor-pointer',
      isActive
        ? 'text-orange-600 bg-orange-50/80 font-semibold'
        : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50/40 hover:translate-x-0.5'
    );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 select-none shadow-xs lg:static',
          // Mobile responsive styles
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop collapsed width
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand / Logo Header (OLF Orange Logo matching reference screenshot) */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <NavLink
            to="/dashboard"
            onClick={closeMobile}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            {/* OLF Cloche/Serving Plate Mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
              >
                <path d="M18 15H6a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1Z" />
                <path d="M12 4v4" />
                <path d="M4 19h16" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5">
                <span className="font-black text-orange-500 text-2xl tracking-tight">
                  OLF
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Orders (Group with sub-links) */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOrdersExpanded(!ordersExpanded);
              }}
              className={clsx(
                'w-full',
                navItemClass(isOrdersActive)
              )}
              title={isCollapsed ? 'Orders' : undefined}
            >
              <ShoppingBag className="w-5 h-5 shrink-0 text-orange-500" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Orders</span>
                  {ordersExpanded ? (
                    <ChevronDown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && ordersExpanded && (
              <div className="mt-1 space-y-0.5 animate-in fade-in duration-150">
                <NavLink
                  to="/orders/all"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  All Orders
                </NavLink>
                <NavLink
                  to="/orders/active"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Active Orders
                </NavLink>
                <NavLink
                  to="/orders/customers"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Customers
                </NavLink>
              </div>
            )}
          </div>

          {/* Outlets Module */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOutletsExpanded(!outletsExpanded);
              }}
              className={clsx(
                'w-full',
                navItemClass(isOutletsActive)
              )}
              title={isCollapsed ? 'Outlets' : undefined}
            >
              <Store className="w-5 h-5 shrink-0 text-orange-500" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">
                    Outlets
                  </span>
                  {outletsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && outletsExpanded && (
              <div className="mt-1 space-y-0.5 animate-in fade-in duration-150">
                <NavLink
                  to="/outlets"
                  end
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Outlets Overview
                </NavLink>
                <NavLink
                  to="/outlets/all"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  All Outlets
                </NavLink>
                <NavLink
                  to="/outlets/vendors"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Vendor Management
                </NavLink>
                <NavLink
                  to="/outlets/prepaid"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Prepaid Outlets
                </NavLink>
                <NavLink
                  to="/outlets/pending"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Pending Outlets
                </NavLink>
                <NavLink
                  to="/outlets/inactive"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Inactive Outlets
                </NavLink>
                <NavLink
                  to="/outlets/closed"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Closed Outlets
                </NavLink>
                <NavLink
                  to="/outlets/archived"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Deleted Outlets
                </NavLink>
              </div>
            )}
          </div>

          {/* Withdraw Requests */}
          <NavLink
            to="/withdraw-requests"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Withdraw Requests' : undefined}
          >
            <Wallet className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Withdraw Requests</span>}
          </NavLink>

          {/* Railway Stations */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setStationsExpanded(!stationsExpanded);
              }}
              className={clsx('w-full', navItemClass(isStationsActive))}
              title={isCollapsed ? 'Railway Stations' : undefined}
            >
              <Train className="w-5 h-5 shrink-0 text-orange-500" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Railway Stations</span>
                  {stationsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && stationsExpanded && (
              <div className="mt-1 space-y-0.5 animate-in fade-in duration-150">
                <NavLink
                  to="/stations"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  All Stations
                </NavLink>
              </div>
            )}
          </div>

          {/* Queries */}
          <NavLink
            to="/queries"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Queries' : undefined}
          >
            <HelpCircle className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Queries</span>}
          </NavLink>

          {/* Human Resources */}
          <NavLink
            to="/hr"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Human Resources' : undefined}
          >
            <Users className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Human Resources</span>}
          </NavLink>

          {/* Blogs */}
          <NavLink
            to="/blogs"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Blogs' : undefined}
          >
            <BookOpen className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Blogs</span>}
          </NavLink>

          {/* Complaints */}
          <NavLink
            to="/complaints"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Complaints' : undefined}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Complaints</span>}
          </NavLink>

          {/* Invoices */}
          <NavLink
            to="/invoices"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Invoices' : undefined}
          >
            <FileText className="w-5 h-5 shrink-0 text-orange-500" />
            {!isCollapsed && <span>Invoices</span>}
          </NavLink>

          {/* Reports (with Complaint Feedback sub-item matching screenshot) */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setReportsExpanded(!reportsExpanded);
              }}
              className={clsx('w-full', navItemClass(isReportsActive))}
              title={isCollapsed ? 'Reports' : undefined}
            >
              <BarChart3 className="w-5 h-5 shrink-0 text-orange-500" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Reports</span>
                  {reportsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && reportsExpanded && (
              <div className="mt-1 space-y-0.5 animate-in fade-in duration-150">
                <NavLink
                  to="/reports/complaint-feedback"
                  onClick={closeMobile}
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Complaint Feedback
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer / User Profile matching Image 1 ("CN Super Admin superadmin@olfstores.com") */}
        <div className="border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                CN
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    Super Admin
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    superadmin@olfstores.com
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown className="w-4 h-4 text-orange-500 shrink-0" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
