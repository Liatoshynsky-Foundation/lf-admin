import { CropRect } from '~/types/common';
import type { LocalizedString } from '~/types/localization';

export type { LocalizedString };
export type { StringOrLocalizedString } from '~/types/localization';

export type LocalizedBoolean = {
  uk: boolean;
  en: boolean;
};

export type LocalizedContent = {
  uk: unknown;
  en: unknown;
};

export type LocalizedImage = {
  src: string;
  alt: LocalizedString;
  caption?: LocalizedString;
  isTmp?: boolean;
  crop?: CropRect | null;
  width?: number | null;
  height?: number | null;
};

export type BaseContentFields = {
  adminTitle: string;
  title: LocalizedString;
  description: LocalizedString & {
    meta?: {
      description?: LocalizedString;
      canonicalUrl?: LocalizedString;
      metaTitle?: LocalizedString;
    };
  };
  keywords?: LocalizedString;
  allowIndexation: LocalizedBoolean;
  slug: string;
  coverImage: LocalizedImage;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  meta: {
    views: number;
  };
};
