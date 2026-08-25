import 'dayjs/locale/uk';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';

import CompositionModal from './CompositionModal';
import { COMPOSITION_MODAL_LABELS, COMPOSITION_MODAL_TEXTS, COMPOSITION_VALIDATION_MESSAGES } from '~/constants/opus';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import type { OpusCompositionData } from '~/types/opus';

const buildDefaultMediaResult = (): MediaModalResult => ({
  selected: { kind: 'upload', id: 'u1', fileName: 'audio.mp3', file: new File([], 'audio.mp3') },
  crop: null,
  uploadResult: {
    url: 'https://files/audio.mp3',
    filename: 'audio.mp3',
    originalName: 'audio.mp3',
    mimeType: 'audio/mpeg',
    size: 100
  }
});

let mockMediaResult: MediaModalResult = buildDefaultMediaResult();

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({
    open,
    onClose,
    onApply
  }: {
    open: boolean;
    onClose: () => void;
    onApply: (result: MediaModalResult) => void;
  }): ReactElement | null =>
    open ? (
      <div>
        <button type="button" data-testid="media-apply" onClick={() => onApply(mockMediaResult)}>
          apply
        </button>
        <button type="button" data-testid="media-close" onClick={onClose}>
          close media
        </button>
      </div>
    ) : null
}));

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSubmit: jest.fn()
};

const INPUTS = {
  title: 'Назва твору *',
  genre: 'Жанр',
  year: 'Рік',
  noteName: 'Назва нот',
  noteDate: 'Дата видання',
  audioName: 'Назва аудіо',
  createButton: 'Створити',
  addNotesButton: 'Додати ноти',
  addAudioButton: 'Додати аудіо',
  saveButton: 'Зберегти'
} as const;

const MOCK_NOTE_DATE = '01/01/2020';
const MOCK_UPDATED_NOTE_DATE = '01/01/2022';
const MOCK_UPDATED_NOTE_NAME = 'Оновлені ноти';

const INITIAL_COMPOSITION_VALUE: OpusCompositionData = {
  id: 'c1',
  name: 'Твір',
  genre: '',
  year: '',
  audios: [{ id: 'a1', name: 'Запис', fileUrl: 'https://files/rec.mp3' }],
  notes: [
    { id: 'n1', name: 'Ноти 1', fileUrl: 'https://files/sheet.pdf', publishDate: '01/01/2020' },
    { id: 'n2', name: 'Ноти 2' }
  ]
};

describe('CompositionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaResult = buildDefaultMediaResult();
  });

  it('renders the create heading and empty title', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    expect(screen.getByText('Нова композиція')).toBeInTheDocument();
    expect(screen.getByLabelText(INPUTS.title)).toHaveValue('');
  });

  it('renders the edit heading and prefilled title', () => {
    const initialValue: OpusCompositionData = {
      ...INITIAL_COMPOSITION_VALUE,
      name: 'Існуючий твір',
      genre: 'Соната',
      year: '1920',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    expect(screen.getByText('Редагування композиції')).toBeInTheDocument();
    expect(screen.getByLabelText(INPUTS.title)).toHaveValue('Існуючий твір');
  });

  it('renders nothing while closed', () => {
    const { container } = render(<CompositionModal {...baseProps} open={false} mode="create" />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Нова композиція')).not.toBeInTheDocument();
  });

  it('triggers onClose when close button or cancel button is clicked', () => {
    const onClose = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Закрити' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('blocks submit and shows an error when the title is empty', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(COMPOSITION_VALIDATION_MESSAGES.titleRequired)).toBeInTheDocument();
  });

  it('clears error message when user starts typing in title field', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));
    expect(screen.getByText(COMPOSITION_VALIDATION_MESSAGES.titleRequired)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(INPUTS.title);
    fireEvent.change(titleInput, { target: { value: 'Нова назва' } });

    expect(screen.queryByText('Обовʼязкове поле')).not.toBeInTheDocument();
  });

  it('shows the empty-files notice when no files are attached', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    expect(screen.getByText(/Додайте файли для відкритого доступу/)).toBeInTheDocument();
  });

  it('updates the genre and year fields', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    const genreField = screen.getByLabelText(INPUTS.genre);
    fireEvent.change(genreField, { target: { value: 'Ноктюрн' } });
    expect(genreField).toHaveValue('Ноктюрн');

    const yearField = screen.getByLabelText(INPUTS.year);
    fireEvent.change(yearField, { target: { value: '1888' } });
    expect(yearField).toHaveValue('1888');
  });

  it('clears the title with the adornment button', () => {
    const initialValue: OpusCompositionData = {
      ...INITIAL_COMPOSITION_VALUE,
      name: 'Твір',
      genre: '',
      year: '',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    const nameField = screen.getByLabelText(INPUTS.title);
    expect(nameField).toHaveValue('Твір');

    const clearTitleBtn = screen.getAllByRole('button').find((btn) => btn.closest('.MuiInputAdornment-root'));
    if (clearTitleBtn) {
      fireEvent.click(clearTitleBtn);
    }

    expect(nameField).toHaveValue('');
  });

  it('adds a notes row with name and date fields', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));

    expect(screen.getByLabelText(INPUTS.noteName)).toBeInTheDocument();
    expect(screen.getByLabelText(INPUTS.noteDate)).toBeInTheDocument();
  });

  it('accepts a valid note publication date', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    const dateField = screen.getByLabelText(INPUTS.noteDate);

    fireEvent.change(dateField, { target: { value: '01/01/2023' } });
    expect(dateField).toHaveValue('01/01/2023');
  });

  it('formats a typed publication date and submits it as an ISO date', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    fireEvent.change(screen.getByLabelText(INPUTS.noteName), { target: { value: 'Ноти' } });
    const dateField = screen.getByLabelText(INPUTS.noteDate);
    fireEvent.change(dateField, { target: { value: '01122020' } });

    expect(dateField).toHaveValue('01/12/2020');

    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ notes: [expect.objectContaining({ publishDate: '2020-12-01' })] })
    );
  });

  it('keeps a partial note publication date visible and reports it as invalid', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    fireEvent.change(screen.getByLabelText(INPUTS.noteName), { target: { value: 'Ноти' } });
    const dateField = screen.getByLabelText(INPUTS.noteDate);
    fireEvent.change(dateField, { target: { value: '0112' } });

    expect(dateField).toHaveValue('01/12');

    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(COMPOSITION_VALIDATION_MESSAGES.yearInvalid)).toBeInTheDocument();
  });

  it('clears a prefilled note publication date', () => {
    render(<CompositionModal {...baseProps} mode="edit" initialValue={INITIAL_COMPOSITION_VALUE} />);

    const dateField = screen.getByDisplayValue(MOCK_NOTE_DATE);
    fireEvent.change(dateField, { target: { value: '' } });

    expect(screen.queryByDisplayValue(MOCK_NOTE_DATE)).not.toBeInTheDocument();
  });

  it('shows error on note if publishDate is set without name or file', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(INPUTS.title);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    const dateField = screen.getByLabelText(INPUTS.noteDate);
    fireEvent.change(dateField, { target: { value: '01/01/2023' } });

    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText((content) => content.includes(COMPOSITION_MODAL_TEXTS.emptyNoteDateError))
    ).toBeInTheDocument();
  });

  it('clears note errors when editing note name and date after a validation error', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));

    const dateField = screen.getByLabelText(INPUTS.noteDate);
    fireEvent.change(dateField, { target: { value: '01/01/2023' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText((content) => content.includes(COMPOSITION_MODAL_TEXTS.emptyNoteDateError))
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(INPUTS.noteName), { target: { value: 'Ноти' } });
    expect(
      screen.getByText((content) => content.includes(COMPOSITION_MODAL_TEXTS.emptyNoteDateError))
    ).toBeInTheDocument();

    fireEvent.change(dateField, { target: { value: '01/01/2024' } });
    expect(
      screen.queryByText((content) => content.includes(COMPOSITION_MODAL_TEXTS.emptyNoteDateError))
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('removes a note row using its delete button', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    expect(screen.getByLabelText(INPUTS.noteName)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: COMPOSITION_MODAL_TEXTS.deleteAriaLabel }));
    expect(screen.queryByLabelText(INPUTS.noteName)).not.toBeInTheDocument();
  });

  it('filters out empty note rows on submit', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(INPUTS.title);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as OpusCompositionData;
    expect(submitted.notes).toHaveLength(0);
  });

  it('renders prefilled audios and notes and hides the empty notice', () => {
    const initialValue: OpusCompositionData = {
      ...INITIAL_COMPOSITION_VALUE,
      genre: 'Соната',
      year: '1900',
      audios: [
        ...INITIAL_COMPOSITION_VALUE.audios,
        { id: 'a2', name: '', fileUrl: 'https://files/second.mp3?token=123' }
      ]
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    expect(screen.getByText('Запис')).toBeInTheDocument();
    expect(screen.getByText('second.mp3')).toBeInTheDocument();
    expect(screen.getByText('sheet.pdf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ноти 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_NOTE_DATE)).toBeInTheDocument();
    expect(screen.queryByText(/Додайте файли/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: COMPOSITION_MODAL_LABELS.addAudio })).toBeDisabled();
  });

  it('renders an audio row with an empty file URL without crashing', () => {
    const initialValue: OpusCompositionData = {
      ...INITIAL_COMPOSITION_VALUE,
      audios: [{ id: 'empty-url', name: '', fileUrl: '' }],
      notes: []
    };

    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    expect(screen.getByRole('button', { name: COMPOSITION_MODAL_TEXTS.deleteAriaLabel })).toBeInTheDocument();
  });

  it('edits, clears and removes prefilled media', () => {
    const initialValue: OpusCompositionData = { ...INITIAL_COMPOSITION_VALUE };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    fireEvent.change(screen.getByDisplayValue('Ноти 1'), { target: { value: MOCK_UPDATED_NOTE_NAME } });
    fireEvent.change(screen.getByDisplayValue(MOCK_NOTE_DATE), { target: { value: MOCK_UPDATED_NOTE_DATE } });
    expect(screen.getByDisplayValue(MOCK_UPDATED_NOTE_NAME)).toBeInTheDocument();
    expect(screen.getByDisplayValue(MOCK_UPDATED_NOTE_DATE)).toBeInTheDocument();

    const iconButtons = screen.getAllByRole('button');
    const clearFileBtn = iconButtons.find(
      (btn) =>
        btn.querySelector('svg.lucide-trash-2') &&
        btn.closest('.MuiBox-root')?.querySelector('p')?.textContent?.includes('sheet.pdf')
    );

    if (clearFileBtn) {
      fireEvent.click(clearFileBtn);
    }
    expect(screen.queryByText('sheet.pdf')).not.toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg.lucide-trash-2'));
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText('Запис')).not.toBeInTheDocument();
  });

  it('attaches an audio file as a chip via the media modal', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addAudioButton }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
  });

  it('attaches an audio from a gallery selection without an upload result', () => {
    mockMediaResult = {
      selected: { kind: 'gallery', id: 'g1', fileName: 'gallery.mp3', src: 'https://cdn/gallery.mp3', locale: 'uk' },
      crop: null
    };
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addAudioButton }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('gallery.mp3')).toBeInTheDocument();
  });

  it('ignores the media apply when no url can be resolved', () => {
    mockMediaResult = {
      selected: { kind: 'upload', id: 'u1', fileName: 'nourl.mp3', file: new File([], 'nourl.mp3') },
      crop: null
    };
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addAudioButton }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText(/Додайте файли/)).toBeInTheDocument();
    expect(screen.queryByText('nourl.mp3')).not.toBeInTheDocument();
  });

  it('attaches a file to a notes row via the media modal', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addNotesButton }));
    const uploadButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg.lucide-cloud-upload'));
    fireEvent.click(uploadButtons[0]);
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
  });

  it('closes media modal on close action without changes', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.addAudioButton }));
    expect(screen.getByTestId('media-close')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('media-close'));
    expect(screen.queryByTestId('media-close')).not.toBeInTheDocument();
  });

  it('submits the composition with a trimmed title in edit mode', () => {
    const onSubmit = jest.fn();
    const initialValue: OpusCompositionData = {
      ...INITIAL_COMPOSITION_VALUE,
      name: 'Початковий твір',
      genre: 'Соната',
      year: '1920',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: '  Редагований твір  ' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.saveButton }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as OpusCompositionData;
    expect(submitted.name).toBe('Редагований твір');
  });

  it('renders and submits a note with an omitted name', () => {
    const onSubmit = jest.fn();
    render(
      <CompositionModal
        {...baseProps}
        mode="edit"
        initialValue={{
          ...INITIAL_COMPOSITION_VALUE,
          name: 'Valid Title',
          audios: [],
          notes: [{ id: 'unnamed-note', fileUrl: 'https://files/sheet.pdf', publishDate: '01/01/2020' }]
        }}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText(INPUTS.noteName)).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: INPUTS.saveButton }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ notes: [expect.objectContaining({ id: 'unnamed-note' })] })
    );
  });

  it('rejects a one-character title', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(COMPOSITION_VALIDATION_MESSAGES.titleTooShort)).toBeInTheDocument();
  });

  it('accepts exactly 250 title characters and enforces the UI limit', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);
    const titleField = screen.getByLabelText(INPUTS.title);
    const title = 'A'.repeat(250);
    fireEvent.change(titleField, { target: { value: `${title}B` } });
    expect(titleField).toHaveValue(title);
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('rejects a 251-character title supplied in the initial value', () => {
    const onSubmit = jest.fn();
    render(
      <CompositionModal
        {...baseProps}
        mode="edit"
        initialValue={{ ...INITIAL_COMPOSITION_VALUE, name: 'A'.repeat(251) }}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: INPUTS.saveButton }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(COMPOSITION_VALIDATION_MESSAGES.titleTooLong)).toBeInTheDocument();
  });

  it('accepts genre boundary values of 2 and 150 characters', () => {
    for (const genre of ['AB', 'A'.repeat(150)]) {
      const onSubmit = jest.fn();
      const { unmount } = render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
      fireEvent.change(screen.getByLabelText(INPUTS.genre), { target: { value: genre } });
      fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it.each(['0000', '9999'])('accepts valid boundary year %s', (year) => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByLabelText(INPUTS.year), { target: { value: year } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('accepts a whitespace-padded year after normalization', () => {
    const onSubmit = jest.fn();
    render(
      <CompositionModal
        {...baseProps}
        mode="edit"
        initialValue={{ ...INITIAL_COMPOSITION_VALUE, year: ' 2020 ' }}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: INPUTS.saveButton }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('blocks submit and shows an error for an invalid composition year', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByLabelText(INPUTS.year), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Введіть коректну дату.')).toBeInTheDocument();
  });

  it('blocks submit and shows an error for an invalid composition genre', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(INPUTS.title), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByLabelText(INPUTS.genre), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: INPUTS.createButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(COMPOSITION_VALIDATION_MESSAGES.genreTooShort)).toBeInTheDocument();
  });

  it('blocks submit and shows an error for an invalid note publication date', () => {
    const onSubmit = jest.fn();
    const initialValue: OpusCompositionData = {
      ...INITIAL_COMPOSITION_VALUE,
      notes: [{ id: 'invalid-date', name: 'Ноти', publishDate: 'not-a-date' }]
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: INPUTS.saveButton }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Введіть коректну дату.')).toBeInTheDocument();
  });

  it('restricts non-numeric input for the year field', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    const yearField = screen.getByLabelText(INPUTS.year);

    fireEvent.change(yearField, { target: { value: 'abc' } });
    expect(yearField).toHaveValue('');

    fireEvent.change(yearField, { target: { value: '19a20' } });
    expect(yearField).toHaveValue('');

    fireEvent.change(yearField, { target: { value: '1920' } });
    expect(yearField).toHaveValue('1920');
  });
});
