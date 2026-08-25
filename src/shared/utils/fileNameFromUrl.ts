export const fileNameFromUrl = (url?: string | null): string => {
  if (!url) {
    return '';
  }
  
  const segment = url.split('/').pop() ?? url;

  return decodeURIComponent(segment.split('?')[0]);
};

export const displayNameFromFile = (
  fileName?: string | null,
  fileUrl?: string | null
): string => fileName?.trim() || fileNameFromUrl(fileUrl);
