import { fireEvent, render, screen } from '@testing-library/react';
import toast from 'react-hot-toast';

import { PdfAttachmentBlock } from './PdfAttachmentBlock';

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

describe('PdfAttachmentBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Додати файл" button and triggers file input', () => {
    render(<PdfAttachmentBlock file={null} onFileChange={jest.fn()} />);

    expect(screen.getByText('PDF файл')).toBeInTheDocument();
    const addButton = screen.getByRole('button', { name: 'Додати файл' });
    expect(addButton).toBeInTheDocument();

    const fileInput = screen.getByTestId('pdf-file-input');
    const clickSpy = jest.spyOn(fileInput, 'click');

    fireEvent.click(addButton);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('renders attached PDF card when file prop is present', () => {
    const mockFile = {
      filename: 'requisites-info.pdf',
      url: 'https://example.com/sample.pdf',
      mimeType: 'application/pdf'
    };

    render(<PdfAttachmentBlock file={mockFile} onFileChange={jest.fn()} />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('requisites-info.pdf')).toBeInTheDocument();
  });

  it('calls onFileChange with null when delete button is clicked', () => {
    const handleFileChange = jest.fn();
    const mockFile = {
      filename: 'requisites-info.pdf',
      url: 'https://example.com/sample.pdf',
      mimeType: 'application/pdf'
    };

    render(<PdfAttachmentBlock file={mockFile} onFileChange={handleFileChange} />);

    const deleteButton = screen.getByTestId('delete-pdf-button');
    fireEvent.click(deleteButton);

    expect(handleFileChange).toHaveBeenCalledWith(null);
  });

  it('handles native file selection', () => {
    const handleFileChange = jest.fn();
    render(<PdfAttachmentBlock file={null} onFileChange={handleFileChange} />);

    const fileInput = screen.getByTestId('pdf-file-input');
    const file = new File(['dummy content'], 'test-upload.pdf', { type: 'application/pdf' });

    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test-blob');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(handleFileChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'test-upload.pdf',
        url: 'blob:http://localhost/test-blob'
      })
    );
  });

  it('handles file upload when mime type is empty but filename ends with .pdf', () => {
    const handleFileChange = jest.fn();
    render(<PdfAttachmentBlock file={null} onFileChange={handleFileChange} />);

    const fileInput = screen.getByTestId('pdf-file-input');
    const file = new File(['dummy content'], 'document.pdf', { type: '' });

    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/doc-blob');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(handleFileChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'document.pdf',
        mimeType: 'application/pdf'
      })
    );
  });

  it('shows error toast when non-pdf file is selected', () => {
    const handleFileChange = jest.fn();
    render(<PdfAttachmentBlock file={null} onFileChange={handleFileChange} />);

    const fileInput = screen.getByTestId('pdf-file-input');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(toast.error).toHaveBeenCalledWith('Дозволено завантажувати лише файли у форматі PDF');
    expect(handleFileChange).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const handleFileChange = jest.fn();
    const mockFile = {
      filename: 'requisites-info.pdf',
      url: 'https://example.com/sample.pdf',
      mimeType: 'application/pdf'
    };

    const { rerender } = render(<PdfAttachmentBlock file={null} onFileChange={handleFileChange} disabled />);
    const fileInput = screen.getByTestId('pdf-file-input');
    const clickSpy = jest.spyOn(fileInput, 'click');

    const addButton = screen.getByRole('button', { name: 'Додати файл' });
    fireEvent.click(addButton);
    expect(clickSpy).not.toHaveBeenCalled();

    rerender(<PdfAttachmentBlock file={mockFile} onFileChange={handleFileChange} disabled />);
    const deleteButton = screen.getByTestId('delete-pdf-button');
    fireEvent.click(deleteButton);
    expect(handleFileChange).not.toHaveBeenCalled();
  });

  it('does nothing when no file is selected in change event', () => {
    const handleFileChange = jest.fn();
    render(<PdfAttachmentBlock file={null} onFileChange={handleFileChange} />);

    const fileInput = screen.getByTestId('pdf-file-input');
    fireEvent.change(fileInput, { target: { files: [] } });

    expect(handleFileChange).not.toHaveBeenCalled();
  });
});
