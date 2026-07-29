import { OpusStatus } from '~/types/enums/common.enums';

export type OpusNumberKind = 'op' | 'sineop' | 'compositions';

export interface OpusMediaFileData {
  id: string;
  name?: string;
  fileUrl?: string;
  publishDate?: string;
  isFree?: boolean;
}

export interface OpusAudioFileData {
  id: string;
  name: string;
  fileUrl: string;
}

export interface OpusCompositionData {
  id: string;
  name: string;
  genre: string;
  year: string;
  audios: OpusAudioFileData[];
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
}

export interface OpusCompositionInput {
  id?: string;
  name: string;
  genre?: string;
  year?: string;
  audios: Array<{ name: string; fileUrl?: string; publishDate?: string }>;
  notes: Array<{ name: string; fileUrl?: string; publishDate?: string }>;
}

export interface OpusCompositionSuggestion {
  id?: string;
  name?: { uk?: string | null; en?: string | null } | null;
  genre?: string | null;
  year?: number | null;
  sheetMusic?: Array<{
    url?: string | null;
    name?: string | null;
    publishDate?: string | null;
    isFree?: boolean | null;
    dateUploaded?: string | null;
  }> | null;
  audios?: Array<{ name?: string | null; url: string }> | null;
}

export interface FetchedOpusData {
  id: string;
  numberKind?: OpusNumberKind | null;
  number: number;
  name?: { uk?: string | null; en?: string | null } | null;
  additionalText?: string | null;
  creationYear?: string | null;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: { uk?: string | null; en?: string | null } | null;
  status?: OpusStatus | null;
  blocksOrder?: string[] | null;
  title?: { uk?: string | null; en?: string | null } | null;
  description?: { uk?: string | null; en?: string | null } | null;
  introDescription?: { uk?: string | null; en?: string | null } | null;
  parts?: { uk?: string | null; en?: string | null } | null;
  keywords?: { uk?: string | null; en?: string | null } | null;
  allowIndexation?: { uk?: boolean | null; en?: boolean | null } | null;
  coverImage?: {
    src?: string | null;
    alt?: { uk?: string | null; en?: string | null } | null;
    crop?: { x: number; y: number; width: number; height: number } | null;
  } | null;
  gallery?: Array<{
    id?: string;
    src?: string | null;
    description?: { uk?: string | null; en?: string | null } | null;
    altText?: { uk?: string | null; en?: string | null } | null;
    crop?: { x?: number; y?: number; width?: number; height?: number } | null;
  }> | null;
  performancesTitle?: { uk?: string | null; en?: string | null } | null;
  performances?: Array<{
    id: string;
    title?: { uk?: string | null; en?: string | null } | null;
    videoUrl?: string | null;
  }> | null;
  compositions?: Array<{
    id: string;
    name?: { uk?: string | null; en?: string | null } | null;
    genre?: string | null;
    year?: number | null;
    audioAvailable?: boolean | null;
    sheetAvailable?: boolean | null;
    sheetMusic?: Array<{
      url: string;
      name?: string | null;
      publishDate?: string | null;
      isFree?: boolean | null;
      dateUploaded?: string | null;
    }> | null;
    audios?: Array<{ name?: string | null; url?: string | null }> | null;
  }> | null;
}
