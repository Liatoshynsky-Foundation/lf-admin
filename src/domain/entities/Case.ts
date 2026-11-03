import type { JSONContent } from '@tiptap/core';

import { LocalizedString } from './BaseContent';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type CasePdfFile = {
  filename: string;
  url: string;
  mimeType: string;
};

export interface LocalizedRichText {
  uk: JSONContent | null;
  en: JSONContent | null;
}

export interface Case {
  id: string;
  fundId: string;
  descriptionNumber: number;
  caseNumber: number;
  caseName: LocalizedString;
  caseDate: LocalizedString;
  sheetsNumber: number;
  caseDescriptions: LocalizedString;
  detailedCaseDescription?: LocalizedRichText | null;
  pdfFile?: CasePdfFile | null;
  order: number;
  status: BaseContentStatuses;
  createdAt: string;
  updatedAt: string;
}
