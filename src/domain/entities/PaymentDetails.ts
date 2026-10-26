import { JSONContent } from '@tiptap/react';

export type PaymentDetailsPdfFile = {
  filename: string;
  url: string;
  mimeType: string;
};
export type PaymentDetailsTab = {
  id: string;
  name: string;
  content: JSONContent;
  order: number;
};
export interface PaymentDetails {
  id: string;
  slug: string;
  tabs: PaymentDetailsTab[];
  pdfFile?: PaymentDetailsPdfFile | null;
  createdAt: string;
  updatedAt: string;
}
