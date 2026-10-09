import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import VendorForm from '../../components/vendors/VendorForm';

export default function AddVendor() {
  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/outlets/vendors"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vendor Management</span>
        </Link>
      </div>

      {/* Page Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Add New Vendor
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new catering business partner and configure statutory compliance records
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Form Container */}
      <VendorForm mode="create" />
    </div>
  );
}
