import type { FetchedPublicationData, ImageCropData, PublicationsItemType } from '~/constants/publications';
import { normalizeFetchedCrop } from '~/lib/utils/CropperHelper';
import type { LocalizedCropRect } from '~/types/common';

export const syncLocalizedStringPair = (
  value?: { uk?: string | null; en?: string | null } | null
): { uk: string; en: string } => {
  const shared = value?.uk || value?.en || '';
  return { uk: shared, en: shared };
};

/** Normalizes flat or localized crop, then mirrors one shared rect to both locales. */
export const syncLocalizedCrop = (crop: ImageCropData): LocalizedCropRect | null => {
  const localized = normalizeFetchedCrop(crop);
  if (!localized) return null;

  const shared = localized.uk ?? localized.en ?? null;
  return { uk: shared, en: shared };
};

export const resolveSharedLocalizedFields = (
  type: PublicationsItemType,
  fetched: FetchedPublicationData
): {
  altText: { uk: string; en: string };
  ticketUrl: { uk: string; en: string };
  crop: ImageCropData;
} => {
  if (type === 'events') {
    return {
      altText: syncLocalizedStringPair(fetched.coverImage?.alt),
      ticketUrl: syncLocalizedStringPair(fetched.ticketUrl),
      crop: syncLocalizedCrop(fetched.coverImage?.crop ?? null)
    };
  }

  return {
    altText: {
      uk: fetched.coverImage?.alt?.uk || '',
      en: fetched.coverImage?.alt?.en || ''
    },
    ticketUrl: {
      uk: fetched.ticketUrl?.uk || '',
      en: fetched.ticketUrl?.en || ''
    },
    crop: fetched.coverImage?.crop ?? null
  };
};
