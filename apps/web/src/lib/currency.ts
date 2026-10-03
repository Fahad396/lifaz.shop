/**
 * Formats a numeric price into Bangladeshi Taka (BDT) representation
 * Examples:
 *   formatPrice(18500) -> "৳ 18,500"
 *   formatPrice(80) -> "৳ 80"
 */
export function formatPrice(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "৳ 0";
  }

  // Format with commas according to South Asian / International convention
  const formatted = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return `৳ ${formatted}`;
}

export function formatPriceWithCode(amount: number | undefined | null): string {
  return `${formatPrice(amount)} BDT`;
}
