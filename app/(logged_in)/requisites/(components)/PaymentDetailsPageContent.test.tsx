import { fireEvent, render, screen } from '@testing-library/react';

import { MOCK_PAYMENT_DETAILS } from '../__mocks__/requisites';
import PaymentDetailsPageContent from './PaymentDetailsPageContent';
import {
  REQUISITES_EMPTY,
  REQUISITES_ERROR,
  REQUISITES_LOADING
} from '~/constants/requisites';

const mockUsePaymentDetails = jest.fn();

jest.mock('~/shared/hooks/use-payment-details/usePaymentDetails', () => ({
  usePaymentDetails: () => mockUsePaymentDetails()
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
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section aria-label={title}>{children}</section>
  )
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/shared/components/custom-formatting-field/CustomFormattingField', () => ({
  __esModule: true,
  CustomFormattingField: ({
    label,
    value,
    editable = true
  }: {
    label?: string;
    value?: { content?: Array<{ content?: Array<{ text?: string }> }> };
    onChange?: (value: unknown) => void;
    editable?: boolean;
  }) => (
    <div data-testid="custom-formatting-field" data-editable={String(editable)}>
      <span>{label}</span>
      <span data-testid="editor-preview">
        {value?.content?.[0]?.content?.[0]?.text ?? ''}
      </span>
    </div>
  )
}));

describe('PaymentDetailsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePaymentDetails.mockReturnValue({
      data: MOCK_PAYMENT_DETAILS,
      loading: false,
      error: undefined
    });
  });

  it('renders initial UAH tab and content correctly', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('heading', { name: 'Реквізити', level: 4 })).toBeInTheDocument();
    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();

    expect(screen.getByTestId('editor-preview')).toHaveTextContent('ФУНДАЦІЯ ЛЯТОШИНСЬКОГО');

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).toBeInTheDocument();
  });

  it('renders currency tabs in configured order', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: MOCK_PAYMENT_DETAILS,
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    const tabs = screen.getAllByRole('button').filter((button) =>
      ['UAH', 'USD', 'EUR', 'GBP'].includes(button.textContent ?? '')
    );
    expect(tabs.map((tab) => tab.textContent)).toEqual(['UAH', 'USD', 'EUR', 'GBP']);
  });

  it('renders the root-level PDF returned by the API', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: MOCK_PAYMENT_DETAILS,
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(
      screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')
    ).toBeInTheDocument();
  });

  it('renders loading state while payment details are being fetched', () => {
    mockUsePaymentDetails.mockReturnValue({ data: null, loading: true, error: undefined });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_LOADING.title)).toBeInTheDocument();
  });

  it('renders error state when payment details request fails', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Request failed')
    });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_ERROR.title)).toBeInTheDocument();
  });

  it('renders empty state when payment details record is missing', () => {
    mockUsePaymentDetails.mockReturnValue({ data: null, loading: false, error: undefined });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_EMPTY.title)).toBeInTheDocument();
  });

  it('renders empty state when payment details have no tabs', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: { ...MOCK_PAYMENT_DETAILS, tabs: [] },
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_EMPTY.title)).toBeInTheDocument();
  });

  it('switches between currency tabs while keeping page-level attachment', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();

    fireEvent.click(screen.getByText('USD'));

    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Beneficiary');
    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();

    fireEvent.click(screen.getByText('UAH'));
    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
  });

  it('does not render the save action', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.queryByRole('button', { name: /зберегти/i })).not.toBeInTheDocument();
  });

  it('renders tab editing controls as unavailable', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('button', { name: /додати реквізити/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Опції реквізиту' })).not.toBeInTheDocument();
  });

  it('renders the editor as non-editable', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'false');
  });

  it('renders PDF controls as disabled', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('button', { name: /додати файл/i })).toBeDisabled();
    expect(screen.getByTestId('delete-pdf-button')).toBeDisabled();
  });
});
