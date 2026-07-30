import { fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';

import CompositionModal from './CompositionModal';
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

describe('CompositionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaResult = buildDefaultMediaResult();
  });

  it('renders the create heading and empty title', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    expect(screen.getByText('Нова композиція')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва твору *')).toHaveValue('');
  });

  it('renders the edit heading and prefilled title', () => {
    const initialValue: OpusCompositionData = {
      id: 'c1',
      name: 'Існуючий твір',
      genre: 'Соната',
      year: '1920',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    expect(screen.getByText('Редагування композиції')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва твору *')).toHaveValue('Існуючий твір');
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

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Обовʼязкове поле')).toBeInTheDocument();
  });

  it('clears error message when user starts typing in title field', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));
    expect(screen.getByText('Обовʼязкове поле')).toBeInTheDocument();

    const titleInput = screen.getByLabelText('Назва твору *');
    fireEvent.change(titleInput, { target: { value: 'Нова назва' } });

    expect(screen.queryByText('Обовʼязкове поле')).not.toBeInTheDocument();
  });

  it('shows the empty-files notice when no files are attached', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    expect(screen.getByText(/Додайте файли для відкритого доступу/)).toBeInTheDocument();
  });

  it('updates the genre and year fields', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    const genreField = screen.getByLabelText('Жанр');
    fireEvent.change(genreField, { target: { value: 'Ноктюрн' } });
    expect(genreField).toHaveValue('Ноктюрн');

    const yearField = screen.getByLabelText('Рік');
    fireEvent.change(yearField, { target: { value: '1888' } });
    expect(yearField).toHaveValue('1888');
  });

  it('clears the title with the adornment button', () => {
    const initialValue: OpusCompositionData = {
      id: 'c1',
      name: 'Твір',
      genre: '',
      year: '',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    const nameField = screen.getByLabelText('Назва твору *');
    expect(nameField).toHaveValue('Твір');

    fireEvent.click(screen.getByRole('button', { name: 'Очистити' }));

    expect(nameField).toHaveValue('');
  });

  it('adds a notes row with name and date fields', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати ноти' }));

    expect(screen.getByLabelText('Назва нот *')).toBeInTheDocument();
    expect(screen.getByLabelText('Дата видання *')).toBeInTheDocument();
  });

  it('renders prefilled audios and notes and hides the empty notice', () => {
    const initialValue: OpusCompositionData = {
      id: 'c1',
      name: 'Твір',
      genre: 'Соната',
      year: '1900',
      audios: [
        { id: 'a1', name: 'Запис', fileUrl: 'https://files/rec.mp3' },
        { id: 'a2', name: '', fileUrl: 'https://files/second.mp3?token=123' }
      ],
      notes: [
        { id: 'n1', name: 'Ноти 1', fileUrl: 'https://files/sheet.pdf', publishDate: '2020' },
        { id: 'n2', name: 'Ноти 2' }
      ]
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    expect(screen.getByText('Запис')).toBeInTheDocument();
    expect(screen.getByText('second.mp3')).toBeInTheDocument();
    expect(screen.getByText('sheet.pdf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ноти 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
    expect(screen.queryByText(/Додайте файли/)).not.toBeInTheDocument();
  });

  it('edits, clears and removes prefilled media', () => {
    const initialValue: OpusCompositionData = {
      id: 'c1',
      name: 'Твір',
      genre: '',
      year: '',
      audios: [
        { id: 'a1', name: 'Запис', fileUrl: 'https://files/rec.mp3' },
        { id: 'a2', name: 'Другий запис', fileUrl: 'https://files/second.mp3' }
      ],
      notes: [{ id: 'n1', name: 'Ноти 1', fileUrl: 'https://files/sheet.pdf', publishDate: '2020' }]
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    fireEvent.change(screen.getByDisplayValue('Ноти 1'), { target: { value: 'Оновлені ноти' } });
    fireEvent.change(screen.getByDisplayValue('2020'), { target: { value: '2022' } });
    expect(screen.getByDisplayValue('Оновлені ноти')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2022')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Видалити файл' }));
    expect(screen.queryByText('sheet.pdf')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Видалити' })[0]);
    expect(screen.queryByText('Запис')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Видалити' })[1]);
    expect(screen.queryByDisplayValue('Оновлені ноти')).not.toBeInTheDocument();
  });

  it('attaches an audio file as a chip via the media modal', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати аудіо' }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
  });

  it('attaches an audio from a gallery selection without an upload result', () => {
    mockMediaResult = {
      selected: { kind: 'gallery', id: 'g1', fileName: 'gallery.mp3', src: 'https://cdn/gallery.mp3', locale: 'uk' },
      crop: null
    };
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати аудіо' }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('gallery.mp3')).toBeInTheDocument();
  });

  it('ignores the media apply when no url can be resolved', () => {
    mockMediaResult = {
      selected: { kind: 'upload', id: 'u1', fileName: 'nourl.mp3', file: new File([], 'nourl.mp3') },
      crop: null
    };
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати аудіо' }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText(/Додайте файли/)).toBeInTheDocument();
    expect(screen.queryByText('nourl.mp3')).not.toBeInTheDocument();
  });

  it('attaches a file to a notes row via the media modal', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати ноти' }));
    fireEvent.click(screen.getByRole('button', { name: 'Завантажити файл' }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
  });

  it('closes media modal on close action without changes', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати аудіо' }));
    expect(screen.getByTestId('media-close')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('media-close'));
    expect(screen.queryByTestId('media-close')).not.toBeInTheDocument();
  });

  it('submits the composition with a trimmed title in edit mode', () => {
    const onSubmit = jest.fn();
    const initialValue: OpusCompositionData = {
      id: 'c1',
      name: 'Початковий твір',
      genre: 'Соната',
      year: '1920',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Назва твору *'), { target: { value: '  Редагований твір  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as OpusCompositionData;
    expect(submitted.name).toBe('Редагований твір');
  });
});
