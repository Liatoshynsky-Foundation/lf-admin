import { extractImageSrcs } from '~/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/application/use-cases/removeTmpFlags/removeTmpFlags';
import { JsonValue } from '~/back-shared/types/pages/types';

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

  if (input.coverImage?.isTmp === true) {
    allImages.add(input.coverImage.src);
  }

  return Array.from(allImages);
};

export const processNewsContent = async <T extends NewsContentInput>(input: T): Promise<T> => {
  const imageSources = extractAllImageSources(input);

  if (imageSources.length === 0) {
    return input;
  }

  return removeTmpFlagsRecursively(input) as T;
};
