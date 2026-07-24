import '@testing-library/jest-dom';
import { useSortable } from '@dnd-kit/sortable';
import { fireEvent, render, screen } from '@testing-library/react';

import { WorkRow, WorkRowProps } from './WorkRow';
import { CompositionTitleInputProps } from '~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput';
import { OpusCompositionSuggestion } from '~/types/opus';

jest.mock('@dnd-kit/sortable');

const mockUseSortable = useSortable as jest.Mock;

const mockComposition = {
  id: 'work-1',
  name: 'Test Composition',
  genre: 'Classical',
  year: '2026',
  audios: [],
  notes: []
};

const mockProps: WorkRowProps = {
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

describe('WorkRow', () => {
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
      render(<WorkRow {...mockProps} />);
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Редагувати')).toBeInTheDocument();
      expect(screen.getByLabelText('Видалити')).toBeInTheDocument();
    });

    it('calls updateCompositionTitle on input change', () => {
      render(<WorkRow {...mockProps} />);
      const input = screen.getByTestId('title-input');
      fireEvent.change(input, { target: { value: 'New Title' } });
      expect(mockProps.updateCompositionTitle).toHaveBeenCalledWith('work-1', 'New Title');
    });

    it('calls openEditModal on edit button click', () => {
      render(<WorkRow {...mockProps} />);
      fireEvent.click(screen.getByLabelText('Редагувати'));
      expect(mockProps.openEditModal).toHaveBeenCalledWith(0);
    });

    it('calls setDeleteTargetId on delete button click', () => {
      render(<WorkRow {...mockProps} />);
      fireEvent.click(screen.getByLabelText('Видалити'));
      expect(mockProps.setDeleteTargetId).toHaveBeenCalledWith('work-1');
    });

    it('calls fillComposition when suggestion is selected', () => {
      render(<WorkRow {...mockProps} />);
      fireEvent.click(screen.getByTestId('suggest-btn'));
      expect(mockProps.fillComposition).toHaveBeenCalledWith(0, { id: 'test' });
    });

    it('calls openCreateModal when create button is clicked', () => {
      render(<WorkRow {...mockProps} />);
      fireEvent.click(screen.getByTestId('create-btn'));
      expect(mockProps.openCreateModal).toHaveBeenCalledWith(0);
    });
  });
});
