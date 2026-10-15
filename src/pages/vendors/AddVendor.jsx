import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VendorForm from '../../components/vendors/VendorForm';

export default function AddVendor() {
  return (
    <div className="space-y-5 max-w-4xl">
      {/* Top Navigation */}
      <div>
        <Link
          to="/outlets/vendors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vendor Management</span>
        </Link>
      </div>

      {/* Page Heading */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Add New Vendor
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Register a new catering business partner for railway station outlets.
        </p>
      </div>

      {/* Clean Form */}
      <VendorForm mode="create" />
    </div>
  );
}
