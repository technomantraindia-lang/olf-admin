import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Store,
  User,
  Settings,
  LogOut,
  X,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';

export default function Header({ setIsMobileOpen }) {
  const navigate = useNavigate();
  const { outlets, stations } = useOutlets();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
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

  // Filter outlets & stations for live Mega Search dropdown
  const filteredStations = searchQuery.trim()
    ? stations.filter(
        (st) =>
          st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          st.code.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredOutlets = searchQuery.trim()
    ? outlets.filter(
        (ot) =>
          ot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ot.stationCode && ot.stationCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (ot.vendorName && ot.vendorName.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/outlets/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };



  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-17 px-4 sm:px-6 bg-white border-b border-slate-200/90 shadow-2xs select-none">
      {/* Left: Mobile Menu Toggle + Brand Logo + Mega Search */}
      <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-2xl">
        {/* Mobile menu hamburger toggle */}
        <button
          type="button"
          onClick={() => setIsMobileOpen?.((prev) => !prev)}
          className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo with stylized multi-color accent line */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          title="OLF Admin Dashboard"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2 leading-none">
              <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors font-sans">
                OLF
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 hidden sm:inline-block">
                Admin
              </span>
            </div>
            {/* Stylized rainbow accent underline */}
            <div className="flex h-[3.5px] w-full rounded-full overflow-hidden mt-1 gap-0.5">
              <span className="w-3 bg-rose-500 rounded-full" />
              <span className="w-3 bg-amber-400 rounded-full" />
              <span className="w-3 bg-emerald-500 rounded-full" />
              <span className="w-3 bg-cyan-500 rounded-full" />
              <span className="w-3 bg-blue-600 rounded-full" />
            </div>
          </div>
        </Link>

        {/* Mega Search Input Box */}
        <div className="relative flex-1 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl ml-2 sm:ml-4" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Mega Search"
              className="w-full pl-11 pr-9 py-2 sm:py-2.5 text-sm sm:text-base font-normal bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 placeholder:text-sm sm:placeholder:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Live Search Quick Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
              {/* Stations matches */}
              {filteredStations.length > 0 && (
                <div className="mb-2">
                  <div className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Stations
                  </div>
                  {filteredStations.map((st) => (
                    <button
                      key={st.code}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigate(`/outlets/station/${st.code}`);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">{st.name}</span>
                        <span className="text-xs font-mono font-medium text-slate-500">({st.code})</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Outlets matches */}
              {filteredOutlets.length > 0 && (
                <div>
                  <div className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Outlets
                  </div>
                  {filteredOutlets.map((ot) => (
                    <button
                      key={ot.id}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigate(`/outlets/${ot.id}`);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Store className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{ot.name}</span>
                        <span className="text-xs text-slate-400 shrink-0 font-mono">
                          {ot.stationCode}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium shrink-0">
                        {ot.status || 'Active'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {filteredStations.length === 0 && filteredOutlets.length === 0 && (
                <div className="px-4 py-3 text-center text-sm text-slate-500">
                  No stations or outlets match "{searchQuery}"
                </div>
              )}

              {/* View all search results link */}
              <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-3.5">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-1 text-center text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Press Enter to search all outlets &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Action Icons: Bell + Blue 'A' Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* 3. Notification Bell icon button with indicator dot */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 sm:p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-84 bg-white rounded-xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-xs text-blue-600 font-semibold">3 unread</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                <div className="p-3.5 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-semibold text-slate-800">
                    New Outlet Onboarded
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    "Sayaji Cloud Kitchen" (BRC) verified and synced to IRCTC.
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">15m ago</span>
                </div>
                <div className="p-3.5 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-semibold text-slate-800">
                    IRCTC Push Sync Complete
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Port 4000 IRCTC eCatering catalog synced successfully.
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">1h ago</span>
                </div>
                <div className="p-3.5 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-semibold text-slate-800">
                    Vendor KYC Verified
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Vendor #1004 GST and commercial food license active.
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">3h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Circular Solid Blue User Avatar with White 'A' */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm sm:text-base shadow-xs hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            title="Super Admin Profile"
            aria-label="User Profile"
          >
            A
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm sm:text-base font-bold text-slate-800">Super Admin</p>
                <p className="text-xs text-slate-500 mt-0.5">admin@olfstores.com</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200/60">
                  IRCTC Administrator
                </span>
              </div>
              <div className="py-1.5">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                >
                  <User className="w-4.5 h-4.5 text-slate-400" />
                  <span>Account Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                >
                  <Settings className="w-4.5 h-4.5 text-slate-400" />
                  <span>Preferences</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer text-left font-semibold"
                >
                  <LogOut className="w-4.5 h-4.5 text-rose-500" />
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

