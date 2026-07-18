import { DragEndEvent } from '@dnd-kit/core';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { GroupWorksSection } from './GroupWorksSection';
import { SortableWorkRowProps } from './SortableWorkRow';
import { OPUS_DELETE_MODAL, OPUS_DETAILS_LABELS } from '~/constants/opus';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { useCompositionsForm } from '~/shared/hooks/use-compositions/useCompositions';
import type { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

const TEST_IDS = {
  row: (id: string) => `row-${id}`,
  titleInput: (id: string) => `title-input-${id}`,
  suggestBtn: (id: string) => `suggest-btn-${id}`,
  createBtn: (id: string) => `create-btn-${id}`,
  editBtn: (id: string) => `edit-btn-${id}`,
  deleteBtn: (id: string) => `delete-btn-${id}`,
  modal: 'composition-modal',
  modalSubmit: 'modal-submit-btn',
  modalClose: 'modal-close-btn',
  deleteModal: 'delete-modal',
  sortableList: 'sortable-list'
};

jest.mock('./SortableWorkRow', () => ({
  SortableWorkRow: ({
    composition,
    updateCompositionTitle,
    fillComposition,
    openCreateModal,
    openEditModal,
    setDeleteTargetId
  }: SortableWorkRowProps) => (
    <div data-testid={TEST_IDS.row(composition.id)}>
      <button
        data-testid={TEST_IDS.titleInput(composition.id)}
        onClick={() => updateCompositionTitle(composition.id, 'New')}
      />
      <button
        data-testid={TEST_IDS.suggestBtn(composition.id)}
        onClick={() => fillComposition(0, { id: 'sugg' } as OpusCompositionSuggestion)}
      />
      <button data-testid={TEST_IDS.createBtn(composition.id)} onClick={() => openCreateModal(0)} />
      <button data-testid={TEST_IDS.editBtn(composition.id)} onClick={() => openEditModal(0)} />
      <button data-testid={TEST_IDS.deleteBtn(composition.id)} onClick={() => setDeleteTargetId(composition.id)} />
    </div>
  )
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: (event: DragEndEvent) => void }) => (
    <div data-testid={TEST_IDS.sortableList} onClick={() => onDragEnd({} as DragEndEvent)}>
      {children}
    </div>
  )
}));

jest.mock('~/shared/hooks/use-compositions/useCompositions');
const mockUseCompositions = useCompositionsForm as jest.MockedFunction<typeof useCompositionsForm>;

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

jest.mock('~/shared/components/forms/opus-details-block/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({ open, mode, initialValue, onClose, onSubmit }: MockCompositionModalProps) => {
    if (!open) return null;
    return (
      <div data-testid={TEST_IDS.modal} data-mode={mode} data-has-initial={Boolean(initialValue)}>
        <button data-testid={TEST_IDS.modalSubmit} onClick={() => onSubmit({ id: 'updated' } as OpusCompositionData)}>
          Submit
        </button>
        <button data-testid={TEST_IDS.modalClose} onClick={onClose}>
          Close
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  DeleteCompositionModal: ({ open, onClose, onConfirm }: MockDeleteCompositionModalProps) =>
    open ? (
      <div data-testid={TEST_IDS.deleteModal}>
        <button onClick={onConfirm}>{OPUS_DELETE_MODAL.confirm}</button>
        <button onClick={onClose}>{OPUS_DELETE_MODAL.cancel}</button>
      </div>
    ) : null
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
    expect(screen.getByTestId(TEST_IDS.row('1'))).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.row('2'))).toBeInTheDocument();
  });

  it('calls openEditModal when edit button is clicked in row', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.editBtn('1')));
    expect(mockHookReturns.openEditModal).toHaveBeenCalledWith(0);
  });

  it('calls setDeleteTargetId when trash button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.deleteBtn('1')));
    expect(mockHookReturns.setDeleteTargetId).toHaveBeenCalledWith('1');
  });

  it('calls fillComposition when suggestion is selected', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.suggestBtn('1')));
    expect(mockHookReturns.fillComposition).toHaveBeenCalledWith(0, { id: 'sugg' });
  });

  it('renders modal when isModalOpen is true and calls submit/close', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, isModalOpen: true, modalMode: 'edit' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByTestId(TEST_IDS.modal)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.modalSubmit));
    expect(mockHookReturns.handleModalSubmit).toHaveBeenCalledWith({ id: 'updated' });
    fireEvent.click(screen.getByTestId(TEST_IDS.modalClose));
    expect(mockHookReturns.closeModal).toHaveBeenCalled();
  });

  it('renders delete modal when deleteTargetId is set and calls confirm/close', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, deleteTargetId: '1' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByTestId(TEST_IDS.deleteModal)).toBeInTheDocument();
    fireEvent.click(screen.getByText(OPUS_DELETE_MODAL.confirm));
    expect(mockHookReturns.handleDeleteConfirm).toHaveBeenCalled();
  });

  it('calls openCreateModal when create new button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.createBtn('1')));
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
    expect(screen.getByTestId(TEST_IDS.modal)).toHaveAttribute('data-has-initial', 'true');
  });

  it('passes undefined as initialValue to modal when editingIndex is null (Create mode)', () => {
    mockUseCompositions.mockReturnValue({
      ...mockHookReturns,
      isModalOpen: true,
      modalMode: 'create',
      editingIndex: null
    });

    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.getByTestId(TEST_IDS.modal)).toHaveAttribute('data-has-initial', 'false');
  });

  it('resets deleteTargetId to null when delete modal is closed', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, deleteTargetId: '1' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getByText(OPUS_DELETE_MODAL.cancel));
    expect(mockHookReturns.setDeleteTargetId).toHaveBeenCalledWith(null);
  });

  it('calls handleSortableDragEnd when DragEnd event is triggered', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.sortableList));
    expect(handleSortableDragEnd).toHaveBeenCalledWith(expect.any(Object), defaultWorks, expect.any(Function));
  });
});
