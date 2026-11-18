import type { JSONContent } from '@tiptap/react';

import type { PaymentDetails,PaymentDetailsPdfFileInput } from '~/domain/entities/PaymentDetails';

export type UpdatePaymentDetailsInput = {
  tabs: Array<{
    id?: string;
    name: string;
    content: JSONContent;
  }>;
  pdfFile?: PaymentDetailsPdfFileInput | null;
};

export interface IPaymentDetailsRepository {
  getPaymentDetails(): Promise<PaymentDetails | null>;
  updatePaymentDetails(input: UpdatePaymentDetailsInput): Promise<PaymentDetails>;
}
