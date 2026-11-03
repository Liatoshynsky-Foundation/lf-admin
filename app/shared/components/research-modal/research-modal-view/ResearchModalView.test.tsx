import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import type { ChangeEvent, ComponentProps, ReactNode } from 'react';

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

jest.mock('~/ds-components/text-field/TextField', () => {
  type MockTextFieldProps = {
    label?: string;
    value?: string | JSONContent | null;
    onChange?: (value: string | ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: boolean;
    helperText?: ReactNode;
    fieldType?: string;
  };

  const MockComponent = ({ label = '', value, onChange, onBlur, error, helperText, fieldType }: MockTextFieldProps) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        data-testid={`mock-${fieldType || 'styled'}-input`}
        data-value-type={typeof value}
        value={typeof value === 'object' ? JSON.stringify(value) : (value ?? '')}
        onChange={(event) => onChange?.(fieldType === 'formatting' ? event.target.value : event)}
        onBlur={onBlur}
      />
      {error && helperText && <span>{helperText}</span>}
    </div>
  );

  return {
    __esModule: true,
    default: MockComponent,
    CustomTextField: MockComponent,
    TextField: MockComponent
  };
});

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
    fireEvent.change(screen.getByLabelText(/рік публікації/i), { target: { value: '1970' } });
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

  it('parses serialized TipTap values before passing them to the rich-text editors', () => {
    const serializedDoc = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Існуючий текст' }] }]
    });

    renderView({
      initialData: {
        bibliographicDescription: serializedDoc,
        author: serializedDoc,
        caseDates: '1980',
        keywords: serializedDoc
      }
    });

    const expectedEditorValue = JSON.stringify(JSON.parse(serializedDoc));
    expect(screen.getByLabelText('Бібліографічний опис *')).toHaveValue(expectedEditorValue);
    expect(screen.getByLabelText('Автор(и)/Упорядник(и) *')).toHaveValue(expectedEditorValue);
    expect(screen.getByLabelText('Ключові слова')).toHaveValue(expectedEditorValue);
    expect(screen.getByRole('textbox', { name: /рік публікації/i })).toHaveValue('1980');
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

  it.each(['author', 'bibliographicDescription'] as const)(
    'does not submit when the required %s field is empty',
    (missingField) => {
      renderView();

      if (missingField !== 'bibliographicDescription') {
        fireEvent.change(screen.getByLabelText('Бібліографічний опис *'), { target: { value: 'Опис' } });
      }
      if (missingField !== 'author') {
        fireEvent.change(screen.getByLabelText('Автор(и)/Упорядник(и) *'), { target: { value: 'Автор' } });
      }
      fireEvent.change(screen.getByLabelText('Рік публікації *'), { target: { value: '1970' } });
      fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

      expect(onSave).not.toHaveBeenCalled();
    }
  );

  it('clamps caseDates input to maxLength characters', () => {
    renderView();

    const yearInput = screen.getByLabelText(/рік публікації/i);
    fireEvent.change(yearInput, {
      target: { value: 'a'.repeat(RESEARCH_FIELD_LIMITS.year + 50) }
    });

    expect(yearInput).toHaveValue('a'.repeat(RESEARCH_FIELD_LIMITS.year));
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
      label: /рік публікації/i,
      message: RESEARCH_VALIDATION_MESSAGES.yearRequired
    }
  ])('shows required error for $message after blur', ({ label, message }) => {
    renderView();

    fireEvent.blur(screen.getByLabelText(label));

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('uses example.com placeholder for the URL field', () => {
    renderView();

    expect(screen.getByLabelText(/^url$/i)).toHaveAttribute('placeholder', 'https://example.com');
  });
});
