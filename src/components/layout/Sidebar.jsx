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

  const [outletsExpanded, setOutletsExpanded] = useState(true);
  const [ordersExpanded, setOrdersExpanded] = useState(false);

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const navItemClass = (isActive) =>
    clsx(
      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group cursor-pointer',
      isActive
        ? 'bg-emerald-50 text-emerald-800 font-semibold border-r-2 border-emerald-600 shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 hover:translate-x-0.5'
    );

  const subItemClass = (isActive) =>
    clsx(
      'flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 pl-9 cursor-pointer',
      isActive
        ? 'text-emerald-700 bg-emerald-50/90 font-semibold'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5'
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
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <NavLink
            to="/outlets"
            onClick={closeMobile}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <Train className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  OLF Stores
                </span>
                <span className="text-[11px] font-medium text-emerald-600">
                  Station Admin Portal
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
            <LayoutDashboard className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
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
              <ShoppingBag className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Orders</span>
                  {ordersExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
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

          {/* Outlets Module (Main active module) */}
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
              <Store className="w-5 h-5 shrink-0 text-emerald-600" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-semibold text-slate-900">
                    Outlets
                  </span>
                  {outletsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
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
                  Deleted / Archived Outlets
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
            <Wallet className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!isCollapsed && <span>Withdraw Requests</span>}
          </NavLink>

          {/* Railway Stations */}
          <NavLink
            to="/stations"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Railway Stations' : undefined}
          >
            <Train className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!isCollapsed && <span>Railway Stations</span>}
          </NavLink>

          {/* Queries */}
          <NavLink
            to="/queries"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Queries' : undefined}
          >
            <HelpCircle className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!isCollapsed && <span>Queries</span>}
          </NavLink>

          {/* Human Resources */}
          <NavLink
            to="/hr"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Human Resources' : undefined}
          >
            <Users className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!isCollapsed && <span>Human Resources</span>}
          </NavLink>

          {/* Blogs */}
          <NavLink
            to="/blogs"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Blogs' : undefined}
          >
            <BookOpen className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!isCollapsed && <span>Blogs</span>}
          </NavLink>

          {/* Complaints */}
          <NavLink
            to="/complaints"
            onClick={closeMobile}
            className={({ isActive }) => navItemClass(isActive)}
            title={isCollapsed ? 'Complaints' : undefined}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!isCollapsed && <span>Complaints</span>}
          </NavLink>
        </div>

        {/* Sidebar Footer / System Badge */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  IRCTC Sync Ready
                </span>
                <span className="font-mono text-[10px] text-slate-400">v1.2</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex items-center justify-center gap-1.5 w-full py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse Sidebar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-full flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
