import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { ResearchModalView } from './ResearchModalView';

jest.mock('../../composition-modal/file-item/FileItem', () => ({
  __esModule: true,
  default: ({ fileName, onDelete }: { fileName: string; onDelete: () => void }) => (
    <div data-testid="mock-file-item">
      {fileName}
      <button type="button" onClick={onDelete}>
        delete-file
      </button>
    </div>
  )
}));

describe('ResearchModalView', () => {
  const onClose = jest.fn();
  const onSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required form fields', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    expect(screen.getByLabelText(/бібліографічний опис/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/автор/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/дати справи/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ключові слова/i)).toBeInTheDocument();
    expect(screen.getByText('Додайте файл або URL')).toBeInTheDocument();
    expect(screen.getByLabelText(/показувати на сайті/i)).toBeInTheDocument();
  });

  it('renders Cancel and Save actions', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    expect(screen.getByRole('button', { name: 'Скасувати' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeInTheDocument();
  });

  it('disables the Save button when required fields are empty', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();
  });

  it('enables the Save button once all required fields are filled', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/бібліографічний опис/i), { target: { value: 'Опис' } });
    fireEvent.change(screen.getByLabelText(/автор/i), { target: { value: 'Автор' } });
    fireEvent.change(screen.getByLabelText(/дати справи/i), { target: { value: '1970' } });
    fireEvent.change(screen.getByLabelText(/ключові слова/i), { target: { value: 'слово' } });

    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeEnabled();
  });

  it('pre-populates fields from initialData', () => {
    render(
      <ResearchModalView
        isOpen
        onClose={onClose}
        onSave={onSave}
        initialData={{
          bibliographicDescription: 'Існуючий опис',
          author: 'Існуючий автор',
          caseDates: '1980',
          keywords: 'існуючі слова'
        }}
      />
    );

    expect(screen.getByDisplayValue('Існуючий опис')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Існуючий автор')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1980')).toBeInTheDocument();
    expect(screen.getByDisplayValue('існуючі слова')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with form data when Save is clicked', async () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/бібліографічний опис/i), { target: { value: 'Опис' } });
    fireEvent.change(screen.getByLabelText(/автор/i), { target: { value: 'Автор' } });
    fireEvent.change(screen.getByLabelText(/дати справи/i), { target: { value: '1970' } });
    fireEvent.change(screen.getByLabelText(/ключові слова/i), { target: { value: 'слово' } });

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          bibliographicDescription: 'Опис',
          author: 'Автор',
          caseDates: '1970',
          keywords: 'слово'
        })
      );
    });
  });

  it('enforces the keywords character limit', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const longText = 'a'.repeat(300);
    fireEvent.change(screen.getByLabelText(/ключові слова/i), { target: { value: longText } });

    expect(screen.getByLabelText(/ключові слова/i)).not.toHaveValue(longText);
  });

  it('does not render the dialog content when isOpen is false', () => {
    render(<ResearchModalView isOpen={false} onClose={onClose} onSave={onSave} />);

    expect(screen.queryByLabelText(/бібліографічний опис/i)).not.toBeInTheDocument();
  });

  it('uploads a file via the file input and displays it', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('mock-file-item')).toHaveTextContent('document.pdf');
  });

  it('disables the "Add file" button once a file is uploaded', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByRole('button', { name: 'Додати файл' })).toBeDisabled();
  });

  it('disables the URL field once a file is uploaded', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByLabelText(/url/i)).toBeDisabled();
  });

  it('removes the uploaded file when delete is triggered', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByTestId('mock-file-item')).toBeInTheDocument();

    fireEvent.click(screen.getByText('delete-file'));

    expect(screen.queryByTestId('mock-file-item')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Додати файл' })).toBeEnabled();
  });

  it('updates the URL field value', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const urlInput = screen.getByLabelText(/url/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/doc.pdf' } });

    expect(urlInput).toHaveValue('https://example.com/doc.pdf');
  });

  it('resets the form after a successful save', async () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/бібліографічний опис/i), { target: { value: 'Опис' } });
    fireEvent.change(screen.getByLabelText(/автор/i), { target: { value: 'Автор' } });
    fireEvent.change(screen.getByLabelText(/дати справи/i), { target: { value: '1970' } });
    fireEvent.change(screen.getByLabelText(/ключові слова/i), { target: { value: 'слово' } });

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });

  it('triggers the hidden file input when "Add file" is clicked', () => {
    render(<ResearchModalView isOpen onClose={onClose} onSave={onSave} />);

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = jest.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));

    expect(clickSpy).toHaveBeenCalled();
  });
});
