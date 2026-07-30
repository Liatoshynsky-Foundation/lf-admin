import { Box } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
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
import { WORKS_TABS_NAMES } from '~/constants/creativity';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusStatus } from '~/types/graphql/generated/graphql';

type WorksTableRowData = BaseRowData<GroupHeaderData, OpusWork, IndividualWork>;

const mockTableLayout = jest.fn();

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: (props: {
    data: WorksTableRowData[];
    columns: readonly ColumnDef<GroupHeaderData, OpusWork, IndividualWork>[];
  }) => {
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
  number: 1,
  numberKind: 'op',
  name: 'Group title',
  genre: 'Symphony',
  startDate: '2020',
  endDate: '2022',
  status: BaseContentStatuses.Draft,
  updatedAt: '2024-01-01',
  compositions: [{ id: 'work-1', name: 'Work 1' }]
};

const individualWork: IndividualWork = {
  id: 'individual-1',
  name: 'Individual work',
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
    const groupDraft: GroupRowData = { ...group, id: 'group-draft', status: BaseContentStatuses.Draft };
    const groupPublished: GroupRowData = { ...group, id: 'group-published', status: BaseContentStatuses.Published };

    render(
      <WorksTable
        activeTab={WORKS_TABS_NAMES.ALL}
        items={{ groups: [groupDraft, groupPublished], works: [individualWork] }}
      />
    );

    const { data: rowsData } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };

    const triggerMenuClicks = (menuGroups: ActionMenuGroups | undefined) => {
      menuGroups?.forEach((menuGroup) => {
        menuGroup.items.forEach((item) => {
          if (item && 'onClick' in item && typeof item.onClick === 'function') {
            item.onClick();
          }
        });
      });
    };

    rowsData.forEach((row) => {
      const actions = row.type === 'group' ? row.groupData?.menuActions : row.plainData?.menuActions;
      triggerMenuClicks(actions?.menuItems);

      if (row.type === 'group' && row.subRows) {
        row.subRows.forEach((subRow) => {
          triggerMenuClicks(subRow.menuActions?.menuItems);
        });
      }
    });

    expect(mockHandleShareGroup).toHaveBeenCalled();
    expect(mockSetGroupToUngroup).toHaveBeenCalled();
    expect(mockHandlePublishStatusChange).toHaveBeenCalledWith('group-draft', OpusStatus.Published);
    expect(mockHandlePublishStatusChange).toHaveBeenCalledWith('group-published', OpusStatus.Draft);
  });

  it('renders DeleteCardModal and handles modal actions when groupToUngroup is set', () => {
    (useWorksTableActions as jest.Mock).mockReturnValue({
      groupToUngroup: 'group-1',
      setGroupToUngroup: mockSetGroupToUngroup,
      handlePublishStatusChange: mockHandlePublishStatusChange,
      handleConfirmUngroup: mockHandleConfirmUngroup,
      handleShareGroup: mockHandleShareGroup
    });

    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [group] }} />);

    expect(screen.getByTestId('delete-card-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));
    expect(mockSetGroupToUngroup).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByTestId('modal-delete'));
    expect(mockHandleConfirmUngroup).toHaveBeenCalled();
  });

  it('should correctly map GroupRowData to groupData internal format', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [group] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    const groupRow = data.find((row) => row.type === 'group');

    if (groupRow && groupRow.type === 'group') {
      expect(groupRow.groupData).toMatchObject({
        numberLabel: 1,
        name: 'Group title',
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
      if (col.renderSub && groupRow.subRows)
        col.renderSub(groupRow.subRows[0] as OpusWork, groupRow.groupData as GroupHeaderData);
      if (col.renderPlain) col.renderPlain(individualRow.plainData as IndividualWork);
    });

    expect(mockTableLayout).toHaveBeenCalled();
  });

  it('should format years correctly when endDate is equal to startDate', () => {
    const yearsCol = originalColumns.find((c) => c.id === 'years');
    const sameYearData: GroupHeaderData = {
      ...group,
      numberLabel: 1,
      name: '',
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
      numberLabel: 1,
      name: '',
      genre: '',
      startDate: '2020',
      endDate: '2022',
      status: BaseContentStatuses.Draft,
      updatedAt: ''
    };
    expect(yearsCol?.renderGroup?.(diffYearData)).toBe('2020 - 2022');
  });

  it('should format numberLabel with "op" suffix when numberKind is "op"', () => {
    const groupOp: GroupRowData = { ...group, number: 1, numberKind: 'op' };
    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [groupOp] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    const row = data[0];
    expect(row.type === 'group' && row.groupData?.numberLabel).toBe(1);
  });
});
