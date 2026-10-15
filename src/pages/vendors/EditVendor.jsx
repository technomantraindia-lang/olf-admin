import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <div className="space-y-5 max-w-4xl">
      {/* Top Navigation */}
      <div>
        <Link
          to={`/outlets/vendors/${vendor.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {vendor.businessName || vendor.contactPerson} Profile</span>
        </Link>
      </div>

      {/* Page Heading */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Edit Vendor: {vendor.businessName || vendor.contactPerson}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update vendor contact details and registered address.
        </p>
      </div>

      {/* Clean Form */}
      <VendorForm initialData={vendor} mode="edit" />
    </div>
  );
}
