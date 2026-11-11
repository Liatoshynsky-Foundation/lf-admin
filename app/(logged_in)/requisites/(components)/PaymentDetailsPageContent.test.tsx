import { fireEvent, render, screen } from '@testing-library/react';

import { MOCK_PAYMENT_DETAILS } from '../__mocks__/requisites';
import PaymentDetailsPageContent from './PaymentDetailsPageContent';
import {
  REQUISITES_EMPTY,
  REQUISITES_ERROR,
  REQUISITES_LOADING
} from '~/constants/requisites';

// import { waitFor } from '@testing-library/react';
// import toast from 'react-hot-toast';

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
    onChange
  }: {
    label?: string;
    value?: { content?: Array<{ content?: Array<{ text?: string }> }> };
    onChange: (value: unknown) => void;
  }) => (
    <div data-testid="custom-formatting-field">
      <span>{label}</span>
      <span data-testid="editor-preview">
        {value?.content?.[0]?.content?.[0]?.text ?? ''}
      </span>
      <button
        data-testid="change-editor-btn"
        onClick={() =>
          onChange({
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Новий IBAN: UA123456789' }] }]
          })
        }
      >
        Change
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

  /*
  it('adds a new tab when clicking "Додати реквізити"', () => {
    render(<PaymentDetailsPageContent />);

    const addButton = screen.getByRole('button', { name: /додати реквізити/i });
    fireEvent.click(addButton);

    const input = screen.getByPlaceholderText('Без назви');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'PLN' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('PLN')).toBeInTheDocument();
  });

  it('renames an existing tab via "Редагувати назву" menu item', () => {
    render(<PaymentDetailsPageContent />);

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);

    const renameItem = screen.getByText('Редагувати назву');
    expect(renameItem).toBeInTheDocument();

    fireEvent.click(renameItem);

    const input = screen.getByDisplayValue('UAH');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'CZK' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('CZK')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('CZK')).not.toBeInTheDocument();
  });

  it('edits content in editor', () => {
    render(<PaymentDetailsPageContent />);

    const changeBtn = screen.getByTestId('change-editor-btn');
    fireEvent.click(changeBtn);

    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Новий IBAN: UA123456789');
  });

  it('removes the page-level attached PDF file', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();

    const deletePdfButton = screen.getByTestId('delete-pdf-button');
    fireEvent.click(deletePdfButton);

    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();
  });

  it('saves requisites and shows success toast', async () => {
    render(<PaymentDetailsPageContent />);

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Реквізити успішно збережено');
    });
  });

  it('deletes active tab and selects next available tab', () => {
    render(<PaymentDetailsPageContent />);

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);

    const deleteItem = screen.getByText('Видалити реквізит');
    fireEvent.click(deleteItem);

    expect(screen.queryByText('UAH')).not.toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Beneficiary');
  });

  it('prevents deleting the last remaining tab', () => {
    render(<PaymentDetailsPageContent />);

    for (let i = 0; i < 3; i++) {
      const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
      fireEvent.click(optionsButton);
      const deleteItem = screen.getByText('Видалити реквізит');
      fireEvent.click(deleteItem);
    }

    expect(screen.getByText('GBP')).toBeInTheDocument();

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);
    const deleteItem = screen.getByText('Видалити реквізит');
    fireEvent.click(deleteItem);

    expect(toast.error).toHaveBeenCalledWith('Неможливо видалити останню вкладку');
    expect(screen.getByText('GBP')).toBeInTheDocument();
  });

  it('attaches, replaces, and removes PDF file with object URL revocation', () => {
    global.URL.createObjectURL = jest
      .fn()
      .mockReturnValueOnce('blob:http://localhost/first.pdf')
      .mockReturnValueOnce('blob:http://localhost/second.pdf');
    global.URL.revokeObjectURL = jest.fn();

    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByText('USD'));
    const fileInput = screen.getByTestId('pdf-file-input');

    const firstFile = new File(['dummy1'], 'first.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [firstFile] } });
    expect(screen.getByText('first.pdf')).toBeInTheDocument();

    fireEvent.click(screen.getByText('UAH'));
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('USD'));
    const secondFile = new File(['dummy2'], 'second.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [secondFile] } });
    expect(screen.getByText('second.pdf')).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/first.pdf');

    const deletePdfButton = screen.getByTestId('delete-pdf-button');
    fireEvent.click(deletePdfButton);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/second.pdf');
  });

  it('keeps page-level attachment independent from tab deletion', () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/tab-delete.pdf');
    global.URL.revokeObjectURL = jest.fn();

    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByText('USD'));
    const fileInput = screen.getByTestId('pdf-file-input');
    const file = new File(['dummy'], 'tab-delete.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);
    const deleteItem = screen.getByText('Видалити реквізит');
    fireEvent.click(deleteItem);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('revokes all remaining local blob URLs when page unmounts', () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/unmount.pdf');
    global.URL.revokeObjectURL = jest.fn();

    const { unmount } = render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByText('USD'));
    const fileInput = screen.getByTestId('pdf-file-input');
    const file = new File(['dummy'], 'unmount.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/unmount.pdf');
  });

  it('cancels editing tab id when clicking on another tab', () => {
    render(<PaymentDetailsPageContent />);

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);

    const renameItem = screen.getByText('Редагувати назву');
    fireEvent.click(renameItem);

    expect(screen.getByDisplayValue('UAH')).toBeInTheDocument();

    fireEvent.click(screen.getByText('USD'));
    expect(screen.queryByDisplayValue('UAH')).not.toBeInTheDocument();
  });
  */
});
