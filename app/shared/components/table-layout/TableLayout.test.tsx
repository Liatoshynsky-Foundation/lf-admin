import { render, screen } from '@testing-library/react';
import React from 'react';

import { TableLayout } from './TableLayout';

jest.mock('./row-variants/HeaderRow', () => ({
  HeaderRow: ({ gridTemplate }: { gridTemplate: string }) => (
    <div data-testid="header-row" data-grid={gridTemplate}>
      Header
    </div>
  )
}));

jest.mock('./row-variants/GroupedRow', () => ({
  GroupedRow: ({ groupData }: { groupData: { title: string } }) => (
    <div data-testid="grouped-row">{groupData.title}</div>
  )
}));

jest.mock('./row-variants/PlainRow', () => ({
  PlainRow: ({ plainData }: { plainData: { title: string } }) => <div data-testid="plain-row">{plainData.title}</div>
}));

describe('TableLayout Component', () => {
  const mockColumns = [
    { id: 'col1', headerLabel: 'Col 1', width: '100px' },
    { id: 'col2', headerLabel: 'Col 2', width: '1fr' }
  ];

  const dataWithGroup = [
    {
      type: 'group' as const,
      id: '1',
      groupData: { title: 'Group 1' },
      subRows: []
    }
  ];

  const dataWithIndividual = [
    {
      type: 'individual' as const,
      id: '2',
      plainData: { title: 'Individual Item' }
    }
  ];

  it('should correctly build gridTemplate from column widths and pass it to the header', () => {
    render(<TableLayout data={[]} columns={mockColumns} />);

    const header = screen.getByTestId('header-row');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-grid', '100px 1fr');
  });

  it('should render GroupedRow if item type is "group"', () => {
    render(<TableLayout data={dataWithGroup} columns={mockColumns} />);

    expect(screen.getByTestId('grouped-row')).toBeInTheDocument();
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.queryByTestId('plain-row')).not.toBeInTheDocument();
  });

  it('should render PlainRow if item type is "individual"', () => {
    render(<TableLayout data={dataWithIndividual} columns={mockColumns} />);

    expect(screen.getByTestId('plain-row')).toBeInTheDocument();
    expect(screen.getByText('Individual Item')).toBeInTheDocument();
    expect(screen.queryByTestId('grouped-row')).not.toBeInTheDocument();
  });

  it('should render both PlainRow and GroupedRow', () => {
    const combinedData = [...dataWithGroup, ...dataWithIndividual];
    render(<TableLayout data={combinedData} columns={mockColumns} />);

    expect(screen.getByTestId('plain-row')).toBeInTheDocument();
    expect(screen.getByText('Individual Item')).toBeInTheDocument();
    expect(screen.getByTestId('grouped-row')).toBeInTheDocument();
    expect(screen.getByText('Group 1')).toBeInTheDocument();
  });
});
