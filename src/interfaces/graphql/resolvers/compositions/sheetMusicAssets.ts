type AssetsRepository = {
  findByUrls(urls: string[]): Promise<Array<{ url: string; filename: string; originalname?: string }>>;
  createAsset(input: {
    filename: string;
    originalname: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    type: 'pdf';
  }): Promise<unknown>;
  addUsageRef(
    url: string,
    ref: { pageId?: string; compositionId?: string; blockId?: string }
  ): Promise<void>;
  removeUsageRef(
    url: string,
    ref: { pageId?: string; compositionId?: string; blockId?: string }
  ): Promise<void>;
};
import { fileNameFromUrl } from '~/src/shared/utils/fileNameFromUrl';

type CompositionMedia = {
  audios?: Array<{ url?: string | null }>;
  sheetMusic?: Array<{ url?: string | null }>;
};

export const resolveSheetMusicFileNames = async (
  sheetMusicUrls: Array<string | null | undefined>,
  assetsRepository: AssetsRepository
): Promise<Map<string, string>> => {
  const urls = [...new Set(sheetMusicUrls.filter((url): url is string => Boolean(url)))];
  const fileNames = new Map<string, string>();

  if (urls.length === 0) {
    return fileNames;
  }

  const existingAssets = await assetsRepository.findByUrls(urls);
  const existingUrls = new Set(existingAssets.map((asset) => asset.url));

  existingAssets.forEach((asset) => {
    fileNames.set(asset.url, asset.originalname || asset.filename);
  });

  await Promise.all(
    urls.filter((url) => !existingUrls.has(url)).map((url) => {
      const filename = fileNameFromUrl(url);

      return assetsRepository.createAsset({
        filename,
        originalname: filename,
        mimeType: 'application/pdf',
        sizeBytes: 0,
        url,
        type: 'pdf'
      }).then(() => {
        fileNames.set(url, filename);
      });
    })
  );

  return fileNames;
};

const getUrls = (urls: Array<string | null | undefined> = []): string[] =>
  [...new Set(urls.filter((url): url is string => Boolean(url)))];

export const syncCompositionMediaUsageRefs = async (
  compositionId: string,
  previous: CompositionMedia | null | undefined,
  current: CompositionMedia | null | undefined,
  assetsRepository: AssetsRepository
): Promise<void> => {
  const oldUrls = getUrls([
    ...(previous?.audios?.map((audio) => audio.url) ?? []),
    ...(previous?.sheetMusic?.map((sheet) => sheet.url) ?? [])
  ]);
  const nextUrls = getUrls([
    ...(current?.audios?.map((audio) => audio.url) ?? []),
    ...(current?.sheetMusic?.map((sheet) => sheet.url) ?? [])
  ]);
  const usageRef = { compositionId };
  const staleUsageRefs = [
    { pageId: compositionId },
    { pageId: compositionId, blockId: 'audio' },
    { pageId: compositionId, blockId: 'sheetMusic' },
    { compositionId, blockId: 'audio' },
    { compositionId, blockId: 'sheetMusic' }
  ];

  await Promise.all([
    ...nextUrls.flatMap((url) => [
      assetsRepository.addUsageRef(url, usageRef),
      ...staleUsageRefs.map((ref) => assetsRepository.removeUsageRef(url, ref))
    ]),
    ...oldUrls
      .filter((url) => !nextUrls.includes(url))
      .flatMap((url) => [
        assetsRepository.removeUsageRef(url, usageRef),
        ...staleUsageRefs.map((ref) => assetsRepository.removeUsageRef(url, ref))
      ])
  ]);
};
