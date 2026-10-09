import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useOutlets } from '../../context/OutletContext';
import VendorForm from '../../components/vendors/VendorForm';
import NotFound from '../NotFound';

export default function EditVendor() {
  const { vendorId } = useParams();
  const { getVendor } = useOutlets();
  const vendor = getVendor(vendorId);

  if (!vendor) {
    return (
      <NotFound
        message={`Vendor with ID "${vendorId}" was not found or has been removed from the platform.`}
      />
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to={`/outlets/vendors/${vendor.id}`}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {vendor.businessName} Profile</span>
        </Link>
      </div>

      {/* Page Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                  {vendor.id}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Edit Vendor: {vendor.businessName}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update business entity details, contact representatives, and statutory compliance status
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Form Container */}
      <VendorForm initialData={vendor} mode="edit" />
    </div>
  );
}
