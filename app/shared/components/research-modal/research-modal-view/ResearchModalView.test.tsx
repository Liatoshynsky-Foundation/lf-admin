import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';

import { ResearchModalView } from './ResearchModalView';
import { RESEARCH_FIELD_LIMITS, RESEARCH_VALIDATION_MESSAGES } from '~/constants/research';

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
  const onAddFile = jest.fn();
  const onDeleteFile = jest.fn();

  const renderView = (props: Partial<ComponentProps<typeof ResearchModalView>> = {}) =>
    render(
      <ResearchModalView
        isOpen
        onClose={onClose}
        onSave={onSave}
        onAddFile={onAddFile}
        onDeleteFile={onDeleteFile}
        {...props}
      />
    );

  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/бібліографічний опис/i), { target: { value: 'Опис' } });
    fireEvent.change(screen.getByLabelText(/автор/i), { target: { value: 'Автор' } });
    fireEvent.change(screen.getByLabelText(/дати справи/i), { target: { value: '1970' } });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps Save disabled until required fields are filled, including without keywords', () => {
    renderView();

    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();

    fillRequiredFields();

    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeEnabled();
  });

  it('pre-populates fields from initialData', () => {
    renderView({
      initialData: {
        bibliographicDescription: 'Існуючий опис',
        author: 'Існуючий автор',
        caseDates: '1980',
        keywords: 'існуючі слова'
      }
    });

    expect(screen.getByDisplayValue('Існуючий опис')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Існуючий автор')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1980')).toBeInTheDocument();
    expect(screen.getByDisplayValue('існуючі слова')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with form data when Save is clicked', async () => {
    renderView();

    fillRequiredFields();
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

  it.each([
    {
      label: /ключові слова/i,
      maxLength: RESEARCH_FIELD_LIMITS.keywords,
      name: 'keywords'
    },
    {
      label: /автор/i,
      maxLength: RESEARCH_FIELD_LIMITS.author,
      name: 'author'
    }
  ])('clamps $name input to $maxLength characters', ({ label, maxLength }) => {
    renderView();

    fireEvent.change(screen.getByLabelText(label), { target: { value: 'a'.repeat(maxLength + 50) } });

    expect(screen.getByLabelText(label)).toHaveValue('a'.repeat(maxLength));
  });

  it('does not render the dialog content when isOpen is false', () => {
    renderView({ isOpen: false });

    expect(screen.queryByLabelText(/бібліографічний опис/i)).not.toBeInTheDocument();
  });

  it('opens media picker via onAddFile', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));

    expect(onAddFile).toHaveBeenCalledTimes(1);
  });

  it('shows attached file, disables Add file, and still allows URL', () => {
    renderView({ attachedFileName: 'document.pdf' });

    expect(screen.getByTestId('mock-file-item')).toHaveTextContent('document.pdf');
    expect(screen.getByRole('button', { name: 'Додати файл' })).toBeDisabled();
    expect(screen.getByLabelText(/^url$/i)).toBeEnabled();
  });

  it('calls onDeleteFile when file delete is clicked', () => {
    renderView({ attachedFileName: 'document.pdf' });

    fireEvent.click(screen.getByText('delete-file'));

    expect(onDeleteFile).toHaveBeenCalledTimes(1);
  });

  it('disables Save and shows helper text for an invalid URL after blur', () => {
    renderView();

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/^url$/i), { target: { value: 'not-a-url' } });
    fireEvent.blur(screen.getByLabelText(/^url$/i));

    expect(screen.getByText(RESEARCH_VALIDATION_MESSAGES.urlInvalid)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();
  });

  it.each([
    {
      label: /бібліографічний опис/i,
      message: RESEARCH_VALIDATION_MESSAGES.bibliographicDescriptionRequired
    },
    {
      label: /автор/i,
      message: RESEARCH_VALIDATION_MESSAGES.authorRequired
    },
    {
      label: /дати справи/i,
      message: RESEARCH_VALIDATION_MESSAGES.yearRequired
    }
  ])('shows required error for $message after blur', ({ label, message }) => {
    renderView();

    fireEvent.blur(screen.getByLabelText(label));

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('shows author suggestions from authorOptions', async () => {
    renderView({ authorOptions: ['Коваленко Олена', 'Мельник Андрій'] });

    const authorInput = screen.getByLabelText(/автор/i);
    fireEvent.focus(authorInput);
    fireEvent.change(authorInput, { target: { value: 'Ков' } });
    fireEvent.keyDown(authorInput, { key: 'ArrowDown' });

    expect(await screen.findByText('Коваленко Олена')).toBeInTheDocument();
  });

  it('uses example.com placeholder for the URL field', () => {
    renderView();

    expect(screen.getByLabelText(/^url$/i)).toHaveAttribute('placeholder', 'https://example.com');
  });
});
