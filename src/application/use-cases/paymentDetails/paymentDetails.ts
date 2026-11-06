import type { PaymentDetails } from '~/domain/entities/PaymentDetails';
import type { IPaymentDetailsRepository } from '~/domain/repositories/PaymentDetailsRepository';

export const paymentDetailsService = ({
  paymentDetailsRepository
}: {
  paymentDetailsRepository: IPaymentDetailsRepository;
}) => ({
  execute: (): Promise<PaymentDetails | null> => paymentDetailsRepository.getPaymentDetails()
});
