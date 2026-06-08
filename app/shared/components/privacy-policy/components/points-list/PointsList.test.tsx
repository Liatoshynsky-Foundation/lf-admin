import { render, screen } from '@testing-library/react';
import React from 'react';

import { PointsList, PointsListProps } from './PointsList';
import { ListPoint } from '~/shared/hooks/use-points-list/usePointsList';


interface MockConfigurableListProps<T> {
  readonly items: readonly T[];
  readonly addBtnLabel: string;
  readonly onCreate: () => void;
  readonly renderItem: (props: { readonly item: T }) => React.ReactNode;
  readonly editable: boolean;
  readonly onDelete: (id: string) => void;
}


jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: <T extends { readonly id: string }>({
    items,
    addBtnLabel,
    onCreate,
    renderItem,
    editable,
    onDelete
  }: MockConfigurableListProps<T>) => (
    <div data-testid="configurable-list">
      {items.map((item) => (
        <div key={item.id} data-testid={`list-item-${item.id}`}>
          {renderItem({ item })}
          {editable && (
            <button data-testid={`delete-${item.id}`} onClick={() => onDelete(item.id)}>
              Delete
            </button>
          )}
        </div>
      ))}
      {editable && (
        <button data-testid="add-btn" onClick={onCreate}>
          {addBtnLabel}
        </button>
      )}
    </div>
  )
}));

const defaultProps: PointsListProps = {
  points: [],
  addPoint:jest.fn(),
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
});
