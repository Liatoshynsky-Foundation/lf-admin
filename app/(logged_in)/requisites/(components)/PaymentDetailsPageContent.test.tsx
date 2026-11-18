import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';

import { MOCK_PAYMENT_DETAILS } from '../__mocks__/requisites';
import PaymentDetailsPageContent from './PaymentDetailsPageContent';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import {
  REQUISITES_EMPTY,
  REQUISITES_ERROR,
  REQUISITES_LOADING,
  REQUISITES_MESSAGES
} from '~/constants/requisites';

const mockUsePaymentDetails = jest.fn();

const mockUpdatePaymentDetails = jest.fn();

jest.mock('~/shared/hooks/use-payment-details/usePaymentDetails', () => ({
  ...jest.requireActual('~/shared/hooks/use-payment-details/usePaymentDetails'),
  usePaymentDetails: () => mockUsePaymentDetails()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpdatePaymentDetailsMutation: () => [mockUpdatePaymentDetails, { loading: false }]
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
    onChange,
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
      <button
        type="button"
        onClick={() =>
          onChange?.({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Edited' }] }] })
        }
      >
        Edit content
      </button>
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

  it('renders the save action', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('button', { name: /зберегти/i })).toBeInTheDocument();
  });

  it('renders the editor as editable', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'true');
  });

  it('does not offer tab deletion', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));

    expect(screen.getByText('Редагувати назву')).toBeInTheDocument();
    expect(screen.queryByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU)).not.toBeInTheDocument();
  });

  it('saves edited content, new tabs in display order and the loaded PDF', async () => {
    const pdfWithSize = { ...MOCK_PAYMENT_DETAILS.pdfFile!, sizeBytes: 2048 };
    mockUsePaymentDetails.mockReturnValue({
      data: { ...MOCK_PAYMENT_DETAILS, pdfFile: pdfWithSize },
      loading: false,
      error: undefined
    });
    mockUpdatePaymentDetails.mockResolvedValue({ data: undefined });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit content' }));
    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES }));
    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(mockUpdatePaymentDetails).toHaveBeenCalledTimes(1));

    const { input } = mockUpdatePaymentDetails.mock.calls[0][0].variables;
    expect(input.tabs.map((tab: { id?: string; name: string }) => tab.id ?? tab.name)).toEqual([
      'req-uah',
      'req-usd',
      'req-eur',
      'req-gbp',
      REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY
    ]);
    expect(input.tabs[0].content.content[0].content[0].text).toBe('Edited');
    expect(input.tabs[4]).not.toHaveProperty('id');
    expect(input.pdfFile).toEqual({
      filename: pdfWithSize.filename,
      url: pdfWithSize.url,
      mimeType: pdfWithSize.mimeType,
      sizeBytes: 2048
    });
  });

  it('updates the form from the response and shows success feedback after saving', async () => {
    mockUpdatePaymentDetails.mockResolvedValue({
      data: {
        updatePaymentDetails: {
          ...MOCK_PAYMENT_DETAILS,
          tabs: [{ id: 'saved-uah', name: 'UAH saved', content: MOCK_PAYMENT_DETAILS.tabs[0].content, order: 0 }]
        }
      }
    });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_SUCCESS));
    expect(screen.getByText('UAH saved')).toBeInTheDocument();
    expect(screen.queryByText('USD')).not.toBeInTheDocument();
  });

  it('disables editing, adding and renaming tabs while saving', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    mockUpdatePaymentDetails.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      })
    );
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'false');
    expect(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Опції реквізиту' })).not.toBeInTheDocument();

    await act(async () => {
      resolveSave({ data: { updatePaymentDetails: MOCK_PAYMENT_DETAILS } });
    });

    await waitFor(() =>
      expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'true')
    );
    expect(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Опції реквізиту' })).toBeInTheDocument();
  });

  it('shows an error and keeps local edits when the response has no saved record', async () => {
    mockUpdatePaymentDetails.mockResolvedValue({ data: undefined });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES }));
    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_ERROR));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY)).toBeInTheDocument();
  });

  it('keeps local edits and shows an error when saving fails', async () => {
    mockUpdatePaymentDetails.mockRejectedValue(new Error('Network error'));
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES }));
    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_ERROR));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY)).toBeInTheDocument();
  });

  it('renders PDF controls as disabled', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('button', { name: /додати файл/i })).toBeDisabled();
    expect(screen.getByTestId('delete-pdf-button')).toBeDisabled();
  });

  it('rejects renaming a tab to an existing name regardless of case', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText('Редагувати назву'));

    const input = screen.getByDisplayValue('UAH');

    fireEvent.change(input, { target: { value: 'usd' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(toast.error).toHaveBeenCalledWith(PAYMENT_DETAILS_MESSAGES.tabNameDuplicate);

    expect(screen.getByDisplayValue('usd')).toBeInTheDocument();
  });

  it('successfully renames a tab when the new name is unique', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText('Редагувати назву'));

    const input = screen.getByDisplayValue('UAH');

    fireEvent.change(input, { target: { value: 'CAD' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('CAD')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('CAD')).not.toBeInTheDocument();

    expect(toast.error).not.toHaveBeenCalled();
  });
});
