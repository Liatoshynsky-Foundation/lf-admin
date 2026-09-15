import type { LocalizedMeta } from '../SeoMetadataForm';
import type { SeoBlockValue } from './SeoMetadataBlock';

export const syncAltAcrossLocales = (
  value: SeoBlockValue,
  locale: 'uk' | 'en',
  newMeta: LocalizedMeta
): SeoBlockValue => {
  if (newMeta.altText === undefined) {
    return {
      ...value,
      meta: { ...value.meta, [locale]: newMeta }
    };
  }

  const raw = newMeta.altText[locale] ?? newMeta.altText.uk ?? newMeta.altText.en ?? '';
  const altText = { uk: raw, en: raw };

  return {
    ...value,
    meta: {
      uk: {
        ...(locale === 'uk' ? newMeta : value.meta.uk),
        altText
      },
      en: {
        ...(locale === 'en' ? newMeta : value.meta.en),
        altText
      }
    }
  };
};
