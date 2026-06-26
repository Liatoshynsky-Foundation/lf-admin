import { fireEvent, render, screen } from '@testing-library/react';

import CompositionModal from './CompositionModal';
import type { OpusCompositionData } from '~/types/opus';

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({ open, onApply }: { open: boolean; onApply: (result: unknown) => void }) =>
    open ? (
      <button
        type="button"
        data-testid="media-apply"
        onClick={() =>
          onApply({
            selected: { kind: 'upload', id: 'u1', fileName: 'audio.mp3' },
            crop: null,
            uploadResult: {
              url: 'https://files/audio.mp3',
              filename: 'audio.mp3',
              originalName: 'audio.mp3',
              mimeType: 'audio/mpeg',
              size: 100
            }
          })
        }
      >
        apply
      </button>
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
  });

  it('renders the create heading and empty title', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    expect(screen.getByText('Нова композиція')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва твору *')).toHaveValue('');
  });

  it('renders the edit heading and prefilled title', () => {
    const initialValue: OpusCompositionData = {
      id: 'c1',
      title: 'Існуючий твір',
      genre: 'Соната',
      year: '1920',
      audios: [],
      notes: []
    };
    render(<CompositionModal {...baseProps} mode="edit" initialValue={initialValue} />);

    expect(screen.getByText('Редагування композиції')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва твору *')).toHaveValue('Існуючий твір');
  });

  it('blocks submit and shows an error when the title is empty', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Створити/ }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Обовʼязкове поле')).toBeInTheDocument();
  });

  it('shows the empty-files notice when no files are attached', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    expect(screen.getByText(/Додайте файли для відкритого доступу/)).toBeInTheDocument();
  });

  it('adds a notes row with name and date fields', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати ноти' }));

    expect(screen.getByLabelText('Назва нот *')).toBeInTheDocument();
    expect(screen.getByLabelText('Дата видання *')).toBeInTheDocument();
  });

  it('attaches an audio file as a chip via the media modal', () => {
    render(<CompositionModal {...baseProps} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати аудіо' }));
    fireEvent.click(screen.getByTestId('media-apply'));

    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
  });

  it('submits the composition with a trimmed title', () => {
    const onSubmit = jest.fn();
    render(<CompositionModal {...baseProps} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Назва твору *'), { target: { value: '  Новий твір  ' } });
    fireEvent.click(screen.getByRole('button', { name: /Створити/ }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as OpusCompositionData;
    expect(submitted.title).toBe('Новий твір');
  });
});
