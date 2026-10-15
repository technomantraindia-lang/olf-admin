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
  ArrowLeft,
  X,
  Search,
} from 'lucide-react';

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) {
  const location = useLocation();

  // Active route indicators
  const isOutletsActive = location.pathname.startsWith('/outlets');
  const isOrdersActive = location.pathname.startsWith('/orders');
  const isReportsActive = location.pathname.startsWith('/reports');
  const isStationsActive = location.pathname.startsWith('/stations');

  // Submenu expansion states
  const [outletsExpanded, setOutletsExpanded] = useState(true);
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [stationsExpanded, setStationsExpanded] = useState(false);

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Premium UI: Active parent pill with rich blue fill (Analytics & Reports style)
  const navItemClass = (isActive) =>
    clsx(
      'transition-all duration-150 group cursor-pointer select-none',
      isCollapsed
        ? 'w-11 h-11 mx-auto flex items-center justify-center rounded-xl'
        : 'w-full flex items-center gap-3 px-3.5 py-2.5 text-[13.5px] font-medium rounded-xl',
      isActive
        ? 'bg-blue-600 text-white font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    );

  // Premium UI: Sub-menu child item (Sales & Revenue Reports style: vibrant blue for active, slate for others)
  const subItemClass = (isActive) =>
    clsx(
      'flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors cursor-pointer',
      isActive
        ? 'text-blue-600 font-semibold bg-blue-50/70'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-normal'
    );

  const iconClass = (isActive) =>
    clsx(
      'shrink-0 transition-all duration-150',
      isCollapsed ? 'w-[22px] h-[22px] stroke-[2.2]' : 'w-5 h-5 stroke-[2]',
      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
    );

  const chevronClass = (isActive) =>
    clsx(
      'w-4 h-4 shrink-0 transition-colors',
      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
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
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-200 select-none shadow-xs lg:static',
          // Mobile responsive styles
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop collapsed width
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand / Logo Header (Shown only on mobile drawer, desktop has it in the top Header) */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 lg:hidden">
          <NavLink
            to="/dashboard"
            onClick={closeMobile}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            {/* OLF Cloche Mark */}
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
              >
                <path d="M18 15H6a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1Z" />
                <path d="M12 4v4" />
                <path d="M4 19h16" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                OLF
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                Admin
              </span>
            </div>
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className={clsx('flex-1 overflow-y-auto py-3.5', isCollapsed ? 'px-2 space-y-2' : 'px-3 space-y-1')}>
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard className={iconClass(isActive)} />
                {!isCollapsed && <span>Dashboard</span>}
              </>
            )}
          </NavLink>

          {/* Orders (Group with sub-links) */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOrdersExpanded(!ordersExpanded);
              }}
              className={navItemClass(isOrdersActive)}
              title={isCollapsed ? 'Orders' : undefined}
            >
              <ShoppingBag className={iconClass(isOrdersActive)} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Orders</span>
                  {ordersExpanded ? (
                    <ChevronDown className={chevronClass(isOrdersActive)} />
                  ) : (
                    <ChevronRight className={chevronClass(isOrdersActive)} />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && ordersExpanded && (
              <div className="mt-1 bg-slate-50/70 border border-slate-100/80 rounded-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
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
              className={navItemClass(isOutletsActive)}
              title={isCollapsed ? 'Outlets' : undefined}
            >
              <Store className={iconClass(isOutletsActive)} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">Outlets</span>
                  {outletsExpanded ? (
                    <ChevronDown className={chevronClass(isOutletsActive)} />
                  ) : (
                    <ChevronRight className={chevronClass(isOutletsActive)} />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && outletsExpanded && (
              <div className="mt-1 bg-slate-50/70 border border-slate-100/80 rounded-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
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
            {({ isActive }) => (
              <>
                <Wallet className={iconClass(isActive)} />
                {!isCollapsed && <span>Withdraw Requests</span>}
              </>
            )}
          </NavLink>

          {/* Railway Stations */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setStationsExpanded(!stationsExpanded);
              }}
              className={navItemClass(isStationsActive)}
              title={isCollapsed ? 'Railway Stations' : undefined}
            >
              <Train className={iconClass(isStationsActive)} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Railway Stations</span>
                  {stationsExpanded ? (
                    <ChevronDown className={chevronClass(isStationsActive)} />
                  ) : (
                    <ChevronRight className={chevronClass(isStationsActive)} />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && stationsExpanded && (
              <div className="mt-1 bg-slate-50/70 border border-slate-100/80 rounded-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
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

          {/* Section Divider */}
          <div className={clsx('my-3 border-t border-slate-200/80', isCollapsed ? 'w-10 mx-auto' : 'mx-2')} />

          {/* Queries */}
          <NavLink
            to="/queries"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Queries' : undefined}
          >
            {({ isActive }) => (
              <>
                <HelpCircle className={iconClass(isActive)} />
                {!isCollapsed && <span>Queries</span>}
              </>
            )}
          </NavLink>

          {/* Human Resources */}
          <NavLink
            to="/hr"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Human Resources' : undefined}
          >
            {({ isActive }) => (
              <>
                <Users className={iconClass(isActive)} />
                {!isCollapsed && <span>Human Resources</span>}
              </>
            )}
          </NavLink>

          {/* Blogs */}
          <NavLink
            to="/blogs"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Blogs' : undefined}
          >
            {({ isActive }) => (
              <>
                <BookOpen className={iconClass(isActive)} />
                {!isCollapsed && <span>Blogs</span>}
              </>
            )}
          </NavLink>

          {/* Complaints */}
          <NavLink
            to="/complaints"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Complaints' : undefined}
          >
            {({ isActive }) => (
              <>
                <AlertTriangle className={iconClass(isActive)} />
                {!isCollapsed && <span>Complaints</span>}
              </>
            )}
          </NavLink>

          {/* Invoices */}
          <NavLink
            to="/invoices"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Invoices' : undefined}
          >
            {({ isActive }) => (
              <>
                <FileText className={iconClass(isActive)} />
                {!isCollapsed && <span>Invoices</span>}
              </>
            )}
          </NavLink>

          {/* Reports */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setReportsExpanded(!reportsExpanded);
              }}
              className={navItemClass(isReportsActive)}
              title={isCollapsed ? 'Reports' : undefined}
            >
              <BarChart3 className={iconClass(isReportsActive)} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Reports</span>
                  {reportsExpanded ? (
                    <ChevronDown className={chevronClass(isReportsActive)} />
                  ) : (
                    <ChevronRight className={chevronClass(isReportsActive)} />
                  )}
                </>
              )}
            </button>
            {!isCollapsed && reportsExpanded && (
              <div className="mt-1 bg-slate-50/70 border border-slate-100/80 rounded-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
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

        {/* Sidebar Footer / User Profile & Collapse Arrow */}
        <div className={clsx('border-t border-slate-200/80 bg-white', isCollapsed ? 'p-2 space-y-2' : 'p-2.5 space-y-1')}>
          {/* Super Admin User Profile Card */}
          <div
            className={clsx(
              'rounded-xl hover:bg-slate-50 transition-colors cursor-pointer select-none',
              isCollapsed ? 'w-11 h-11 mx-auto flex items-center justify-center' : 'flex items-center justify-between p-2'
            )}
            title={isCollapsed ? 'Super Admin (superadmin@olfstores.com)' : undefined}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className={clsx(
                  'rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs',
                  isCollapsed ? 'w-9 h-9' : 'w-8 h-8'
                )}
              >
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
          </div>

          {/* Collapse / Expand Toggle Button matching reference arrow <- */}
          <div className="pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={clsx(
                'text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs font-medium',
                isCollapsed
                  ? 'w-11 h-9 mx-auto flex items-center justify-center'
                  : 'w-full p-2 flex items-center gap-2'
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 mx-auto" />
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-slate-500">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
