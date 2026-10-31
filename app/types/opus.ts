import { NullableLocalizedString } from '~/types/common';
import { OpusStatus } from '~/types/enums/common.enums';

export type OpusNumberKind = 'op' | 'sineop' | 'compositions';

export interface OpusMediaFileData {
  id: string;
  name?: string;
  fileUrl?: string;
  fileName?: string;
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
  additionalText?: string;
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
  audios: Array<{ 
    name?: string; 
    fileUrl?: string; 
    publishDate?: string
  }>;
  notes: Array<{ 
    name?: string; 
    fileName?: string; 
    fileUrl?: string; 
    publishDate?: string
  }>;
}

export interface OpusCompositionSuggestion {
  id?: string;
  name?: NullableLocalizedString | null;
  genre?: string | null;
  year?: number | null;
  sheetMusic?: Array<{
    url?: string | null;
    name?: string | null;
    fileName?: string | null;
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
  name?: NullableLocalizedString | null;
  additionalText?: string | null;
  creationYear?: string | null;
  endYear?: string | null;
  datesNote?: NullableLocalizedString | string | null;
  genre?: NullableLocalizedString | null;
  status?: OpusStatus | null;
  blocksOrder?: string[] | null;
  title?: NullableLocalizedString | null;
  description?: NullableLocalizedString | null;
  introDescription?: NullableLocalizedString | null;
  parts?: NullableLocalizedString | null;
  keywords?: NullableLocalizedString | null;
  allowIndexation?: { uk?: boolean | null; en?: boolean | null } | null;
  coverImage?: {
    src?: string | null;
    alt?: NullableLocalizedString | null;
    crop?: { x: number; y: number; width: number; height: number } | null;
  } | null;
  gallery?: Array<{
    id?: string;
    src?: string | null;
    description?: NullableLocalizedString | null;
    altText?: NullableLocalizedString | null;
    crop?: { x?: number; y?: number; width?: number; height?: number } | null;
  }> | null;
  performances?: Array<{
    id: string;
    title?: NullableLocalizedString | null;
    videoUrl?: string | null;
  }> | null;
  compositions?: Array<{
    id: string;
    name?: NullableLocalizedString | null;
    genre?: string | null;
    year?: number | null;
    audioAvailable?: boolean | null;
    sheetAvailable?: boolean | null;
    sheetMusic?: Array<{
      url: string;
      name?: string | null;
      fileName?: string | null;
      publishDate?: string | null;
      isFree?: boolean | null;
      dateUploaded?: string | null;
    }> | null;
    audios?: Array<{ 
      name?: string | null; 
      url?: string | null;
    }> | null;
  }> | null;
}
