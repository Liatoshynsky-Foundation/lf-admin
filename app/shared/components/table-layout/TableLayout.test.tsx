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
  PlainRow: ({ plainData, rowWrapper }: { plainData: { title: string }; rowWrapper?: (children: React.ReactNode) => React.ReactNode }) => {
    const content = <div data-testid="plain-row">{plainData.title}</div>;
    return rowWrapper ? rowWrapper(content) : content;
  }
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

  const dataWithUnknown = [
    {
      type: 'unknown',
      id: '3',
      plainData: undefined
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

  it('should use rowWrapper for individual items when provided', () => {
    const rowWrapperMock = jest.fn((id, children) => (
      <div data-testid={`wrapper-${id}`}>{children}</div>
    ));

    render(
      <TableLayout
        data={dataWithIndividual}
        columns={mockColumns}
        rowWrapper={rowWrapperMock}
      />
    );

    expect(rowWrapperMock).toHaveBeenCalledWith('2', expect.anything());
    expect(screen.getByTestId('wrapper-2')).toBeInTheDocument();
    expect(screen.getByTestId('plain-row')).toBeInTheDocument();
  });

  it('should return null for unknown item types', () => {
    render(<TableLayout data={dataWithUnknown as any} columns={mockColumns} />);
    
    expect(screen.queryByTestId('grouped-row')).not.toBeInTheDocument();
    expect(screen.queryByTestId('plain-row')).not.toBeInTheDocument();
  });
});