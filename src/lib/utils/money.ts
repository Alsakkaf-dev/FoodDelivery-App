// Currency is MYR throughout (locked fact §4).
export function formatMYR(amount: number, locale: 'en' | 'ar' = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-MY' : 'en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function sumLines(lines: { qty: number; unit_price: number }[]): number {
  return lines.reduce((t, l) => t + l.qty * l.unit_price, 0);
}
