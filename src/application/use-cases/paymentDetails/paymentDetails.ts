import type { PaymentDetails } from '~/domain/entities/PaymentDetails';

interface PaymentDetailsReader {
  getPaymentDetails(): Promise<PaymentDetails | null>;
}

export const paymentDetailsService = ({
  paymentDetailsRepository
}: {
  paymentDetailsRepository: PaymentDetailsReader;
}) => ({
  execute: (): Promise<PaymentDetails | null> => paymentDetailsRepository.getPaymentDetails()
});
