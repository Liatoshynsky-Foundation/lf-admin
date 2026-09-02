import { fileNameFromUrl } from '~/src/shared/utils/assets/assetFilename';

export { fileNameFromUrl };

interface ApiMediaItem {
  name?: string | null;
  fileName?: string | null;
  url?: string | null;
  publishDate?: string | null;
}

export interface LocalMediaItem {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string;
  publishDate?: string;
}

export const mapMediaItemFromApi = (
  item: ApiMediaItem,
  createId: () => string
): LocalMediaItem => {
  const urlVal = item.url ?? '';
  return {
    id: createId(),
    name: item.name ?? '',
    fileUrl: urlVal,
    fileName: item.fileName ?? fileNameFromUrl(urlVal),
    publishDate: item.publishDate ?? ''
  };
};

export const isMediaItemFilled = (item: {
  name?: string | null;
  fileUrl?: string | null;
  publishDate?: string | null;
}): boolean =>
  Boolean((item.name ?? '').trim() || item.fileUrl || (item.publishDate && String(item.publishDate).trim()));
