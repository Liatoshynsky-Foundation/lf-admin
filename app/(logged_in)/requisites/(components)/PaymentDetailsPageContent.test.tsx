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

    const textarea = screen.getByLabelText(/текст реквізитів/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('ФУНДАЦІЯ ЛЯТОШИНСЬКОГО');

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).toBeInTheDocument();
  });

  it('switches between currency tabs', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByText('USD'));

    const textarea = screen.getByLabelText(/текст реквізитів/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('SWIFT: UKSIUA2X');

    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();
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

  it('edits content in textarea', () => {
    render(<PaymentDetailsPageContent />);

    const textarea = screen.getByLabelText(/текст реквізитів/i);
    fireEvent.change(textarea, { target: { value: 'Новий IBAN: UA123456789' } });

    expect(textarea).toHaveValue('Новий IBAN: UA123456789');
  });

  it('removes attached PDF file', () => {
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
});
