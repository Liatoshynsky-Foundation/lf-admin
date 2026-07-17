import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { GroupWorksSection } from './GroupWorksSection';
import { OPUS_DELETE_MODAL, OPUS_DETAILS_LABELS } from '~/constants/opus';
import { useCompositionsForm } from '~/shared/hooks/use-compositions/useCompositions';
import type { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

jest.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="icon-pencil" />,
  Trash2: () => <span data-testid="icon-trash" />
}));

jest.mock('~/shared/hooks/use-compositions/useCompositions');
const mockUseCompositions = useCompositionsForm as jest.MockedFunction<typeof useCompositionsForm>;

interface MockTitleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: OpusCompositionSuggestion) => void;
  onCreateNew: () => void;
}

interface MockCompositionModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: OpusCompositionData;
  onClose: () => void;
  onSubmit: (data: OpusCompositionData) => void;
}

interface MockDeleteCompositionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

jest.mock('~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput', () => ({
  __esModule: true,
  default: ({ value, onChangeText, onSelectSuggestion, onCreateNew }: MockTitleInputProps) => (
    <div data-testid={`composition-title-input-${value}`}>
      <input data-testid={`title-input-${value}`} value={value} onChange={(e) => onChangeText(e.target.value)} />
      <button
        data-testid={`suggest-btn-${value}`}
        onClick={() => onSelectSuggestion({ id: 'sugg-1' } as OpusCompositionSuggestion)}
      >
        Suggest
      </button>
      <button data-testid={`create-new-btn-${value}`} onClick={onCreateNew}>
        Create
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/forms/opus-details-block/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({ open, mode, initialValue, onClose, onSubmit }: MockCompositionModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="composition-modal" data-mode={mode} data-has-initial={Boolean(initialValue)}>
        <button data-testid="modal-submit-btn" onClick={() => onSubmit({ id: 'updated' } as OpusCompositionData)}>
          Submit
        </button>
        <button data-testid="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  DeleteCompositionModal: ({ open, onClose, onConfirm }: MockDeleteCompositionModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="delete-modal">
        <span>{OPUS_DELETE_MODAL.title}</span>
        <button onClick={onConfirm}>{OPUS_DELETE_MODAL.confirm}</button>
        <button onClick={onClose}>{OPUS_DELETE_MODAL.cancel}</button>
      </div>
    );
  }
}));

const defaultWorks: OpusCompositionData[] = [
  { id: '1', title: 'Симфонія №1', genre: '', year: '', audios: [], notes: [] },
  { id: '2', title: 'Соната', genre: '', year: '', audios: [], notes: [] }
];

describe('GroupWorksSection Component', () => {
  const mockHookReturns = {
    isModalOpen: false,
    modalMode: 'create' as const,
    editingIndex: null as number | null,
    deleteTargetId: null as string | null,
    setDeleteTargetId: jest.fn(),
    addComposition: jest.fn(),
    openCreateModal: jest.fn(),
    openEditModal: jest.fn(),
    closeModal: jest.fn(),
    updateCompositionTitle: jest.fn(),
    fillComposition: jest.fn(),
    handleModalSubmit: jest.fn(),
    handleDeleteConfirm: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCompositions.mockReturnValue(mockHookReturns);
  });

  it('renders the list of works successfully', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByText(OPUS_DETAILS_LABELS.compositions)).toBeInTheDocument();
    expect(screen.getByTestId('composition-title-input-Симфонія №1')).toBeInTheDocument();
    expect(screen.getAllByTestId('icon-pencil')).toHaveLength(2);
  });

  it('calls addComposition when add button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getByText(OPUS_DETAILS_LABELS.addComposition));
    expect(mockHookReturns.addComposition).toHaveBeenCalledTimes(1);
  });

  it('calls updateCompositionTitle when typing in input', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.change(screen.getByTestId('title-input-Симфонія №1'), { target: { value: 'Нова назва' } });
    expect(mockHookReturns.updateCompositionTitle).toHaveBeenCalledWith('1', 'Нова назва');
  });

  it('calls fillComposition when suggestion is selected', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getByTestId('suggest-btn-Симфонія №1'));
    expect(mockHookReturns.fillComposition).toHaveBeenCalledWith(0, { id: 'sugg-1' });
  });

  it('calls openEditModal when pencil icon is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getAllByTestId('icon-pencil')[1]);
    expect(mockHookReturns.openEditModal).toHaveBeenCalledWith(1);
  });

  it('calls setDeleteTargetId when trash icon is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getAllByTestId('icon-trash')[0]);
    expect(mockHookReturns.setDeleteTargetId).toHaveBeenCalledWith('1');
  });

  it('renders modal when isModalOpen is true and calls submit/close', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, isModalOpen: true, modalMode: 'edit' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByTestId('composition-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-submit-btn'));
    expect(mockHookReturns.handleModalSubmit).toHaveBeenCalledWith({ id: 'updated' });

    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(mockHookReturns.closeModal).toHaveBeenCalled();
  });

  it('renders delete modal when deleteTargetId is set and calls confirm/close', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, deleteTargetId: '1' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText(OPUS_DELETE_MODAL.confirm));
    expect(mockHookReturns.handleDeleteConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByText(OPUS_DELETE_MODAL.cancel));
    expect(mockHookReturns.setDeleteTargetId).toHaveBeenCalledWith(null);
  });

  it('calls openCreateModal when create new button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getByTestId('create-new-btn-Симфонія №1'));
    expect(mockHookReturns.openCreateModal).toHaveBeenCalledWith(0);
  });

  it('passes initialValue to modal when editingIndex is not null (Edit mode)', () => {
    mockUseCompositions.mockReturnValue({
      ...mockHookReturns,
      isModalOpen: true,
      modalMode: 'edit',
      editingIndex: 1
    });

    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.getByTestId('composition-modal')).toHaveAttribute('data-has-initial', 'true');
  });

  it('passes undefined as initialValue to modal when editingIndex is null (Create mode)', () => {
    mockUseCompositions.mockReturnValue({
      ...mockHookReturns,
      isModalOpen: true,
      modalMode: 'create',
      editingIndex: null
    });

    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.getByTestId('composition-modal')).toHaveAttribute('data-has-initial', 'false');
  });
});
