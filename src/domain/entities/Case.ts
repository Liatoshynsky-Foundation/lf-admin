import { LocalizedString } from './BaseContent';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type CasePdfFile = {
  filename: string;
  url: string;
  mimeType: string;
};

export interface Case {
  id: string;
  fundId: string;
  descriptionNumber: number;
  caseNumber: number;
  caseName: LocalizedString;
  caseDate: LocalizedString;
  sheetsNumber: number;
  caseDescriptions: LocalizedString;
  detailedCaseDescription?: LocalizedString;
  pdfFile?: CasePdfFile | null;
  status: BaseContentStatuses;
  order: number;
  createdAt: string;
  updatedAt: string;
}
