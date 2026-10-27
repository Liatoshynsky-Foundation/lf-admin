import { Composition } from './Composition';
import { LocalizedBoolean, LocalizedImage } from '~/domain/entities/BaseContent';
import { OpusStatus } from '~/types/graphql/generated/graphql';
import type { LocalizedString } from '~/types/localization';

export type OpusNumberKind = 'op' | 'sineop' | 'compositions';

export type OpusDescription = LocalizedString & {
  meta?: {
    description?: LocalizedString;
    canonicalUrl?: LocalizedString;
    metaTitle?: LocalizedString;
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
  id: string;
  title?: LocalizedString | null;
  videoUrl?: string | null;
};

export type Opus = {
  id: string;
  number?: number;
  numberKind?: OpusNumberKind;
  name?: LocalizedString | null;
  additionalText?: string | null;
  creationYear?: string | null;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: LocalizedString | null;

  title?: LocalizedString | null;
  adminTitle?: string | null;
  slug?: string;
  description?: OpusDescription | null;
  introDescription?: OpusDescription | null;
  parts?: OpusDescription | null;
  keywords?: LocalizedString | null;
  allowIndexation?: LocalizedBoolean | null;
  coverImage?: LocalizedImage | null;

  gallery?: OpusGalleryItem[];

  performances?: OpusPerformance[];

  status: OpusStatus;
  meta?: { views: number };
  publishedAt?: string | null;

  compositions?: string[] | null;

  createdAt: string;
  updatedAt: string;

  blocksOrder?: string[] | null;
};

export type OpusFull = Omit<Opus, 'compositions'> & { compositions: Composition[] };
