import { fireEvent, render, screen } from '@testing-library/react';
import toast from 'react-hot-toast';

import { PdfAttachmentBlock } from './PdfAttachmentBlock';
import { PaymentDetailsPdfFile } from '~/constants/requisites';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

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
      onFileChange={jest.fn()}
      {...props}
    />
  );
};

describe('PdfAttachmentBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Додати файл" button and triggers file input', () => {
    renderPdfBlock();

    expect(screen.getByText('PDF файл')).toBeInTheDocument();
    const addButton = screen.getByRole('button', { name: 'Додати файл' });
    expect(addButton).toBeInTheDocument();

    const fileInput = screen.getByTestId('pdf-file-input');
    const clickSpy = jest.spyOn(fileInput, 'click');

    fireEvent.click(addButton);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('renders attached PDF card when file prop is present', () => {
    renderPdfBlock({ file: mockPdfFile });

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('requisites-info.pdf')).toBeInTheDocument();
  });

  it('calls onFileChange with null when delete button is clicked', () => {
    const handleFileChange = jest.fn();
    renderPdfBlock({ file: mockPdfFile, onFileChange: handleFileChange });

    fireEvent.click(screen.getByTestId('delete-pdf-button'));

    expect(handleFileChange).toHaveBeenCalledWith(null);
  });

  it.each([
    { filename: 'test-upload.pdf', type: 'application/pdf', blobUrl: 'blob:http://localhost/test-blob' },
    { filename: 'document.pdf', type: '', blobUrl: 'blob:http://localhost/doc-blob' }
  ])('handles file upload ($filename)', ({ filename, type, blobUrl }) => {
    const handleFileChange = jest.fn();
    renderPdfBlock({ onFileChange: handleFileChange });

    const file = new File(['dummy content'], filename, { type });
    global.URL.createObjectURL = jest.fn(() => blobUrl);

    fireEvent.change(screen.getByTestId('pdf-file-input'), { target: { files: [file] } });

    expect(handleFileChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filename,
        mimeType: 'application/pdf',
        url: blobUrl
      })
    );
  });

  it('shows error toast when non-pdf file is selected', () => {
    const handleFileChange = jest.fn();
    renderPdfBlock({ onFileChange: handleFileChange });

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('pdf-file-input'), { target: { files: [file] } });

    expect(toast.error).toHaveBeenCalledWith('Дозволено завантажувати лише файли у форматі PDF');
    expect(handleFileChange).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const handleFileChange = jest.fn();
    const { rerender } = renderPdfBlock({ onFileChange: handleFileChange, disabled: true });

    const fileInput = screen.getByTestId('pdf-file-input');
    const clickSpy = jest.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));
    expect(clickSpy).not.toHaveBeenCalled();

    rerender(
      <PdfAttachmentBlock
        file={mockPdfFile}
        onFileChange={handleFileChange}
        disabled
      />
    );
    fireEvent.click(screen.getByTestId('delete-pdf-button'));
    expect(handleFileChange).not.toHaveBeenCalled();
  });

  it('does nothing when no file is selected in change event', () => {
    const handleFileChange = jest.fn();
    renderPdfBlock({ onFileChange: handleFileChange });

    fireEvent.change(screen.getByTestId('pdf-file-input'), { target: { files: [] } });

    expect(handleFileChange).not.toHaveBeenCalled();
  });
});
