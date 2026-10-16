import { DEFAULT_IMAGE_PLACEHOLDER } from '~/constants/files';

type PhotoLike = {
  src?: string | null;
  generatedSrc?: string | null;
};

const isRealImageUrl = (url?: string | null): boolean => {
  const trimmed = url?.trim();
  return Boolean(trimmed) && trimmed !== DEFAULT_IMAGE_PLACEHOLDER;
};

export const hasMemberImage = (photo?: PhotoLike | null): boolean =>
  isRealImageUrl(photo?.src) || isRealImageUrl(photo?.generatedSrc);
