import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ResearchWorkPdfFile = {
  filename: string;
  url: string;
  mimeType: string;
};

export interface ResearchWork {
  id: string;
  bibliographicDescription: string;
  author: string;
  year: string;
  keywords?: string | null;
  pdfFile?: ResearchWorkPdfFile | null;
  url?: string | null;
  status: BaseContentStatuses;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}