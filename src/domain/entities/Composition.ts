import { LocalizedString } from '~/domain/entities/BaseContent';

export type CompositionSheetMusic = {
  url?: string | null;
  name?: string | null;
  fileName?: string | null;
  publishDate?: string | null;
  isFree?: boolean | null;
  dateUploaded?: string | null;
};

export type CompositionAudio = {
  name: string | null;
  url: string | null;
};

export type Composition = {
  id: string;
  name: LocalizedString;
  year?: number | null;
  genre?: string | null;
  audioAvailable?: boolean;
  sheetAvailable?: boolean;
  sheetMusic?: CompositionSheetMusic[];
  audios?: CompositionAudio[];
  createdAt: string;
  updatedAt: string;
};
