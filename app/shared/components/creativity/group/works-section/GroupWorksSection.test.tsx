import { DragEndEvent } from '@dnd-kit/core';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { GroupWorksSection } from './GroupWorksSection';
import { WorkRowProps } from './WorkRow';
import { OPUS_DELETE_MODAL, OPUS_DETAILS_LABELS } from '~/constants/opus';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { useCompositionsForm } from '~/shared/hooks/use-compositions/useCompositions';
import type { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

const TEST_IDS = {
  wrapper: (id: string) => `wrapper-${id}`,
  row: (id: string) => `row-${id}`,
  rowIndex: (id: string) => `row-index-${id}`,
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

const mockSuggestion: OpusCompositionSuggestion = {
  id: 'sugg',
  name: 'Suggested title',
  genre: '',
  year: ''
} as unknown as OpusCompositionSuggestion;

const mockUpdatedComposition: OpusCompositionData = {
  id: 'updated',
  name: 'Updated title',
  genre: '',
  year: '',
  audios: [],
  notes: []
};

jest.mock('./WorkRow', () => ({
  WorkRow: ({
    composition,
    index,
    updateCompositionTitle,
    fillComposition,
    openCreateModal,
    openEditModal,
    setDeleteTargetId
  }: WorkRowProps) => (
    <div data-testid={TEST_IDS.row(composition.id)} data-index={TEST_IDS.rowIndex(String(index))}>
      <button
        data-testid={TEST_IDS.titleInput(composition.id)}
        onClick={() => updateCompositionTitle(composition.id, 'New')}
      />
      <button
        data-testid={TEST_IDS.suggestBtn(composition.id)}
        onClick={() => fillComposition(index, mockSuggestion)}
      />
      <button data-testid={TEST_IDS.createBtn(composition.id)} onClick={() => openCreateModal(index)} />
      <button data-testid={TEST_IDS.editBtn(composition.id)} onClick={() => openEditModal(index)} />
      <button data-testid={TEST_IDS.deleteBtn(composition.id)} onClick={() => setDeleteTargetId(composition.id)} />
    </div>
  )
}));

jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ id, gripHandle, children }: { id: string; gripHandle: boolean; children: ReactNode }) => (
    <div data-testid={TEST_IDS.wrapper(id)} data-grip-handle={String(gripHandle)}>
      {children}
    </div>
  )
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({
    children,
    onDragEnd,
    items
  }: {
    children: ReactNode;
    onDragEnd: (event: DragEndEvent) => void;
    items: string[];
  }) => (
    <div data-testid={TEST_IDS.sortableList} data-items={items.join(',')} onClick={() => onDragEnd({} as DragEndEvent)}>
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
        <button data-testid={TEST_IDS.modalSubmit} onClick={() => onSubmit(mockUpdatedComposition)}>
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
  { id: '1', name: 'Симфонія №1', genre: '', year: '', audios: [], notes: [] },
  { id: '2', name: 'Соната', genre: '', year: '', audios: [], notes: [] }
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

  it('renders the section title and add button', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.getByText(OPUS_DETAILS_LABELS.compositions)).toBeInTheDocument();
    expect(screen.getByText(OPUS_DETAILS_LABELS.addComposition)).toBeInTheDocument();
  });

  it('calls addComposition when the add button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByText(OPUS_DETAILS_LABELS.addComposition));
    expect(mockHookReturns.addComposition).toHaveBeenCalledTimes(1);
  });

  it('renders the list of works wrapped in SortableItemWrapper with correct props', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    const wrapperOne = screen.getByTestId(TEST_IDS.wrapper('1'));
    const wrapperTwo = screen.getByTestId(TEST_IDS.wrapper('2'));

    expect(wrapperOne).toBeInTheDocument();
    expect(wrapperOne).toHaveAttribute('data-grip-handle', 'true');
    expect(wrapperTwo).toBeInTheDocument();
    expect(wrapperTwo).toHaveAttribute('data-grip-handle', 'true');

    expect(screen.getByTestId(TEST_IDS.row('1'))).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.row('2'))).toBeInTheDocument();
  });

  it('passes the correct ids to SortableList', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.getByTestId(TEST_IDS.sortableList)).toHaveAttribute('data-items', '1,2');
  });

  it('calls openEditModal with correct index when edit button is clicked in row', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.editBtn('1')));
    expect(mockHookReturns.openEditModal).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByTestId(TEST_IDS.editBtn('2')));
    expect(mockHookReturns.openEditModal).toHaveBeenCalledWith(1);
  });

  it('calls setDeleteTargetId with correct id when trash button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.deleteBtn('1')));
    expect(mockHookReturns.setDeleteTargetId).toHaveBeenCalledWith('1');
  });

  it('calls updateCompositionTitle with correct id when title input changes', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.titleInput('2')));
    expect(mockHookReturns.updateCompositionTitle).toHaveBeenCalledWith('2', 'New');
  });

  it('calls fillComposition with correct index and suggestion when suggestion is selected', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.suggestBtn('1')));
    expect(mockHookReturns.fillComposition).toHaveBeenCalledWith(0, mockSuggestion);
  });

  it('calls openCreateModal with correct index when create new button is clicked', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.createBtn('2')));
    expect(mockHookReturns.openCreateModal).toHaveBeenCalledWith(1);
  });

  it('renders modal when isModalOpen is true and calls submit/close', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, isModalOpen: true, modalMode: 'edit' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByTestId(TEST_IDS.modal)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.modalSubmit));
    expect(mockHookReturns.handleModalSubmit).toHaveBeenCalledWith(mockUpdatedComposition);
    fireEvent.click(screen.getByTestId(TEST_IDS.modalClose));
    expect(mockHookReturns.closeModal).toHaveBeenCalledTimes(1);
  });

  it('does not render modal when isModalOpen is false', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.queryByTestId(TEST_IDS.modal)).not.toBeInTheDocument();
  });

  it('passes initialValue to modal when editingIndex is not null (Edit mode)', () => {
    mockUseCompositions.mockReturnValue({
      ...mockHookReturns,
      isModalOpen: true,
      modalMode: 'edit',
      editingIndex: 1
    });

    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    const modal = screen.getByTestId(TEST_IDS.modal);
    expect(modal).toHaveAttribute('data-has-initial', 'true');
    expect(modal).toHaveAttribute('data-mode', 'edit');
  });

  it('passes undefined as initialValue to modal when editingIndex is null (Create mode)', () => {
    mockUseCompositions.mockReturnValue({
      ...mockHookReturns,
      isModalOpen: true,
      modalMode: 'create',
      editingIndex: null
    });

    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    const modal = screen.getByTestId(TEST_IDS.modal);
    expect(modal).toHaveAttribute('data-has-initial', 'false');
    expect(modal).toHaveAttribute('data-mode', 'create');
  });

  it('renders delete modal when deleteTargetId is set and calls confirm', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, deleteTargetId: '1' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    expect(screen.getByTestId(TEST_IDS.deleteModal)).toBeInTheDocument();
    fireEvent.click(screen.getByText(OPUS_DELETE_MODAL.confirm));
    expect(mockHookReturns.handleDeleteConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not render delete modal when deleteTargetId is null', () => {
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);
    expect(screen.queryByTestId(TEST_IDS.deleteModal)).not.toBeInTheDocument();
  });

  it('marks compositions reported as duplicate by the backend', () => {
    render(
      <GroupWorksSection
        works={defaultWorks}
        onChange={jest.fn()}
        duplicateCompositionNames={[`  ${defaultWorks[0].name}  `]}
      />
    );

    expect(screen.getByTestId(TEST_IDS.row('1'))).toBeInTheDocument();
  });

  it('resets deleteTargetId to null when delete modal is closed', () => {
    mockUseCompositions.mockReturnValue({ ...mockHookReturns, deleteTargetId: '1' });
    render(<GroupWorksSection works={defaultWorks} onChange={jest.fn()} />);

    fireEvent.click(screen.getByText(OPUS_DELETE_MODAL.cancel));
    expect(mockHookReturns.setDeleteTargetId).toHaveBeenCalledWith(null);
  });

  it('calls handleSortableDragEnd with works and onChange when DragEnd event is triggered', () => {
    const onChange = jest.fn();
    render(<GroupWorksSection works={defaultWorks} onChange={onChange} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.sortableList));
    expect(handleSortableDragEnd).toHaveBeenCalledWith(expect.any(Object), defaultWorks, onChange);
  });

  it('renders correctly with an empty works list', () => {
    render(<GroupWorksSection works={[]} onChange={jest.fn()} />);
    expect(screen.getByText(OPUS_DETAILS_LABELS.compositions)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.wrapper('1'))).not.toBeInTheDocument();
  });
});
