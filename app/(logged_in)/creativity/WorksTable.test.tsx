import { render } from '@testing-library/react';
import React from 'react';

import { GroupRowData, WorksTable } from './WorksTable';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockTableLayout = jest.fn();

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: (props: unknown) => {
    mockTableLayout(props);
    return <div data-testid="table-layout" />;
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
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  works: [
    {
      id: 'work-1',
      title: 'Work 1',
      year: '2020'
    }
  ]
};

const individualWork = {
  id: 'individual-1',
  title: 'Individual work',
  year: '2023',
  genre: 'Opera',
  status: BaseContentStatuses.Published
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
});
