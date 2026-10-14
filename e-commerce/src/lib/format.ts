const formatterCache = new Map<string, Intl.NumberFormat>();

/** Backend amounts are decimal strings ("1000.00") — format without float
 * rounding surprises by handing the string straight to Intl. */
export function formatMoney(amount: string | number, currency = "KES"): string {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter.format(Number(amount));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(iso));
}
