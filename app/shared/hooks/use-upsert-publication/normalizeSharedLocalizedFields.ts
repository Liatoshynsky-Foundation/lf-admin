import type { FetchedPublicationData, ImageCropData, PublicationsItemType } from '~/constants/publications';
import { normalizeFetchedCrop } from '~/lib/utils/CropperHelper';
import type { LocalizedCropRect } from '~/types/common';
import { LocalizedString } from '~/types/localization';

export const syncLocalizedStringPair = (value?: { uk?: string | null; en?: string | null } | null): LocalizedString => {
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

export const resolveSharedLocalizedStrings = (
  type: PublicationsItemType,
  fetched: FetchedPublicationData
): {
  altText: LocalizedString;
  ticketUrl: LocalizedString;
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
