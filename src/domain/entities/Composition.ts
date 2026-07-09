import { LocalizedString } from '~/domain/entities/BaseContent';
import { BaseContentStatuses } from '~/types/enums/common.enums';

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
  status?: BaseContentStatuses;
  createdAt: string;
  updatedAt: string;
};
