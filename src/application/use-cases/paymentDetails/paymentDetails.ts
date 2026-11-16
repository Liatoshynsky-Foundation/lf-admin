import type { PaymentDetails } from '~/domain/entities/PaymentDetails';
import type {
  IPaymentDetailsRepository,
  UpdatePaymentDetailsInput
} from '~/domain/repositories/PaymentDetailsRepository';

export const paymentDetailsService = ({
  paymentDetailsRepository
}: {
  paymentDetailsRepository: IPaymentDetailsRepository;
}) => ({
  execute: (): Promise<PaymentDetails | null> => paymentDetailsRepository.getPaymentDetails(),
  update: (input: UpdatePaymentDetailsInput): Promise<PaymentDetails> =>
    paymentDetailsRepository.updatePaymentDetails(input)
});
  