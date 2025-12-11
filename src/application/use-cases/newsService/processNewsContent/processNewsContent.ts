import { extractImageSrcs } from '~/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';
import { JsonValue } from '~/back-shared/types/pages/types';

const shouldProcessImageSource = (src: string): boolean => {
  if (!src || typeof src !== 'string') {
    return false;
  }

  const trimmedSrc = src.trim();

  if (trimmedSrc.startsWith('http://') || trimmedSrc.startsWith('https://')) {
    return false;
  }

  if (trimmedSrc.startsWith('data:')) {
    return false;
  }

  return trimmedSrc.length > 0;
};

const replaceImageSources = (data: JsonValue, replacementMap: Map<string, string>): JsonValue => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => replaceImageSources(item, replacementMap));
  }

  const result: Record<string, unknown> = {};
  const obj = data as Record<string, unknown>;

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'src' && typeof value === 'string' && replacementMap.has(value)) {
      result[key] = replacementMap.get(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = replaceImageSources(value as JsonValue, replacementMap);
    } else {
      result[key] = value;
    }
  }

  return result as JsonValue;
};

export type LocalizedContent = {
  uk: unknown;
  en: unknown;
};

export type NewsContentInput = {
  content: LocalizedContent;
  description?: LocalizedContent;
  coverImage?: {
    src: string;
    alt?: LocalizedContent;
    caption?: LocalizedContent;
    isTmp?: boolean;
  };
};

const extractAllImageSources = (input: NewsContentInput): string[] => {
  const allImages = new Set<string>();

  if (input.content.uk) {
    extractImageSrcs(input.content.uk as JsonValue).forEach((src) => allImages.add(src));
  }

  if (input.content.en) {
    extractImageSrcs(input.content.en as JsonValue).forEach((src) => allImages.add(src));
  }

  if (input.description?.uk) {
    extractImageSrcs(input.description.uk as JsonValue).forEach((src) => allImages.add(src));
  }

  if (input.description?.en) {
    extractImageSrcs(input.description.en as JsonValue).forEach((src) => allImages.add(src));
  }

  if (input.coverImage?.src && input.coverImage?.isTmp === true) {
    allImages.add(input.coverImage.src);
  }

  return Array.from(allImages);
};

export const processNewsContent = async <T extends NewsContentInput>(input: T): Promise<T> => {
  const imageSources = extractAllImageSources(input);

  if (imageSources.length === 0) {
    return input;
  }

  const uploadService = blobStorageService();
  const replacementMap = new Map<string, string>();

  for (const oldSrc of imageSources) {
    if (!shouldProcessImageSource(oldSrc)) {
      continue;
    }

    try {
      await uploadService.copyBlobsToNewFolder('tmp', 'photos', [oldSrc]);

      const newUrl = uploadService.constructBlobUrl('photos', oldSrc);
      replacementMap.set(oldSrc, newUrl);

      try {
        await uploadService.deleteFile('tmp', oldSrc);
      } catch (deleteError) {
        console.error(`Failed to delete tmp blob ${oldSrc}:`, deleteError);
      }
    } catch (error) {
      console.error(`Failed to process image ${oldSrc}:`, error);
    }
  }

  if (replacementMap.size === 0) {
    return input;
  }

  const updatedInput = JSON.parse(JSON.stringify(input)) as T;

  if (updatedInput.content.uk) {
    updatedInput.content.uk = replaceImageSources(updatedInput.content.uk as JsonValue, replacementMap);
  }

  if (updatedInput.content.en) {
    updatedInput.content.en = replaceImageSources(updatedInput.content.en as JsonValue, replacementMap);
  }

  if (updatedInput.description?.uk) {
    updatedInput.description.uk = replaceImageSources(updatedInput.description.uk as JsonValue, replacementMap);
  }

  if (updatedInput.description?.en) {
    updatedInput.description.en = replaceImageSources(updatedInput.description.en as JsonValue, replacementMap);
  }

  if (updatedInput.coverImage?.src && replacementMap.has(updatedInput.coverImage.src)) {
    const newSrc = replacementMap.get(updatedInput.coverImage.src);
    if (newSrc) {
      updatedInput.coverImage.src = newSrc;
    }
  }

  const cleanedInput = removeTmpFlagsRecursively(updatedInput);

  return cleanedInput;
};
