import { Box } from '@mui/material';
import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';

import { useWorksTableActions } from './useWorksTableActions';
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

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onDelete }: { open: boolean; onClose: () => void; onDelete: () => void }) =>
    open ? (
      <div data-testid="delete-card-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="modal-delete" onClick={onDelete}>
          Delete
        </button>
      </div>
    ) : null
}));

jest.mock('./useWorksTableActions', () => ({
  useWorksTableActions: jest.fn()
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
  const mockSetGroupToUngroup = jest.fn();
  const mockHandlePublishStatusChange = jest.fn();
  const mockHandleConfirmUngroup = jest.fn();
  const mockHandleShareGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorksTableActions as jest.Mock).mockReturnValue({
      groupToUngroup: null,
      setGroupToUngroup: mockSetGroupToUngroup,
      handlePublishStatusChange: mockHandlePublishStatusChange,
      handleConfirmUngroup: mockHandleConfirmUngroup,
      handleShareGroup: mockHandleShareGroup
    });
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

  it('covers menu item clicks for published and draft states and triggers hook actions', () => {
    render(
      <WorksTable
        visibleOpusGroups={[
          { ...group, id: 'group-draft', status: BaseContentStatuses.Draft },
          { ...group, id: 'group-published', status: BaseContentStatuses.Published }
        ]}
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

    expect(mockHandleShareGroup).toHaveBeenCalled();
    expect(mockSetGroupToUngroup).toHaveBeenCalled();

    expect(mockHandlePublishStatusChange).toHaveBeenCalledWith('group-draft', 'published');
    expect(mockHandlePublishStatusChange).toHaveBeenCalledWith('group-published', 'draft');
  });

  it('renders DeleteCardModal and handles modal actions when groupToUngroup is set', () => {
    (useWorksTableActions as jest.Mock).mockReturnValue({
      groupToUngroup: 'group-1',
      setGroupToUngroup: mockSetGroupToUngroup,
      handlePublishStatusChange: mockHandlePublishStatusChange,
      handleConfirmUngroup: mockHandleConfirmUngroup,
      handleShareGroup: mockHandleShareGroup
    });

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

    expect(screen.getByTestId('delete-card-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    expect(mockSetGroupToUngroup).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByTestId('modal-delete'));
    expect(mockHandleConfirmUngroup).toHaveBeenCalled();
  });
});
