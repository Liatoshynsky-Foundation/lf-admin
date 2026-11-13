import { render, screen } from '@testing-library/react';

import { MOCK_PAYMENT_DETAILS } from './__mocks__/requisites';
import RequisitesPage from './page';

const mockPaymentDetails = MOCK_PAYMENT_DETAILS;

jest.mock('~/shared/hooks/use-payment-details/usePaymentDetails', () => ({
  usePaymentDetails: () => ({
    data: mockPaymentDetails,
    loading: false,
    error: undefined
  })
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

jest.mock('~/public/icons/type-pdf.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="PdfIcon" />
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
}));

describe('RequisitesPage', () => {
  it('renders the requisites page with title and currency tabs', () => {
    render(<RequisitesPage />);

    expect(screen.getByRole('heading', { name: 'Реквізити', level: 4 })).toBeInTheDocument();
    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.getByText('Додати реквізити')).toBeInTheDocument();
    expect(screen.getByText('PDF файл')).toBeInTheDocument();
  });
});
