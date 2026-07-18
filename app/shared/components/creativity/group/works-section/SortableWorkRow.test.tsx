import '@testing-library/jest-dom';
import { useSortable } from '@dnd-kit/sortable';
import { fireEvent, render, screen } from '@testing-library/react';

import { SortableWorkRow, SortableWorkRowProps } from './SortableWorkRow';
import { CompositionTitleInputProps } from '~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput';
import { OpusCompositionSuggestion } from '~/types/opus';

jest.mock('@dnd-kit/sortable');

const mockUseSortable = useSortable as jest.Mock;

const mockComposition = {
  id: 'work-1',
  title: 'Test Composition',
  genre: 'Classical',
  year: '2026',
  audios: [],
  notes: []
};

const mockProps: SortableWorkRowProps = {
  composition: mockComposition,
  index: 0,
  updateCompositionTitle: jest.fn(),
  fillComposition: jest.fn(),
  openCreateModal: jest.fn(),
  openEditModal: jest.fn(),
  setDeleteTargetId: jest.fn()
};

jest.mock('~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput', () => ({
  __esModule: true,
  default: ({ onChangeText, onSelectSuggestion, onCreateNew }: CompositionTitleInputProps) => (
    <div>
      <input data-testid="title-input" onChange={(e) => onChangeText(e.target.value)} />
      <button
        data-testid="suggest-btn"
        onClick={() => onSelectSuggestion({ id: 'test' } as OpusCompositionSuggestion)}
      />
      <button data-testid="create-btn" onClick={onCreateNew} />
    </div>
  )
}));

describe('SortableWorkRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: false
    });
  });

  describe('Rendering and Interaction', () => {
    it('renders correctly', () => {
      render(<SortableWorkRow {...mockProps} />);
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Редагувати')).toBeInTheDocument();
      expect(screen.getByLabelText('Видалити')).toBeInTheDocument();
    });

    it('calls updateCompositionTitle on input change', () => {
      render(<SortableWorkRow {...mockProps} />);
      const input = screen.getByTestId('title-input');
      fireEvent.change(input, { target: { value: 'New Title' } });
      expect(mockProps.updateCompositionTitle).toHaveBeenCalledWith('work-1', 'New Title');
    });

    it('calls openEditModal on edit button click', () => {
      render(<SortableWorkRow {...mockProps} />);
      fireEvent.click(screen.getByLabelText('Редагувати'));
      expect(mockProps.openEditModal).toHaveBeenCalledWith(0);
    });

    it('calls setDeleteTargetId on delete button click', () => {
      render(<SortableWorkRow {...mockProps} />);
      fireEvent.click(screen.getByLabelText('Видалити'));
      expect(mockProps.setDeleteTargetId).toHaveBeenCalledWith('work-1');
    });

    it('calls fillComposition when suggestion is selected', () => {
      render(<SortableWorkRow {...mockProps} />);
      fireEvent.click(screen.getByTestId('suggest-btn'));
      expect(mockProps.fillComposition).toHaveBeenCalledWith(0, { id: 'test' });
    });

    it('calls openCreateModal when create button is clicked', () => {
      render(<SortableWorkRow {...mockProps} />);
      fireEvent.click(screen.getByTestId('create-btn'));
      expect(mockProps.openCreateModal).toHaveBeenCalledWith(0);
    });
  });

  describe('Dragging State', () => {
    it('has opacity 1 when not dragging', () => {
      const { container } = render(<SortableWorkRow {...mockProps} />);
      expect(container.firstChild).toHaveStyle('opacity: 1');
    });

    it('has opacity 0.5 when isDragging is true', () => {
      mockUseSortable.mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: true
      });

      const { container } = render(<SortableWorkRow {...mockProps} />);
      expect(container.firstChild).toHaveStyle('opacity: 0.5');
    });
  });
});
