import type { LocalizedJSON } from '~/types/common';

export const emptyLocalizedJSON = (): LocalizedJSON => ({
  uk: { type: 'doc', content: [] },
  en: { type: 'doc', content: [] }
});

export const isLocalizedJSON = (value: unknown): value is LocalizedJSON =>
  typeof value === 'object' && value !== null && 'uk' in value && 'en' in value;

export const normalizeLocalizedJSON = (value: unknown): LocalizedJSON =>
  isLocalizedJSON(value) ? value : emptyLocalizedJSON();
