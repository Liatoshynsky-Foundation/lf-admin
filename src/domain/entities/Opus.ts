import { LocalizedBoolean, LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import { Composition } from '~/domain/entities/Composition';
import { OpusStatus } from '~/types/enums/common.enums';

export type OpusNumberKind = 'op' | 'woo';

export type OpusDescription = {
  uk: string;
  en: string;
  meta?: {
    description?: { uk: string; en: string };
    canonicalUrl?: { uk: string; en: string };
    metaTitle?: { uk: string; en: string };
  };
};

export type OpusGalleryItem = {
  id: string;
  src: string;
  description?: LocalizedString | null;
  altText?: LocalizedString | null;
  crop?: { x: number; y: number; width: number; height: number } | null;
};

export type OpusPerformance = {
  id?: string;
  title?: LocalizedString | null;
  videoUrl?: string | null;
};

export type Opus = {
  id: string;
  number: string;
  title: LocalizedString;
  releaseYear?: number | null;

  numberKind?: OpusNumberKind;
  name?: LocalizedString | null;
  additionalText?: string | null;
  creationYear?: string | null;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: string | null;

  adminTitle?: string | null;
  slug?: string;
  description?: OpusDescription | null;
  introDescription?: OpusDescription | null;
  parts?: OpusDescription | null;
  keywords?: LocalizedString | null;
  allowIndexation?: LocalizedBoolean | null;
  coverImage?: LocalizedImage | null;

  gallery?: OpusGalleryItem[];

  performancesTitle?: LocalizedString | null;
  performances?: OpusPerformance[];

  status?: OpusStatus;
  meta?: { views: number };
  publishedAt?: string | null;

  compositions?: Composition[];

  createdAt: string;
  updatedAt: string;
};
