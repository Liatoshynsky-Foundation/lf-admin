import { fireEvent, render, screen } from '@testing-library/react';

import { PdfAttachmentBlock } from './PdfAttachmentBlock';

jest.mock('~/public/icons/type-pdf.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="PdfIcon" />
}));

describe('PdfAttachmentBlock', () => {
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
      id: 'pdf-1',
      name: 'requisites-info.pdf',
      url: 'https://example.com/sample.pdf'
    };

    render(<PdfAttachmentBlock file={mockFile} onFileChange={jest.fn()} />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('requisites-info.pdf')).toBeInTheDocument();
  });

  it('calls onFileChange with null when delete button is clicked', () => {
    const handleFileChange = jest.fn();
    const mockFile = {
      id: 'pdf-1',
      name: 'requisites-info.pdf',
      url: 'https://example.com/sample.pdf'
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
        name: 'test-upload.pdf',
        url: 'blob:http://localhost/test-blob'
      })
    );
  });
});
