import { fireEvent, render, screen } from '@testing-library/react';

import { PdfAttachmentBlock } from './PdfAttachmentBlock';
import { PaymentDetailsPdfFile } from '~/constants/requisites';

jest.mock('~/public/icons/type-pdf.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="PdfIcon" />
}));

const mockPdfFile: PaymentDetailsPdfFile = {
  filename: 'requisites-info.pdf',
  url: 'https://example.com/sample.pdf',
  mimeType: 'application/pdf'
};

const renderPdfBlock = (props: Partial<React.ComponentProps<typeof PdfAttachmentBlock>> = {}) => {
  return render(
    <PdfAttachmentBlock
      file={null}
      onAddFile={jest.fn()}
      onDetachFile={jest.fn()}
      {...props}
    />
  );
};

describe('PdfAttachmentBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Додати файл" button and calls onAddFile', () => {
    const handleAddFile = jest.fn();
    renderPdfBlock({ onAddFile: handleAddFile });

    expect(screen.getByText('PDF файл')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));

    expect(handleAddFile).toHaveBeenCalledTimes(1);
  });

  it('renders the attached PDF with a preview link and an enabled detach button', () => {
    renderPdfBlock({ file: mockPdfFile });

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    const previewLink = screen.getByRole('link', { name: 'requisites-info.pdf' });
    expect(previewLink).toHaveAttribute('href', mockPdfFile.url);
    expect(previewLink).toHaveAttribute('target', '_blank');
    expect(previewLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('button', { name: 'Видалити файл' })).toBeEnabled();
  });

  it('calls onDetachFile when the detach button is clicked', () => {
    const onDetachFile = jest.fn();
    renderPdfBlock({ file: mockPdfFile, onDetachFile });

    fireEvent.click(screen.getByRole('button', { name: 'Видалити файл' }));

    expect(onDetachFile).toHaveBeenCalledTimes(1);
  });

  it('does nothing when disabled', () => {
    const handleAddFile = jest.fn();
    const onDetachFile = jest.fn();
    renderPdfBlock({ file: mockPdfFile, onAddFile: handleAddFile, onDetachFile, disabled: true });

    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));
    fireEvent.click(screen.getByRole('button', { name: 'Видалити файл' }));

    expect(handleAddFile).not.toHaveBeenCalled();
    expect(onDetachFile).not.toHaveBeenCalled();
  });
});
