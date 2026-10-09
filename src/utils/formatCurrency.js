/**
 * Format a number as Indian Rupee (INR) currency
 * e.g. 14500 -> ₹14,500
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
