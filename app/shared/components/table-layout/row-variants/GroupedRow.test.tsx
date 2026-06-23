import { render, screen } from '@testing-library/react';
import React from 'react';

import { GroupedRow } from './GroupedRow';
import { ColumnDef } from './Row.types';

type MockGroup = { title: string };
type MockSub = { name: string };

describe('GroupedRow', () => {
  const mockGroupData: MockGroup = { title: 'Group 1' };
  const mockSubRows: MockSub[] = [{ name: 'Subgroup 1' }, { name: 'Subgroup 2' }];
  const mockGridTemplate = '1fr 2fr';

  it('should render group header with string and component content', () => {
    const dataId = 'custom-group-node';
    const columns: ColumnDef<MockGroup, MockSub, any>[] = [
      {
        id: 'title',
        renderGroup: (g) => g.title,
        align: 'left'
      },
      {
        id: 'custom',
        renderGroup: () => <span data-testid={dataId}>React Node</span>
      }
    ];

    render(
      <GroupedRow groupData={mockGroupData} subRows={mockSubRows} columns={columns} gridTemplate={mockGridTemplate} />
    );

    expect(screen.getByText(mockGroupData.title)).toBeInTheDocument();
    expect(screen.getByTestId(dataId)).toBeInTheDocument();
  });

  it('should render sub-rows with correct values inside expanded details', () => {
    const columns: ColumnDef<MockGroup, MockSub, any>[] = [
      {
        id: 'title',
        renderSub: (s) => s.name,
        align: 'center'
      }
    ];

    render(
      <GroupedRow
        groupData={mockGroupData}
        subRows={mockSubRows}
        columns={columns}
        gridTemplate={mockGridTemplate}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText(mockSubRows[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockSubRows[1].name)).toBeInTheDocument();
  });

  it('should handle missing sub-row content gracefully', () => {
    const columns: ColumnDef<MockGroup, MockSub, any>[] = [
      {
        id: 'empty-col',
        renderSub: () => null
      }
    ];

    const { container } = render(
      <GroupedRow
        groupData={mockGroupData}
        subRows={[{ name: 'Sub' }]}
        columns={columns}
        gridTemplate={mockGridTemplate}
        defaultExpanded={true}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should not render AccordionDetails if subRows array is empty', () => {
    const columns: ColumnDef<MockGroup, MockSub, any>[] = [
      {
        id: 'title',
        renderGroup: (g) => g.title
      }
    ];

    const { container } = render(
      <GroupedRow groupData={mockGroupData} subRows={[]} columns={columns} gridTemplate={mockGridTemplate} />
    );

    const details = container.querySelector('.MuiAccordionDetails-root');
    expect(details).not.toBeInTheDocument();
  });
});
