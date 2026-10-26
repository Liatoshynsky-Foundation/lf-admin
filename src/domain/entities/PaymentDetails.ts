import { JSONContent } from '@tiptap/react';

export type paymentDetailsPdfFile = {
  filename: string;
  url: string;
  mimeType: string;
};
export type paymentDetailsTab = {
  id: string;
  name: string;
  content: JSONContent;
  order: number;
};
export type paymentDetails = {
  id: string;
  slug: string;
  tabs: paymentDetailsTab[];
  pdfFile: paymentDetailsPdfFile;
  createdAt: string;
  updatedAt: string;
};
