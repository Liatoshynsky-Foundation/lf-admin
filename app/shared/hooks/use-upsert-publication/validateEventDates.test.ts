import { applyEventDateSeoErrors, validateEventDates } from './validateEventDates';
import { seoFormErrors } from '~/constants/errors';
import type { SeoBlockErrors } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

describe('validateEventDates', () => {
  it('returns valid for non-events', () => {
    expect(validateEventDates('news', undefined, '2025-01-01T12:00:00.000Z')).toEqual({
      isStartMissing: false,
      isEndBeforeStart: false,
      isInvalid: false
    });
  });

  it('flags missing start for events', () => {
    expect(validateEventDates('events', undefined, undefined)).toEqual({
      isStartMissing: true,
      isEndBeforeStart: false,
      isInvalid: true
    });
  });

  it('allows optional end after start', () => {
    expect(
      validateEventDates('events', '2025-01-01T10:00:00.000Z', '2025-01-01T12:00:00.000Z')
    ).toEqual({
      isStartMissing: false,
      isEndBeforeStart: false,
      isInvalid: false
    });
  });

  it('allows missing end when start is present', () => {
    expect(validateEventDates('events', '2025-01-01T10:00:00.000Z', undefined)).toEqual({
      isStartMissing: false,
      isEndBeforeStart: false,
      isInvalid: false
    });
  });

  it('flags end before start', () => {
    expect(
      validateEventDates('events', '2025-01-02T15:00:00.000Z', '2025-01-01T12:00:00.000Z')
    ).toEqual({
      isStartMissing: false,
      isEndBeforeStart: true,
      isInvalid: true
    });
  });
});

describe('applyEventDateSeoErrors', () => {
  const baseErrors: SeoBlockErrors = {
    meta: { uk: {}, en: {} }
  };

  it('writes required start errors for both locales', () => {
    expect(
      applyEventDateSeoErrors(baseErrors, {
        isStartMissing: true,
        isEndBeforeStart: false,
        isInvalid: true
      })
    ).toEqual({
      meta: {
        uk: { startDateTime: seoFormErrors.uk.required },
        en: { startDateTime: seoFormErrors.en.required }
      }
    });
  });

  it('writes endBeforeStart errors for both locales', () => {
    expect(
      applyEventDateSeoErrors(baseErrors, {
        isStartMissing: false,
        isEndBeforeStart: true,
        isInvalid: true
      })
    ).toEqual({
      meta: {
        uk: { endDateTime: seoFormErrors.uk.endBeforeStart },
        en: { endDateTime: seoFormErrors.en.endBeforeStart }
      }
    });
  });
});
