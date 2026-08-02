export const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return '';
  const segment = url.split('/').pop() ?? url;
  return decodeURIComponent(segment.split('?')[0]);
};

interface ApiMediaItem {
  name?: string | null;
  url?: string | null;
  publishDate?: string | null;
}

export interface LocalMediaItem {
  id: string;
  name: string;
  fileUrl: string;
  publishDate?: string;
}

export const mapMediaItemFromApi = (
  item: ApiMediaItem,
  createId: () => string
): LocalMediaItem => {
  const urlVal = item.url ?? '';
  return {
    id: createId(),
    name: item.name ?? fileNameFromUrl(urlVal),
    fileUrl: urlVal,
    publishDate: item.publishDate ?? ''
  };
};

export const resolveMediaName = (item: { name?: string | null; fileUrl?: string | null }): string =>
  (item.name ?? '').trim() || fileNameFromUrl(item.fileUrl);

export const isMediaItemFilled = (item: {
  name?: string | null;
  fileUrl?: string | null;
  publishDate?: string | null;
}): boolean =>
  Boolean((item.name ?? '').trim() || item.fileUrl || (item.publishDate && String(item.publishDate).trim()));
