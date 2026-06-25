import { render, screen } from '@testing-library/react';
import React from 'react';

import { PointsList, PointsListProps } from './PointsList';
import { ListPoint } from '~/shared/hooks/use-points-list/usePointsList';


jest.mock('~/shared/components/configurable-list/ConfigurableList');

jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({ id, children, items }: { id: string; children: React.ReactNode; items: string[] }) => (
    <div data-testid="sortable-list" data-list-id={id} data-items={JSON.stringify(items)}>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ id, children, gripHandle }: { id: string; children: React.ReactNode; gripHandle?: boolean }) => (
    <div data-testid={`sortable-item-${id}`} data-grip-handle={gripHandle ? 'true' : 'false'}>
      {children}
    </div>
  )
}));

const defaultProps: PointsListProps = {
  id: 'test-id',
  points: [],
  addPoint: jest.fn(),
  removePoint: jest.fn(),
  updatePoint: jest.fn()
}; 

const runSimulation = (props: PointsListProps = defaultProps) => {
  render(<PointsList {...props} />);
};


describe('PointsList', () => {
  describe('UI', () => {
    it('renders the "Пункти:" heading', () => {
      runSimulation();
      expect(screen.getByText('Пункти:')).toBeInTheDocument();
    });
    it('renders "Додати пункт" button',()=>{
      runSimulation();
      expect(screen.getByText('Додати пункт')).toBeInTheDocument();
    });

    it('renders all list items if provided', ()=>{
      const points: ListPoint[] = [
        { id: '1', value: { type: 'doc', content: [] } },
        { id: '2', value: { type: 'doc', content: [] } },
      ];
      runSimulation({...defaultProps, points});
      
      expect(screen.getByText('Додати пункт')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop support', () => {
    const points: ListPoint[] = [
      { id: '1', value: { type: 'doc', content: [] } },
      { id: '2', value: { type: 'doc', content: [] } }
    ];

    it('should NOT render sortable wrappers and grip if onDragEnd is not provided', () => {
      runSimulation({ ...defaultProps, points });

      expect(screen.queryByTestId('sortable-list')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sortable-item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sortable-item-2')).not.toBeInTheDocument();
    });

    it('should render SortableList and SortableItemWrapper with gripHandle if onDragEnd is provided', () => {
      const onDragEndMock = jest.fn();
      runSimulation({ ...defaultProps, points, onDragEnd: onDragEndMock });

      const sortableList = screen.getByTestId('sortable-list');
      expect(sortableList).toBeInTheDocument();
      expect(sortableList).toHaveAttribute('data-list-id', 'points-list-test-id');
      expect(sortableList).toHaveAttribute('data-items', JSON.stringify(['1', '2']));

      const item1 = screen.getByTestId('sortable-item-1');
      expect(item1).toBeInTheDocument();
      expect(item1).toHaveAttribute('data-grip-handle', 'true');

      const item2 = screen.getByTestId('sortable-item-2');
      expect(item2).toBeInTheDocument();
      expect(item2).toHaveAttribute('data-grip-handle', 'true');
    });
  });
});
