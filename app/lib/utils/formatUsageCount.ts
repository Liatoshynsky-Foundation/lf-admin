export function formatUsageCount(count: number): string {
  const safeCount = Math.max(0, Math.trunc(count));

  const mod100 = safeCount % 100;
  const mod10 = safeCount % 10;

  if (mod100 >= 11 && mod100 <= 14) return `${safeCount} звʼязок`;
  if (mod10 === 1) return `${safeCount} звʼязка`;
  if (mod10 >= 2 && mod10 <= 4) return `${safeCount} звʼязки`;
  return `${safeCount} звʼязок`;
}
