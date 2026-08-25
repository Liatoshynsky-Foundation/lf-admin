import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const publishDateToDayjs = (value?: string): Dayjs | null => {
  if (!value) return null;

  const parsed = dayjs(value, ['YYYY-MM-DD', 'DD/MM/YYYY'], true);
  return parsed.isValid() ? parsed : null;
};

export const formatPublishDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const formatPublishDate = (value?: string): string => publishDateToDayjs(value)?.format('DD/MM/YYYY') ?? value ?? '';

export const formatPublishDateForSave = (value?: string): string | undefined => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const parsed = publishDateToDayjs(trimmedValue);

  return parsed ? parsed.format('YYYY-MM-DD') : trimmedValue;
};
