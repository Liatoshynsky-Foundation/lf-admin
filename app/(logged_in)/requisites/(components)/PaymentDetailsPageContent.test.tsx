import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';

import PaymentDetailsPageContent from './PaymentDetailsPageContent';

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

  it('switches between currency tabs and changes attached file accordingly', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();

    fireEvent.click(screen.getByText('USD'));

    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Beneficiary');
    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('UAH'));
    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
  });

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

  it('removes attached PDF file for the active tab', () => {
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

  it('shows error toast when saving throws an error', async () => {
    (toast.success as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Save error');
    });

    render(<PaymentDetailsPageContent />);

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Помилка під час збереження');
    });
  });

  it('attaches a new PDF file for active tab', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByText('USD'));
    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();

    const fileInput = screen.getByTestId('pdf-file-input');
    const file = new File(['dummy'], 'new-usd.pdf', { type: 'application/pdf' });
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/new-usd');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('new-usd.pdf')).toBeInTheDocument();
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
});
