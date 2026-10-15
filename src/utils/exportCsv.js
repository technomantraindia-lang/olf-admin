/**
 * Export an array of outlet records as a CSV file
 * @param {Array} outlets - Array of outlet objects
 * @param {string} filename - Name of downloaded file
 * @param {Array} vendors - Array of vendor objects (optional, for vendor lookup)
 */
export function exportOutletsToCsv(outlets, filename = 'olf-outlets-export.csv', vendors = []) {
  if (!outlets || outlets.length === 0) {
    alert('No outlet records available to export.');
    return;
  }

  const vendorMap = new Map((vendors || []).map((v) => [v.id, v.businessName]));

  const headers = [
    'Outlet ID',
    'Outlet Name',
    'Vendor ID',
    'Vendor Name',
    'Category',
    'Station Code',
    'Station Name',
    'Status',
    'Opening Time',
    'Closing Time',
    'Prep Time (mins)',
    'Min Order (INR)',
    'COD Enabled',
    'Prepaid Enabled',
    'Wallet Balance (INR)',
    'Wallet Threshold (INR)',
    'Contact Person',
    'Phone',
    'Email',
    'Address',
    'City',
    'State',
    'Pincode',
    'Last Updated',
  ];

  const escapeCsvCell = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = outlets.map((outlet) => {
    const vendorName = vendorMap.get(outlet.vendorId) || outlet.vendorName || 'Not Assigned';
    return [
      escapeCsvCell(outlet.id),
      escapeCsvCell(outlet.name),
      escapeCsvCell(outlet.vendorId || '—'),
      escapeCsvCell(vendorName),
      escapeCsvCell(outlet.category),
      escapeCsvCell(outlet.stationCode),
      escapeCsvCell(outlet.stationName),
      escapeCsvCell(outlet.status),
      escapeCsvCell(outlet.openingTime),
      escapeCsvCell(outlet.closingTime),
      escapeCsvCell(outlet.prepTime),
      escapeCsvCell(outlet.minOrderValue),
      escapeCsvCell(outlet.paymentModes?.cod ? 'Yes' : 'No'),
      escapeCsvCell(outlet.paymentModes?.prepaid ? 'Yes' : 'No'),
      escapeCsvCell(outlet.wallet?.balance ?? 0),
      escapeCsvCell(outlet.wallet?.threshold ?? 0),
      escapeCsvCell(outlet.contactPerson),
      escapeCsvCell(outlet.phone),
      escapeCsvCell(outlet.email),
      escapeCsvCell(outlet.address),
      escapeCsvCell(outlet.city),
      escapeCsvCell(outlet.state),
      escapeCsvCell(outlet.pincode),
      escapeCsvCell(outlet.updatedAt),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export an array of vendor records as a CSV file
 * @param {Array} vendors - Array of vendor objects
 * @param {string} filename - Name of downloaded file
 * @param {Array} outlets - Array of outlets to compute counts
 */
export function exportVendorsToCsv(vendors, filename = 'olf-vendors-export.csv', outlets = []) {
  if (!vendors || vendors.length === 0) {
    alert('No vendor records available to export.');
    return;
  }

  const headers = [
    'Vendor ID',
    'Brand Name',
    'Legal Name',
    'PAN Number',
    'GSTIN',
    'Category',
    'Contact Person',
    'Phone',
    'Email',
    'Address',
    'City',
    'State',
    'Pincode',
    'Bank Name',
    'Bank Account',
    'IFSC Code',
    'Commission Rate (%)',
    'Payout Cycle',
    'Status',
    'Registration Date',
    'Total Outlets',
    'Operating Stations',
    'Total Orders (Mock)',
    'Gross Order Value (Mock INR)',
    'Vendor Earnings (Mock INR)',
    'Notes',
  ];

  const escapeCsvCell = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = vendors.map((vendor) => {
    const associatedOutlets = (outlets || []).filter(
      (o) => o && o.vendorId && String(o.vendorId).toUpperCase() === String(vendor.id).toUpperCase()
    );
    const stationCodes = Array.from(new Set(associatedOutlets.map((o) => o.stationCode))).join('; ');

    return [
      escapeCsvCell(vendor.id),
      escapeCsvCell(vendor.brandName || vendor.businessName),
      escapeCsvCell(vendor.legalName || vendor.businessName),
      escapeCsvCell(vendor.panNumber || ''),
      escapeCsvCell(vendor.gstin || ''),
      escapeCsvCell(vendor.category),
      escapeCsvCell(vendor.contactPerson),
      escapeCsvCell(vendor.phone),
      escapeCsvCell(vendor.email),
      escapeCsvCell(vendor.address || ''),
      escapeCsvCell(vendor.city),
      escapeCsvCell(vendor.state),
      escapeCsvCell(vendor.pincode),
      escapeCsvCell(vendor.bankName || ''),
      escapeCsvCell(vendor.bankAccountNumber || ''),
      escapeCsvCell(vendor.bankIfsc || ''),
      escapeCsvCell(vendor.commissionRate ?? 15),
      escapeCsvCell(vendor.payoutCycle || 'Weekly Payment'),
      escapeCsvCell(vendor.status),
      escapeCsvCell(vendor.registrationDate),
      escapeCsvCell(associatedOutlets.length),
      escapeCsvCell(stationCodes || 'None'),
      escapeCsvCell(vendor.metrics?.totalOrders ?? 0),
      escapeCsvCell(vendor.metrics?.grossOrderValue ?? 0),
      escapeCsvCell(vendor.metrics?.vendorEarnings ?? 0),
      escapeCsvCell(vendor.notes || ''),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
