import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ResearchWorkStatus = BaseContentStatuses;

export type ResearchWorkPdfFile = {
  filename: string;
  url: string;
  mimeType: string;
};

export type ResearchWork = {
  id: string;
  author: string;
  bibliographicDescription: string;
  year: string;
  keywords: string;
  url?: string;
  pdfFile?: ResearchWorkPdfFile;
  status: ResearchWorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};
