import { render, screen } from '@testing-library/react';
import React from 'react';

import { PointsList, PointsListProps } from './PointsList';
import { ListPoint } from '~/shared/hooks/use-points-list/usePointsList';


jest.mock('~/shared/components/configurable-list/ConfigurableList');

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
