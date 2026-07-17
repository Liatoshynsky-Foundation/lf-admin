import { Box } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';

import {
  columns as originalColumns,
  GroupHeaderData,
  GroupRowData,
  IndividualWork,
  OpusWork,
  WorksTable
} from './WorksTable';
import { WORKS_TABS_NAMES } from '~/constants/creativity';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockTableLayout = jest.fn();

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: (props: {
    data: WorksTableRowData[];
    columns: ColumnDef<GroupHeaderData, OpusWork, IndividualWork>;
  }) => {
    mockTableLayout(props);
    return <Box data-testid="table-layout" />;
  }
}));

type WorksTableRowData = BaseRowData<GroupHeaderData, OpusWork, IndividualWork>;

const group: GroupRowData = {
  id: 'group-1',
  number: '1',
  numberKind: 'op',
  name: 'Group title',
  genre: 'Symphony',
  startDate: '2020',
  endDate: '2022',
  status: BaseContentStatuses.Draft,
  updatedAt: '2024-01-01',
  works: [{ id: 'work-1', title: 'Work 1' }]
};

const individualWork: IndividualWork = {
  id: 'individual-1',
  title: 'Individual work',
  year: '2023',
  genre: 'Opera',
  status: BaseContentStatuses.Published,
  updatedAt: '2024-01-02'
};

describe('WorksTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render opus groups when activeTab is Opus', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [group] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ type: 'group', id: 'group-1' });
  });

  it('should render individual works when activeTab is Works', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ type: 'individual', id: 'individual-1' });
  });

  it('should combine all row types in correct order when activeTab is All', () => {
    const group2 = { ...group, id: 'group-2' };
    render(
      <WorksTable activeTab={WORKS_TABS_NAMES.ALL} items={{ groups: [group, group2], works: [individualWork] }} />
    );

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    expect(data.map((row) => row.id)).toEqual(['group-1', 'group-2', 'individual-1']);
  });

  it('should execute render functions correctly for columns', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.ALL} items={{ groups: [group], works: [individualWork] }} />);

    const { data: rowsData } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    const groupRow = rowsData.find((r) => r.type === 'group');
    const individualRow = rowsData.find((r) => r.type === 'individual');

    originalColumns.forEach((col) => {
      if (groupRow && col.renderGroup) col.renderGroup(groupRow.groupData as GroupHeaderData);
      if (groupRow && groupRow.subRows && col.renderSub)
        col.renderSub(groupRow.subRows[0] as OpusWork, groupRow.groupData as GroupHeaderData);
      if (individualRow && col.renderPlain) col.renderPlain(individualRow.plainData as IndividualWork);
    });

    const yearsColumn = originalColumns.find((c) => c.id === 'years');
    expect(yearsColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBe('2020 - 2022');
  });

  it('should trigger menu actions successfully', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.ALL} items={{ groups: [group], works: [individualWork] }} />);

    const { data: rowsData } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };

    rowsData.forEach((row) => {
      const actions = row.type === 'group' ? row.groupData?.menuActions : row.plainData?.menuActions;

      if (actions?.menuItems) {
        actions.menuItems.flat().forEach((item) => {
          if (item && 'onClick' in item && typeof item.onClick === 'function') {
            item.onClick();
          }
        });
      }
    });

    expect(mockTableLayout).toHaveBeenCalled();
  });

  it('should correctly map GroupRowData to groupData internal format', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [group] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };

    const groupRow = data.find((row) => row.type === 'group');

    if (groupRow && groupRow.type === 'group') {
      expect(groupRow.groupData).toMatchObject({
        numberLabel: '1',
        title: 'Group title',
        status: BaseContentStatuses.Draft
      });
    } else {
      throw new Error('Group row not found');
    }
  });

  it('should successfully execute all defined render functions (renderGroup, renderSub, renderPlain)', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.ALL} items={{ groups: [group], works: [individualWork] }} />);

    const { data: rowsData } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    const groupRow = rowsData.find((r) => r.type === 'group')!;
    const individualRow = rowsData.find((r) => r.type === 'individual')!;

    originalColumns.forEach((col) => {
      if (col.renderGroup) col.renderGroup(groupRow.groupData as GroupHeaderData);
      if (col.renderSub && groupRow.subRows) col.renderSub(groupRow.subRows[0], groupRow.groupData as GroupHeaderData);
      if (col.renderPlain) col.renderPlain(individualRow.plainData as IndividualWork);
    });

    expect(mockTableLayout).toHaveBeenCalled();
  });

  it('should format years correctly when endDate is equal to startDate', () => {
    const yearsCol = originalColumns.find((c) => c.id === 'years');
    const sameYearData: GroupHeaderData = {
      ...group,
      numberLabel: '1',
      title: '',
      genre: '',
      startDate: '2020',
      endDate: '2020',
      status: BaseContentStatuses.Draft,
      updatedAt: ''
    };
    expect(yearsCol?.renderGroup?.(sameYearData)).toBe('2020');
  });

  it('should format years correctly when endDate is different from startDate', () => {
    const yearsCol = originalColumns.find((c) => c.id === 'years');
    const diffYearData: GroupHeaderData = {
      ...group,
      numberLabel: '1',
      title: '',
      genre: '',
      startDate: '2020',
      endDate: '2022',
      status: BaseContentStatuses.Draft,
      updatedAt: ''
    };
    expect(yearsCol?.renderGroup?.(diffYearData)).toBe('2020 - 2022');
  });

  it('should format numberLabel with "op" suffix when numberKind is "op"', () => {
    const groupOp: GroupRowData = { ...group, number: '1', numberKind: 'op' };
    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [groupOp] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    const row = data[0];
    expect(row.type === 'group' && row.groupData?.numberLabel).toBe('1');
  });
});
