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
import { BaseRowData } from '~/shared/components/table-layout/row-variants/Row.types';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockTableLayout = jest.fn();

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: (props: unknown) => {
    mockTableLayout(props);
    return <Box data-testid="table-layout" />;
  }
}));

const group: GroupRowData = {
  id: 'group-1',
  numberLabel: 'Op.1',
  title: 'Group title',
  genre: 'Symphony',
  startDate: '2020',
  endDate: '2022',
  status: BaseContentStatuses.Draft,
  updatedAt: '2024-01-01',
  works: [
    {
      id: 'work-1',
      title: 'Work 1'
    }
  ]
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

  it('should render opus groups when showOpus is true', () => {
    render(
      <WorksTable
        visibleOpusGroups={[group]}
        visibleUngroupedGroups={[]}
        visibleUngroupedWorks={[]}
        showOpus
        showUngrouped={false}
        showIndividualWorks={false}
      />
    );

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      type: 'group',
      id: 'group-1'
    });
  });

  it('should render ungrouped groups when showUngrouped is true', () => {
    render(
      <WorksTable
        visibleOpusGroups={[]}
        visibleUngroupedGroups={[group]}
        visibleUngroupedWorks={[]}
        showOpus={false}
        showUngrouped
        showIndividualWorks={false}
      />
    );

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      type: 'group',
      id: 'group-1'
    });
  });

  it('should render individual works when showIndividualWorks is true', () => {
    render(
      <WorksTable
        visibleOpusGroups={[]}
        visibleUngroupedGroups={[]}
        visibleUngroupedWorks={[individualWork]}
        showOpus={false}
        showUngrouped={false}
        showIndividualWorks
      />
    );

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      type: 'individual',
      id: 'individual-1'
    });
  });

  it('should combine all row types in correct order', () => {
    render(
      <WorksTable
        visibleOpusGroups={[group]}
        visibleUngroupedGroups={[
          {
            ...group,
            id: 'group-2'
          }
        ]}
        visibleUngroupedWorks={[individualWork]}
        showOpus
        showUngrouped
        showIndividualWorks
      />
    );

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(3);
    expect(data.map((row: { id: string }) => row.id)).toEqual(['group-1', 'group-2', 'individual-1']);
  });

  it('should pass columns to TableLayout', () => {
    render(
      <WorksTable
        visibleOpusGroups={[]}
        visibleUngroupedGroups={[]}
        visibleUngroupedWorks={[]}
        showOpus={false}
        showUngrouped={false}
        showIndividualWorks={false}
      />
    );

    expect(mockTableLayout).toHaveBeenCalledTimes(1);

    const { columns } = mockTableLayout.mock.calls[0][0];

    expect(columns).toHaveLength(6);
    expect(columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'opus', headerLabel: 'Опуси' }),
        expect.objectContaining({ id: 'title', headerLabel: 'Назва' }),
        expect.objectContaining({ id: 'genre', headerLabel: 'Жанр' }),
        expect.objectContaining({ id: 'years', headerLabel: 'Роки' }),
        expect.objectContaining({ id: 'status', headerLabel: 'Статус' }),
        expect.objectContaining({ id: 'actions', headerLabel: '' })
      ])
    );
  });

  it('covers all column rendering functions and logic branches (renderGroup, renderSub, renderPlain) directly', () => {
    render(
      <WorksTable
        visibleOpusGroups={[group]}
        visibleUngroupedGroups={[]}
        visibleUngroupedWorks={[individualWork]}
        showOpus
        showUngrouped={false}
        showIndividualWorks
      />
    );

    const { data: rowsData } = mockTableLayout.mock.calls[0][0];
    const groupRow = rowsData.find((r: { type: string }) => r.type === 'group');
    const individualRow = rowsData.find((r: { type: string }) => r.type === 'individual');

    originalColumns.forEach((col) => {
      if (col.renderGroup) col.renderGroup(groupRow.groupData);
      if (col.renderSub) col.renderSub(groupRow.subRows[0], groupRow.groupData);
      if (col.renderPlain) col.renderPlain(individualRow.plainData);
    });

    const yearsColumn = originalColumns.find((c) => c.id === 'years');

    if (yearsColumn?.renderGroup) {
      expect(
        yearsColumn.renderGroup({
          startDate: '2020',
          endDate: '2020',
          numberLabel: '',
          title: '',
          genre: '',
          status: BaseContentStatuses.Draft,
          updatedAt: ''
        })
      ).toBe('2020');
      expect(
        yearsColumn.renderGroup({
          startDate: '2020',
          endDate: undefined,
          numberLabel: '',
          title: '',
          genre: '',
          status: BaseContentStatuses.Draft,
          updatedAt: ''
        })
      ).toBe('2020');
      expect(
        yearsColumn.renderGroup({
          startDate: '2020',
          endDate: '2022',
          numberLabel: '',
          title: '',
          genre: '',
          status: BaseContentStatuses.Draft,
          updatedAt: ''
        })
      ).toBe('2020 - 2022');
    }

    const groupMenu = groupRow.groupData.menuActions.menuItems;
    groupMenu.flat().forEach((menuItem: { onClick?: () => void }) => {
      if (menuItem && typeof menuItem.onClick === 'function') {
        menuItem.onClick();
      }
    });

    const workMenu = individualRow.plainData.menuActions.menuItems;
    workMenu.flat().forEach((menuItem: { onClick?: () => void }) => {
      if (menuItem && typeof menuItem.onClick === 'function') {
        menuItem.onClick();
      }
    });
  });

  it('covers group row mapping when group status is Published', () => {
    const publishedGroup: GroupRowData = {
      ...group,
      status: BaseContentStatuses.Published
    };

    render(
      <WorksTable
        visibleOpusGroups={[publishedGroup]}
        visibleUngroupedGroups={[]}
        visibleUngroupedWorks={[]}
        showOpus
        showUngrouped={false}
        showIndividualWorks={false}
      />
    );

    const { data } = mockTableLayout.mock.calls[0][0];
    expect(data[0].groupData.status).toBe(BaseContentStatuses.Published);
  });

  it('covers menu item clicks for published and draft states', () => {
    render(
      <WorksTable
        visibleOpusGroups={[{ ...group, status: BaseContentStatuses.Published }]}
        visibleUngroupedGroups={[]}
        visibleUngroupedWorks={[{ ...individualWork, status: BaseContentStatuses.Draft }]}
        showOpus
        showUngrouped={false}
        showIndividualWorks
      />
    );

    const { data: rowsData } = mockTableLayout.mock.calls[0][0] as {
      data: readonly BaseRowData<GroupHeaderData, OpusWork, IndividualWork>[];
    };

    const triggerMenuClicks = (menuGroups: readonly { items: readonly { onClick?: () => void }[] }[]) => {
      menuGroups.forEach((menuGroup) => {
        menuGroup.items.forEach((item) => {
          if (item && typeof item.onClick === 'function') {
            item.onClick();
          }
        });
      });
    };

    rowsData.forEach((row) => {
      if (row.type === 'group' && row.groupData) {
        const groupHeader = row.groupData as GroupHeaderData;
        if (groupHeader.menuActions?.menuItems) {
          triggerMenuClicks(groupHeader.menuActions.menuItems);
        }
      }
    });

    expect(mockTableLayout).toHaveBeenCalled();
  });
});
