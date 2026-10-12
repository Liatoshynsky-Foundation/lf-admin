import {
  isSystemPreviewSlug,
  OPUS_PREVIEW_SUFFIX,
  truncateForPreviewSuffix
} from './opusPreview';

describe('opusPreview utils', () => {
  describe('truncateForPreviewSuffix', () => {
    it('should append preview suffix when value fits the limit', () => {
      expect(truncateForPreviewSuffix('bis')).toBe('bis (Preview)');
    });

    it('should return only suffix when value is empty', () => {
      expect(truncateForPreviewSuffix('   ')).toBe(OPUS_PREVIEW_SUFFIX);
    });

    it('should drop whole words from the end when suffix does not fit', () => {
      expect(truncateForPreviewSuffix('very long additional text with several words')).toBe(
        'very long additional text with (Preview)'
      );
    });

    it('should avoid splitting a single long word', () => {
      expect(truncateForPreviewSuffix('supercalifragilisticexpialidocious')).toBe(OPUS_PREVIEW_SUFFIX);
    });
  });

  describe('isSystemPreviewSlug', () => {
    it('should detect system preview slugs', () => {
      expect(isSystemPreviewSlug('sys-preview-artistry')).toBe(true);
      expect(isSystemPreviewSlug('regular-slug')).toBe(false);
      expect(isSystemPreviewSlug(null)).toBe(false);
    });
  });
});
