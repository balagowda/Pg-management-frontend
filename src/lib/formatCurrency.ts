const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Indian digit grouping, e.g. ₹1,00,000 (not ₹100,000). */
export function formatCurrency(amount: number): string {
  return inrFormatter.format(amount);
}
