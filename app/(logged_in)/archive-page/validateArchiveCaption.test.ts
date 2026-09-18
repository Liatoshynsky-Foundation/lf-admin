import { isArchiveCaptionWithinLimit } from './validateArchiveCaption';
import { createDocNode } from '~/__mocks__/utils';
import { ARCHIVE_PAGE_CAPTION_MAX_LENGTH } from '~/constants/archive-page';
import type { PageCaptionBlock } from '~/types/store/pages/archive';

const buildCaption = (ukText: string, enText = ''): PageCaptionBlock => ({
  description: {
    uk: createDocNode(ukText),
    en: createDocNode(enText)
  }
});

describe('isArchiveCaptionWithinLimit', () => {
  it('returns true when caption is missing', () => {
    expect(isArchiveCaptionWithinLimit(undefined)).toBe(true);
  });

  it('returns true when both locales are within the limit', () => {
    expect(isArchiveCaptionWithinLimit(buildCaption('короткий текст', 'short text'))).toBe(true);
  });

  it('returns true when length equals the max limit', () => {
    const text = 'a'.repeat(ARCHIVE_PAGE_CAPTION_MAX_LENGTH);
    expect(isArchiveCaptionWithinLimit(buildCaption(text))).toBe(true);
  });

  it('returns false when uk exceeds the limit', () => {
    const text = 'a'.repeat(ARCHIVE_PAGE_CAPTION_MAX_LENGTH + 1);
    expect(isArchiveCaptionWithinLimit(buildCaption(text))).toBe(false);
  });

  it('returns false when en exceeds the limit', () => {
    const text = 'b'.repeat(ARCHIVE_PAGE_CAPTION_MAX_LENGTH + 1);
    expect(isArchiveCaptionWithinLimit(buildCaption('ok', text))).toBe(false);
  });
});
