import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { GroupWorksSection } from './GroupWorksSection';
import { OPUS_DELETE_MODAL, OPUS_DETAILS_LABELS } from '~/constants/opus';
import type { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

jest.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="icon-pencil" />,
  Trash2: () => <span data-testid="icon-trash" />,
  X: () => <span data-testid="icon-x" />
}));

type MockTitleInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: OpusCompositionSuggestion) => void;
  onCreateNew: () => void;
};

jest.mock('~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput', () => ({
  __esModule: true,
  default: ({ value, onChangeText, onSelectSuggestion, onCreateNew }: MockTitleInputProps) => (
    <div data-testid={`composition-title-input-${value}`}>
      <input data-testid={`title-input-${value}`} value={value} onChange={(e) => onChangeText(e.target.value)} />
      <button
        data-testid={`suggest-btn-${value}`}
        onClick={() =>
          onSelectSuggestion({
            id: 'suggestion-1',
            title: { uk: 'Пропозиція УКР' },
            genre: 'Соната',
            year: 1990,
            audios: [{ name: undefined as unknown as string, url: 'https://example.com/audio%20file.mp3?token=123' }],
            sheetMusic: [{ name: undefined as unknown as string, url: '' }]
          })
        }
      >
        Suggest
      </button>
      <button
        data-testid={`suggest-partial-btn-${value}`}
        onClick={() =>
          onSelectSuggestion({
            id: 'suggestion-partial',
            title: { en: 'English Title' },
            genre: undefined,
            year: null as unknown as number,
            audios: [{ name: 'CustomAudio.mp3', url: undefined }],
            sheetMusic: [{ name: 'CustomNote.pdf', url: 'test.com', publishDate: '2023-01-01' }]
          } as OpusCompositionSuggestion)
        }
      >
        Suggest Partial
      </button>
      <button
        data-testid={`suggest-empty-btn-${value}`}
        onClick={() =>
          onSelectSuggestion({
            id: 'suggestion-empty'
          } as unknown as OpusCompositionSuggestion)
        }
      >
        Suggest Empty
      </button>
      <button data-testid={`create-new-btn-${value}`} onClick={onCreateNew}>
        Create New
      </button>
    </div>
  )
}));

type MockCompositionModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: OpusCompositionData;
  onClose: () => void;
  onSubmit: (data: OpusCompositionData) => void;
};

jest.mock('~/shared/components/forms/opus-details-block/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({ open, mode, initialValue, onClose, onSubmit }: MockCompositionModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="composition-modal" data-mode={mode}>
        <button
          data-testid="modal-submit-btn"
          onClick={() => {
            const submitData: OpusCompositionData = initialValue
              ? { ...initialValue, title: 'Оновлена модалкою назва' }
              : { id: 'new-id', title: 'Оновлена модалкою назва', genre: '', year: '', audios: [], notes: [] };

            onSubmit(submitData);
          }}
        >
          Submit
        </button>
        <button data-testid="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/hooks/use-group-content/useGroupContent', () => ({
  createCompositionId: jest.fn(() => 'mocked-id')
}));

const mockOnChange = jest.fn();

const defaultWorks: OpusCompositionData[] = [
  { id: '1', title: 'Симфонія №1', genre: '', year: '', audios: [], notes: [] },
  { id: '2', title: 'Соната', genre: '', year: '', audios: [], notes: [] }
];

describe('GroupWorksSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the list of works successfully', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    expect(screen.getByText(OPUS_DETAILS_LABELS.compositions)).toBeInTheDocument();
    expect(screen.getByText(OPUS_DETAILS_LABELS.addComposition)).toBeInTheDocument();

    expect(screen.getByTestId('composition-title-input-Симфонія №1')).toBeInTheDocument();
    expect(screen.getByTestId('composition-title-input-Соната')).toBeInTheDocument();
    expect(screen.getAllByTestId('icon-pencil')).toHaveLength(2);
    expect(screen.getAllByTestId('icon-trash')).toHaveLength(2);
  });

  it('adds a new empty composition when add button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const addButton = screen.getByText(OPUS_DETAILS_LABELS.addComposition);
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const newWorksArray = mockOnChange.mock.calls[0][0];

    expect(newWorksArray).toHaveLength(3);
    expect(newWorksArray[2].id).toBe('composition-1234567890');
    expect(newWorksArray[2].title).toBe('');
  });

  it('updates composition title directly from input', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const input = screen.getByTestId('title-input-Симфонія №1');
    fireEvent.change(input, { target: { value: 'Нова Симфонія №1' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks[0].title).toBe('Нова Симфонія №1');
  });

  it('fills composition data from suggestion and parses URLs correctly', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const suggestBtn = screen.getByTestId('suggest-btn-Симфонія №1');
    fireEvent.click(suggestBtn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];

    expect(updatedWorks[0].compositionId).toBe('suggestion-1');
    expect(updatedWorks[0].title).toBe('Пропозиція УКР');

    expect(updatedWorks[0].audios[0].name).toBe('audio file.mp3');
    expect(updatedWorks[0].notes[0].name).toBe('');
  });

  it('opens CompositionModal in CREATE mode and closes it', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const createNewBtn = screen.getByTestId('create-new-btn-Симфонія №1');
    fireEvent.click(createNewBtn);

    const modal = screen.getByTestId('composition-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-mode', 'create');

    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(screen.queryByTestId('composition-modal')).not.toBeInTheDocument();
  });

  it('opens CompositionModal in EDIT mode and submits updated data', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const editButtons = screen.getAllByTestId('icon-pencil');
    fireEvent.click(editButtons[1]);

    const modal = screen.getByTestId('composition-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-mode', 'edit');

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];

    expect(updatedWorks[1].title).toBe('Оновлена модалкою назва');
    expect(screen.queryByTestId('composition-modal')).not.toBeInTheDocument();
  });

  it('opens delete dialog and confirms deletion', async () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const deleteButtons = screen.getAllByTestId('icon-trash');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(OPUS_DELETE_MODAL.title)).toBeInTheDocument();
    expect(screen.getByText(OPUS_DELETE_MODAL.description)).toBeInTheDocument();

    const confirmBtn = screen.getByText(OPUS_DELETE_MODAL.confirm);
    fireEvent.click(confirmBtn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];

    expect(updatedWorks).toHaveLength(1);
    expect(updatedWorks[0].id).toBe('2');

    await waitFor(() => {
      expect(screen.queryByText(OPUS_DELETE_MODAL.title)).not.toBeInTheDocument();
    });
  });

  it('opens delete dialog and cancels deletion', async () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const deleteButtons = screen.getAllByTestId('icon-trash');
    fireEvent.click(deleteButtons[0]);

    const cancelBtn = screen.getByText(OPUS_DELETE_MODAL.cancel);
    fireEvent.click(cancelBtn);

    expect(mockOnChange).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(OPUS_DELETE_MODAL.title)).not.toBeInTheDocument();
    });
  });
  it('closes delete dialog when clicking X icon or pressing Escape', async () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const deleteButtons = screen.getAllByTestId('icon-trash');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(OPUS_DELETE_MODAL.title)).toBeInTheDocument();

    const xButton = screen.getByTestId('icon-x');
    fireEvent.click(xButton);

    await waitFor(() => {
      expect(screen.queryByText(OPUS_DELETE_MODAL.title)).not.toBeInTheDocument();
    });

    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(OPUS_DELETE_MODAL.title)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(OPUS_DELETE_MODAL.title)).not.toBeInTheDocument();
    });
  });

  it('fills composition data with partial suggestion', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const suggestPartialBtn = screen.getByTestId('suggest-partial-btn-Симфонія №1');
    fireEvent.click(suggestPartialBtn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];

    expect(updatedWorks[0].title).toBe('English Title');
    expect(updatedWorks[0].genre).toBe('');
    expect(updatedWorks[0].year).toBe('');

    expect(updatedWorks[0].audios[0].name).toBe('CustomAudio.mp3');
    expect(updatedWorks[0].audios[0].fileUrl).toBeUndefined();

    expect(updatedWorks[0].notes[0].name).toBe('CustomNote.pdf');
    expect(updatedWorks[0].notes[0].publishDate).toBe('2023-01-01');
  });

  it('fills composition data with completely empty suggestion', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={mockOnChange} />);

    const suggestEmptyBtn = screen.getByTestId('suggest-empty-btn-Симфонія №1');
    fireEvent.click(suggestEmptyBtn);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];

    expect(updatedWorks[0].title).toBe('');
    expect(updatedWorks[0].audios).toEqual([]);
    expect(updatedWorks[0].notes).toEqual([]);
  });
});
