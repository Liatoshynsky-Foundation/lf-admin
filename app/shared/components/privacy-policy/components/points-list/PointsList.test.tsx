import { fireEvent,render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { PointsList, PointsListProps } from './PointsList';
import { ListPoint } from '~/shared/hooks/use-points-list/usePointsList';

interface MockConfigurableListProps<T> {
  items: T[];
  renderItem: (args: { item: T; onChange: (value: T) => void }) => React.ReactNode;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onChange: (value: T) => void;
}

jest.mock('~/shared/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: <T extends { id: string }>({
    items,
    renderItem,
    onCreate,
    onDelete,
    onChange
  }: MockConfigurableListProps<T>) => (
    <div>
      {items.map((item) => (
        <div key={item.id} data-testid={`list-item-${item.id}`}>
          {renderItem({ item, onChange })}
          <button data-testid={`delete-btn-${item.id}`} onClick={() => onDelete(item.id)}>
            Видалити
          </button>
        </div>
      ))}
      <button onClick={onCreate}>Додати пункт</button>
    </div>
  )
}));

interface MockTextFieldProps {
  label: string;
  value: JSONContent;
  onChange: (value: JSONContent) => void;
}

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange }: MockTextFieldProps) => (
    <div>
      <label>{label}</label>
      <input
        data-testid="mock-text-field"
        value={JSON.stringify(value)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value) as JSONContent);
          } catch {
            onChange({ type: 'doc', content: [] });
          }
        }}
      />
    </div>
  )
}));

jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({ id, children, items }: { id: string; children: React.ReactNode; items: string[] }) => (
    <div data-testid="sortable-list" data-list-id={id} data-items={JSON.stringify(items)}>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({
    id,
    children,
    gripHandle
  }: {
    id: string;
    children: React.ReactNode;
    gripHandle?: boolean;
  }) => (
    <div data-testid={`sortable-item-${id}`} data-grip-handle={gripHandle ? 'true' : 'false'}>
      {children}
    </div>
  )
}));

const mockPoints: ListPoint[] = [
  { id: '1', value: { type: 'doc', content: [{ type: 'text', text: 'Point 1' }] } },
  { id: '2', value: { type: 'doc', content: [{ type: 'text', text: 'Point 2' }] } }
];

const defaultProps: PointsListProps = {
  id: 'test-id',
  points: [],
  addPoint: jest.fn(),
  removePoint: jest.fn(),
  updatePoint: jest.fn()
};

describe('PointsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI & Actions', () => {
    it('renders the heading and add button', () => {
      render(<PointsList {...defaultProps} />);
      expect(screen.getByText('Пункти:')).toBeInTheDocument();
      expect(screen.getByText('Додати пункт')).toBeInTheDocument();
    });

    it('calls addPoint when add button is clicked', () => {
      render(<PointsList {...defaultProps} />);
      fireEvent.click(screen.getByText('Додати пункт'));
      expect(defaultProps.addPoint).toHaveBeenCalledTimes(1);
    });

    it('calls removePoint when delete button is clicked', () => {
      render(<PointsList {...defaultProps} points={mockPoints} />);
      fireEvent.click(screen.getByTestId('delete-btn-1'));
      expect(defaultProps.removePoint).toHaveBeenCalledWith('1');
    });

    it('calls updatePoint with merged item when CustomTextField triggers onChange (Line 26 coverage)', () => {
      render(<PointsList {...defaultProps} points={[mockPoints[0]]} />);
      const input = screen.getByTestId('mock-text-field');
      const newValue: JSONContent = { type: 'doc', content: [{ type: 'text', text: 'Updated' }] };

      fireEvent.change(input, { target: { value: JSON.stringify(newValue) } });

      expect(defaultProps.updatePoint).toHaveBeenCalledWith({
        ...mockPoints[0],
        value: newValue
      });
    });
  });

  describe('Drag and Drop support', () => {
    it('should NOT render sortable wrappers if onDragEnd is not provided', () => {
      render(<PointsList {...defaultProps} points={mockPoints} />);
      expect(screen.queryByTestId('sortable-list')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sortable-item-1')).not.toBeInTheDocument();
    });

    it('should render SortableList and SortableItemWrapper if onDragEnd is provided', () => {
      const onDragEndMock = jest.fn();
      render(<PointsList {...defaultProps} points={mockPoints} onDragEnd={onDragEndMock} />);

      expect(screen.getByTestId('sortable-list')).toBeInTheDocument();
      const item1 = screen.getByTestId('sortable-item-1');
      expect(item1).toBeInTheDocument();
      expect(item1).toHaveAttribute('data-grip-handle', 'true');
      expect(screen.getAllByText('Текст пункту')).toHaveLength(2);
    });

    it('should return plain field in renderItem if onDragEnd is missing', () => {
      render(<PointsList {...defaultProps} points={[mockPoints[0]]} />);
      expect(screen.getAllByTestId('mock-text-field')).toHaveLength(1);
      expect(screen.queryByTestId('sortable-item-1')).not.toBeInTheDocument();
    });
  });
});
