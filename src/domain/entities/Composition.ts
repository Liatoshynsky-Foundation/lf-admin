import { LocalizedString } from '~/domain/entities/BaseContent';

export type CompositionSheetMusic = {
  url: string;
  name?: string | null;
  publishDate?: string | null;
  isFree?: boolean;
  dateUploaded?: string | null;
};

export type CompositionAudio = {
  name?: string | null;
  url?: string | null;
};

/**
 * Composition (a "Твір"/work) in the shared `compositions` collection.
 * Belongs to an opus via `opusId` (null = ungrouped). `genre` is an admin-only
 * text round-trip field; `genres`/`categories` are ObjectId refs in the real model.
 */
export type Composition = {
  id: string;
  opusId?: string | null;
  order?: number;
  title: LocalizedString;
  year?: number | null;
  genre?: string | null;
  genres?: string[];
  categories?: string[];
  audioAvailable?: boolean;
  sheetAvailable?: boolean;
  sheetMusic?: CompositionSheetMusic[];
  audios?: CompositionAudio[];
  createdAt: string;
  updatedAt: string;
};
