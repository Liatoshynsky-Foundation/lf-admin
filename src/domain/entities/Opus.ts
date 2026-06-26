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

/**
 * Opus = a "group" in the shared `opus` collection (also read by lf-client).
 * Required fields (number, title) are the canonical lf-client shape; everything
 * else is an optional admin extension so existing lean documents stay valid.
 * `compositions` is joined relationally from the `compositions` collection at
 * query time — it is NOT stored on the opus document.
 */
export type Opus = {
  id: string;
  number: string;
  title: LocalizedString;
  releaseYear?: number | null;

  numberKind?: OpusNumberKind;
  name?: string | null;
  additionalText?: string | null;
  creationYear?: string | null;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: string | null;

  adminTitle?: string | null;
  slug?: string;
  description?: OpusDescription | null;
  keywords?: LocalizedString | null;
  allowIndexation?: LocalizedBoolean | null;
  coverImage?: LocalizedImage | null;
  status?: OpusStatus;
  meta?: { views: number };
  publishedAt?: string | null;

  compositions?: Composition[];

  createdAt: string;
  updatedAt: string;
};
