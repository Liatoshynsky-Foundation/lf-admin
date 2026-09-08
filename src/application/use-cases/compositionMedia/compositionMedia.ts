import type { ClientSession } from 'mongoose';

import { compositionMediaErrors } from '~/constants/errors';
import type { Composition, CompositionAudio } from '~/domain/entities/Composition';
import {
  AssetAlreadyExistsError,
  type AssetType,
  type IAssetRepository
} from '~/domain/repositories/assetRepository';
import { fileNameFromUrl } from '~/src/shared/utils/assets/assetFilename';

type CompositionMedia = Pick<Composition, 'audios' | 'sheetMusic'>;

const getUrls = (urls: Array<string | null | undefined> = []): string[] =>
  [...new Set(urls.filter((url): url is string => Boolean(url?.trim())))];

const mediaMimeType = (filename: string, type: Extract<AssetType, 'pdf' | 'audio'>): string => {
  if (type === 'pdf') return 'application/pdf';
  const extension = filename.split('.').pop()?.toLowerCase();
  return `audio/${extension === 'mp3' ? 'mpeg' : extension || 'mpeg'}`;
};

const resolveAssetNames = async (
  urls: Array<string | null | undefined>,
  type: Extract<AssetType, 'pdf' | 'audio'>,
  assetsRepository: IAssetRepository,
  session?: ClientSession
): Promise<Map<string, string>> => {
  const uniqueUrls = getUrls(urls);
  const names = new Map<string, string>();
  if (!uniqueUrls.length) return names;

  const existingAssets = await assetsRepository.findByUrls(uniqueUrls);
  const existingUrls = new Set(existingAssets.map((asset) => asset.url));
  existingAssets.forEach((asset) => names.set(asset.url, asset.originalname || asset.filename));

  await Promise.all(uniqueUrls.filter((url) => !existingUrls.has(url)).map(async (url) => {
    const filename = fileNameFromUrl(url);
    try {
      await assetsRepository.createAsset({
        filename,
        originalname: filename,
        mimeType: mediaMimeType(filename, type),
        sizeBytes: 0,
        url,
        type
      }, session);
      names.set(url, filename);
    } catch (error) {
      if (error instanceof AssetAlreadyExistsError) {
        throw new Error(compositionMediaErrors.ASSET_NAME_CONFLICT(filename));
      }
      throw error;
    }
  }));

  return names;
};

export const prepareCompositionMedia = async <T extends CompositionMedia>(
  media: T,
  assetsRepository: IAssetRepository,
  session?: ClientSession
): Promise<T> => {
  const sheetMusic = media.sheetMusic ?? [];

  const sheetMusicNames = await resolveAssetNames(sheetMusic.map((sheet) => sheet.url), 'pdf', assetsRepository, session);
  await resolveAssetNames((media.audios ?? []).map((audio) => audio.url), 'audio', assetsRepository, session);

  return {
    ...media,
    sheetMusic: sheetMusic.map((sheet) => ({
      ...sheet,
      name: sheet.name?.trim() || null,
      fileName: sheet.url ? sheetMusicNames.get(sheet.url) : undefined
    }))
  };
};

export const withCompositionMediaDisplayNames = async (
  compositions: Composition[],
  assetsRepository: IAssetRepository
): Promise<Composition[]> => {
  const urls = getUrls(compositions.flatMap((composition) => [
    ...(composition.sheetMusic ?? []).map((sheet) => sheet.url),
    ...(composition.audios ?? []).map((audio) => audio.url)
  ]));
  if (!urls.length) return compositions;

  const assets = await assetsRepository.findByUrls(urls);
  const names = new Map(assets.map((asset) => [asset.url, asset.originalname || asset.filename]));
  return compositions.map((composition) => ({
    ...composition,
    sheetMusic: composition.sheetMusic?.map((sheet) => ({
      ...sheet,
      fileName: sheet.fileName || names.get(sheet.url ?? '') || fileNameFromUrl(sheet.url)
    })),
    audios: composition.audios?.map((audio: CompositionAudio) => ({
      ...audio,
      name: audio.name || names.get(audio.url ?? '') || fileNameFromUrl(audio.url)
    }))
  }));
};

export const syncCompositionMediaUsage = async (
  compositionId: string,
  previous: CompositionMedia | null | undefined,
  current: CompositionMedia | null | undefined,
  assetsRepository: IAssetRepository,
  session?: ClientSession
): Promise<void> => {
  const oldUrls = getUrls([...(previous?.audios ?? []).map((audio) => audio.url), ...(previous?.sheetMusic ?? []).map((sheet) => sheet.url)]);
  const nextUrls = getUrls([...(current?.audios ?? []).map((audio) => audio.url), ...(current?.sheetMusic ?? []).map((sheet) => sheet.url)]);
  const usageRef = { compositionId };
  const staleUsageRefs = [
    { pageId: compositionId }, { pageId: compositionId, blockId: 'audio' }, { pageId: compositionId, blockId: 'sheetMusic' },
    { compositionId, blockId: 'audio' }, { compositionId, blockId: 'sheetMusic' }
  ];
  await Promise.all([
    ...nextUrls.flatMap((url) => [assetsRepository.addUsageRef(url, usageRef, session), ...staleUsageRefs.map((ref) => assetsRepository.removeUsageRef(url, ref, session))]),
    ...oldUrls.filter((url) => !nextUrls.includes(url)).flatMap((url) => [assetsRepository.removeUsageRef(url, usageRef, session), ...staleUsageRefs.map((ref) => assetsRepository.removeUsageRef(url, ref, session))])
  ]);
};
