export const OPUS_PREVIEW_SLUG_PREFIX = 'sys-preview-';
export const OPUS_PREVIEW_SLUG = `${OPUS_PREVIEW_SLUG_PREFIX}artistry`;
export const OPUS_PREVIEW_SUFFIX = '(Preview)';
export const OPUS_ADDITIONAL_TEXT_MAX_LENGTH = 40;

export const isSystemPreviewSlug = (slug?: string | null): boolean =>
  Boolean(slug?.startsWith(OPUS_PREVIEW_SLUG_PREFIX));

export const truncateForPreviewSuffix = (
  value?: string | null,
  maxLength = OPUS_ADDITIONAL_TEXT_MAX_LENGTH,
  suffix = OPUS_PREVIEW_SUFFIX
): string => {
  const trimmedValue = value?.trim() ?? '';

  if (!trimmedValue) {
    return suffix.slice(0, maxLength);
  }

  const suffixWithSeparator = ` ${suffix}`;

  if (trimmedValue.length + suffixWithSeparator.length <= maxLength) {
    return `${trimmedValue}${suffixWithSeparator}`;
  }

  const words = trimmedValue.split(/\s+/);
  let truncatedValue = '';

  for (const word of words) {
    const candidate = truncatedValue ? `${truncatedValue} ${word}` : word;

    if (candidate.length + suffixWithSeparator.length > maxLength) {
      break;
    }

    truncatedValue = candidate;
  }

  return truncatedValue ? `${truncatedValue}${suffixWithSeparator}` : suffix.slice(0, maxLength);
};
