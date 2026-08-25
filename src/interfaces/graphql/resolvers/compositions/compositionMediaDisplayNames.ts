import type { Composition } from '~/domain/entities/Composition';
import { fileNameFromUrl } from '~/src/shared/utils/fileNameFromUrl';

type Asset = {
  url: string;
  filename: string;
  originalname?: string;
};

type AssetsRepository = {
  findByUrls(urls: string[]): Promise<Asset[]>;
};

export const withCompositionMediaDisplayNames = async (
  compositions: Composition[],
  assetsRepository: AssetsRepository
): Promise<Composition[]> => {
  const urls = [
    ...new Set(
      compositions.flatMap((composition) => [
        ...(composition.sheetMusic ?? []).flatMap((sheet) => (sheet.url ? [sheet.url] : [])),
        ...(composition.audios ?? []).flatMap((audio) => (audio.url ? [audio.url] : []))
      ])
    )
  ];

  if (urls.length === 0) {
    return compositions;
  }

  const assets = await assetsRepository.findByUrls(urls);
  const displayNameByUrl = new Map(assets.map((asset) => [asset.url, asset.originalname || asset.filename]));

  return compositions.map((composition) => ({
    ...composition,
    sheetMusic: composition.sheetMusic?.map((sheet) => ({
      ...sheet,
      fileName: sheet.fileName || displayNameByUrl.get(sheet.url ?? '') || fileNameFromUrl(sheet.url)
    })),
    audios: composition.audios?.map((audio) => ({
      ...audio,
      name: audio.name || displayNameByUrl.get(audio.url ?? '') || fileNameFromUrl(audio.url)
    }))
  }));
};
