import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import OutletsOverview from '../pages/outlets/OutletsOverview';
import AllOutlets from '../pages/outlets/AllOutlets';
import StationOutlets from '../pages/outlets/StationOutlets';
import AddOutlet from '../pages/outlets/AddOutlet';
import OutletDetails from '../pages/outlets/OutletDetails';
import EditOutlet from '../pages/outlets/EditOutlet';

import VendorManagement from '../pages/vendors/VendorManagement';
import AddVendor from '../pages/vendors/AddVendor';
import EditVendor from '../pages/vendors/EditVendor';
import VendorDetails from '../pages/vendors/VendorDetails';

import ComingSoon from '../pages/ComingSoon';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Default redirect to Outlets */}
        <Route index element={<Navigate to="/outlets" replace />} />

        {/* 1. Outlets Overview & Master Views */}
        <Route path="outlets" element={<OutletsOverview />} />
        <Route path="outlets/all" element={<AllOutlets />} />

        {/* 2. Filtered Outlets Views */}
        <Route path="outlets/prepaid" element={<AllOutlets presetFilter="prepaid" />} />
        <Route path="outlets/pending" element={<AllOutlets presetFilter="pending" />} />
        <Route path="outlets/inactive" element={<AllOutlets presetFilter="inactive" />} />
        <Route path="outlets/closed" element={<AllOutlets presetFilter="closed" />} />
        <Route path="outlets/archived" element={<AllOutlets presetFilter="archived" />} />
        <Route path="outlets/filter/:filterType" element={<AllOutlets />} />

        {/* 3. Vendor Routes (MUST BE BEFORE outlets/:outletId TO PREVENT CONFLICTS) */}
        <Route path="outlets/vendors" element={<VendorManagement />} />
        <Route path="outlets/vendors/new" element={<AddVendor />} />
        <Route path="outlets/vendors/:vendorId/edit" element={<EditVendor />} />
        <Route path="outlets/vendors/:vendorId" element={<VendorDetails />} />

        {/* 4. Station & Outlet Detail Routes */}
        <Route path="outlets/station/:stationCode" element={<StationOutlets />} />
        <Route path="outlets/:stationCode/new" element={<AddOutlet />} />
        <Route path="outlets/:outletId/edit" element={<EditOutlet />} />
        <Route path="outlets/:outletId" element={<OutletDetails />} />

        {/* 5. Direct Vendors alias redirect */}
        <Route path="vendors" element={<Navigate to="/outlets/vendors" replace />} />
        <Route path="vendors/*" element={<Navigate to="/outlets/vendors" replace />} />

        {/* Sidebar Staging / Coming Soon Routes */}
        <Route
          path="dashboard"
          element={
            <ComingSoon
              title="Operational Dashboard"
              description="Live platform KPIs, passenger order velocity, and train arrival timelines."
            />
          }
        />
        <Route
          path="orders"
          element={<ComingSoon title="Orders Management" />}
        />
        <Route
          path="orders/all"
          element={<ComingSoon title="All Orders" />}
        />
        <Route
          path="orders/active"
          element={<ComingSoon title="Active Orders" />}
        />
        <Route
          path="orders/customers"
          element={<ComingSoon title="Customer Profiles" />}
        />
        <Route
          path="withdraw-requests"
          element={
            <ComingSoon
              title="Withdraw Requests"
              description="Vendor payout and wallet settlement ledger for station restaurants."
            />
          }
        />
        <Route
          path="stations"
          element={
            <ComingSoon
              title="Railway Stations Directory"
              description="Station master directory, platform mappings, and IRCTC division hubs."
            />
          }
        />
        <Route
          path="queries"
          element={<ComingSoon title="Partner Queries" />}
        />
        <Route
          path="hr"
          element={<ComingSoon title="Human Resources" />}
        />
        <Route
          path="blogs"
          element={<ComingSoon title="Content & Blogs" />}
        />
        <Route
          path="complaints"
          element={
            <ComingSoon
              title="Passenger Complaints & Tickets"
              description="IRCTC e-catering passenger escalations and food quality grievance tracking."
            />
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
