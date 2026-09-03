export const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return '';

  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split('?')[0] ?? url;
    }
  })();
  const segment = path.split('/').findLast(Boolean) ?? (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return path;
    }
  })();

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

export const displayNameFromFile = (fileName?: string | null, fileUrl?: string | null): string =>
  fileName?.trim() || fileNameFromUrl(fileUrl);
