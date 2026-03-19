export function normalizeBirthDate(value?: string | null): string {
  if (!value) return '';

  const input = String(value).trim();
  if (!input) return '';

  // DD.MM.YYYY
  const ruMatch = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ruMatch) {
    return input;
  }

  // YYYY-MM-DD (optionally with time part)
  const isoPrefix = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoPrefix) {
    const [, yyyy, mm, dd] = isoPrefix;
    return `${dd}.${mm}.${yyyy}`;
  }

  // Generic date parsing fallback (UTC to avoid timezone shifts)
  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getUTCFullYear();
    const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getUTCDate()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy}`;
  }

  return '';
}
