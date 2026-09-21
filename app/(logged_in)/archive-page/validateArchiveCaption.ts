import { ARCHIVE_PAGE_CAPTION_MAX_LENGTH } from '~/constants/archive-page';
import { resolveLocalizedText } from '~/lib/utils/prose';
import type { PageCaptionBlock } from '~/types/store/pages/archive';

export const isArchiveCaptionWithinLimit = (caption?: PageCaptionBlock): boolean => {
  const ukLength = resolveLocalizedText(caption?.description?.uk).length;
  const enLength = resolveLocalizedText(caption?.description?.en).length;

  return ukLength <= ARCHIVE_PAGE_CAPTION_MAX_LENGTH && enLength <= ARCHIVE_PAGE_CAPTION_MAX_LENGTH;
};
