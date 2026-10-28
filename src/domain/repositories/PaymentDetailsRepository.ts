import type { PaymentDetails, PaymentDetailsPdfFile, PaymentDetailsTab } from '~/domain/entities/PaymentDetails';

export type CreatePaymentDetailsTabInput = Pick<PaymentDetailsTab, 'name' | 'content'>;

export type ReorderPaymentDetailsTabsInput = {
  orderedTabIds: string[];
};

export type UpdatePaymentDetailsTabInput = Partial<CreatePaymentDetailsTabInput>;

export interface IPaymentDetailsRepository {
  getPaymentDetails(): Promise<PaymentDetails | null>;
  addPaymentDetailsTab(input: CreatePaymentDetailsTabInput): Promise<PaymentDetails>;
  updatePaymentDetailsTab(tabId: string, input: UpdatePaymentDetailsTabInput): Promise<PaymentDetails>;
  removePaymentDetailsTab(tabId: string): Promise<PaymentDetails>;
  reorderPaymentDetailsTabs(input: ReorderPaymentDetailsTabsInput): Promise<PaymentDetails>;
  addPaymentDetailsPdfFile(pdfFile: PaymentDetailsPdfFile): Promise<PaymentDetails>;
  removePaymentDetailsPdfFile(): Promise<PaymentDetails>;
}
