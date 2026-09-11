import dayjs from 'dayjs';

import { seoFormErrors } from '~/constants/errors';
import type { PublicationsItemType } from '~/constants/publications';
import type { SeoBlockErrors } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

export type EventDatesValidation = {
  isStartMissing: boolean;
  isEndBeforeStart: boolean;
  isInvalid: boolean;
};

export const validateEventDates = (
  publicationType: PublicationsItemType,
  startDateTime?: string | null,
  endDateTime?: string | null
): EventDatesValidation => {
  if (publicationType !== 'events') {
    return { isStartMissing: false, isEndBeforeStart: false, isInvalid: false };
  }

  const isStartMissing = !startDateTime;
  const isEndBeforeStart =
    Boolean(startDateTime) && Boolean(endDateTime) && dayjs(endDateTime).isBefore(dayjs(startDateTime));

  return {
    isStartMissing,
    isEndBeforeStart,
    isInvalid: isStartMissing || isEndBeforeStart
  };
};

export const applyEventDateSeoErrors = (
  baseErrors: SeoBlockErrors,
  validation: EventDatesValidation
): SeoBlockErrors => {
  const nextErrors: SeoBlockErrors = {
    meta: {
      uk: { ...baseErrors.meta.uk },
      en: { ...baseErrors.meta.en }
    },
    ticketUrl: baseErrors.ticketUrl
  };

  if (validation.isStartMissing) {
    nextErrors.meta.uk.startDateTime = seoFormErrors.uk.required;
    nextErrors.meta.en.startDateTime = seoFormErrors.en.required;
  }

  if (validation.isEndBeforeStart) {
    nextErrors.meta.uk.endDateTime = seoFormErrors.uk.endBeforeStart;
    nextErrors.meta.en.endDateTime = seoFormErrors.en.endBeforeStart;
  }

  return nextErrors;
};
