export function formatDate(inputDate: string): string {
  const numericTimestamp = Number(inputDate);

  const parsedDate =
    numericTimestamp && String(numericTimestamp) === inputDate
      ? new Date(numericTimestamp)
      : new Date(inputDate);

  return parsedDate.toLocaleDateString('uk-UA');
}