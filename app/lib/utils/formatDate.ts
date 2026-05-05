export function formatDate(dateString: string): string {
  const value = Number(dateString);
  const d = !isNaN(value) && String(value) === dateString
    ? new Date(value)
    : new Date(dateString);
  return d.toLocaleDateString('uk-UA');
}