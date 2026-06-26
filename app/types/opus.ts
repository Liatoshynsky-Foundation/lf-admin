import { OpusStatus } from '~/types/enums/common.enums';

export type OpusNumberKind = 'op' | 'woo';

export interface OpusMediaFileData {
  id: string;
  name: string;
  fileUrl?: string;
  publishDate?: string;
}

export interface OpusCompositionData {
  id: string;
  // DB `compositions._id` when this row references an existing composition
  // (from search or when editing); undefined for brand-new rows.
  compositionId?: string;
  title: string;
  genre: string;
  year: string;
  audios: OpusMediaFileData[];
  notes: OpusMediaFileData[];
}

export interface OpusDetailsValue {
  numberKind: OpusNumberKind;
  number: string;
  name: string;
  additionalText: string;
  creationYear: string;
  endYear: string;
  datesNote: string;
  genre: string;
  compositions: OpusCompositionData[];
}

export interface OpusDetailsErrors {
  number: string;
  name: string;
  creationYear: string;
  genre: string;
}

export interface OpusCompositionInput {
  id?: string;
  title: string;
  genre?: string;
  year?: string;
  audios: Array<{ name: string; fileUrl?: string; publishDate?: string }>;
  notes: Array<{ name: string; fileUrl?: string; publishDate?: string }>;
}

export interface OpusCompositionSuggestion {
  id?: string;
  title?: { uk?: string | null; en?: string | null } | null;
  genre?: string | null;
  year?: number | null;
  sheetMusic?: Array<{ url: string; isFree?: boolean | null; dateUploaded?: string | null }> | null;
  audios?: Array<{ name?: string | null; url?: string | null }> | null;
}

export interface FetchedOpusData {
  id: string;
  numberKind?: OpusNumberKind | null;
  number: string;
  releaseYear?: number | null;
  name?: string | null;
  additionalText?: string | null;
  creationYear?: string | null;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: string | null;
  status?: OpusStatus | null;
  title?: { uk?: string | null; en?: string | null } | null;
  description?: { uk?: string | null; en?: string | null } | null;
  keywords?: { uk?: string | null; en?: string | null } | null;
  allowIndexation?: { uk?: boolean | null; en?: boolean | null } | null;
  coverImage?: {
    src?: string | null;
    alt?: { uk?: string | null; en?: string | null } | null;
    crop?: { x: number; y: number; width: number; height: number } | null;
  } | null;
  compositions?: Array<{
    id?: string;
    title?: { uk?: string | null; en?: string | null } | null;
    genre?: string | null;
    year?: number | null;
    audioAvailable?: boolean | null;
    sheetAvailable?: boolean | null;
    sheetMusic?: Array<{ url: string; isFree?: boolean | null; dateUploaded?: string | null }> | null;
    audios?: Array<{ name?: string | null; url?: string | null }> | null;
  }> | null;
}
