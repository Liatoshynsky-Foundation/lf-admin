import { Box } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';

import { useDeleteWorkAction } from './(composition)/useDeleteWorkAction';
import { useUpdateWorkAction } from './(composition)/useUpdateWorkAction';
import { useWorkUrlState } from './(composition)/useWorkUrlState';
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
import { useShare } from '~/shared/hooks/use-share/useShare';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusStatus } from '~/types/graphql/generated/graphql';
import { OpusCompositionData } from '~/types/opus';

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
  default: ({
    open,
    onClose,
    onDelete,
    title
  }: {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    title: string;
  }) =>
    open ? (
      <div data-testid={`delete-card-modal-${title.includes('розгрупування') ? 'ungroup' : 'composition'}`}>
        <button
          data-testid={`modal-close-${title.includes('розгрупування') ? 'ungroup' : 'composition'}`}
          onClick={onClose}
        >
          Close
        </button>
        <button
          data-testid={`modal-delete-${title.includes('розгрупування') ? 'ungroup' : 'composition'}`}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/forms/opus-details-block/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    onSubmit,
    initialValue
  }: {
    open: boolean;
    mode: string;
    initialValue: unknown;
    onClose: () => void;
    onSubmit: (data: OpusCompositionData) => Promise<void>;
  }) =>
    open ? (
      <div data-testid="composition-modal">
        <span data-testid="initial-value">{JSON.stringify(initialValue)}</span>
        <button data-testid="composition-modal-close" onClick={onClose}>
          Close Composition
        </button>
        <button
          data-testid="composition-modal-submit"
          onClick={() => onSubmit({ title: 'New Composition Title' } as unknown as OpusCompositionData)}
        >
          Submit Composition
        </button>
      </div>
    ) : null
}));

jest.mock('./useWorksTableActions', () => ({
  useWorksTableActions: jest.fn()
}));

jest.mock('./(composition)/useWorkUrlState', () => ({
  useWorkUrlState: jest.fn()
}));

jest.mock('./(composition)/useDeleteWorkAction', () => ({
  useDeleteWorkAction: jest.fn()
}));

jest.mock('./(composition)/useUpdateWorkAction', () => ({
  useUpdateWorkAction: jest.fn()
}));

jest.mock('~/shared/hooks/use-share/useShare', () => ({
  useShare: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn()
  }
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

  const mockOpenEditComposition = jest.fn();
  const mockCloseEditComposition = jest.fn();
  const mockSetDeleteComposition = jest.fn();
  const mockHandleConfirmCompositionDelete = jest.fn();
  const mockSetUnlinkComposition = jest.fn();
  const mockHandleConfirmUnlinkComposition = jest.fn();
  const mockHandleUpdateComposition = jest.fn();
  const mockHandleShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorksTableActions as jest.Mock).mockReturnValue({
      groupToUngroup: null,
      setGroupToUngroup: mockSetGroupToUngroup,
      handlePublishStatusChange: mockHandlePublishStatusChange,
      handleConfirmUngroup: mockHandleConfirmUngroup,
      handleShareGroup: mockHandleShareGroup
    });

    (useWorkUrlState as jest.Mock).mockReturnValue({
      compositionId: null,
      compositionToEdit: null,
      isEditOpen: false,
      openEditComposition: mockOpenEditComposition,
      closeEditComposition: mockCloseEditComposition
    });

    (useDeleteWorkAction as jest.Mock).mockReturnValue({
      deleteComposition: null,
      setDeleteComposition: mockSetDeleteComposition,
      handleConfirmCompositionDelete: mockHandleConfirmCompositionDelete,
      unlinkComposition: null,
      setUnlinkComposition: mockSetUnlinkComposition,
      handleConfirmUnlinkComposition: mockHandleConfirmUnlinkComposition
    });

    (useUpdateWorkAction as jest.Mock).mockReturnValue({
      handleUpdateComposition: mockHandleUpdateComposition,
      error: null,
      clearError: jest.fn()
    });

    (useShare as jest.Mock).mockReturnValue({
      handleShare: mockHandleShare
    });
  });

  it('should render opus groups when activeTab is Opus', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [group] }} />);

    const { data } = mockTableLayout.mock.calls[0][0] as { data: WorksTableRowData[] };
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ type: 'group', id: 'group-1' });
  });

  it('should render sineop groups when activeTab is Sineop', () => {
    render(<WorksTable activeTab={WORKS_TABS_NAMES.SINEOP} items={{ groups: [group] }} />);

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

    const opusColumn = originalColumns.find((c) => c.id === 'opus');
    expect(opusColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBe('op. 1');

    const sineopGroup: GroupHeaderData = { ...(groupRow?.groupData as GroupHeaderData), numberKind: 'sineop' };
    expect(opusColumn?.renderGroup?.(sineopGroup)).toBe('sine op. 1');

    const titleColumn = originalColumns.find((c) => c.id === 'title');
    expect(titleColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBe('Group title');
    expect(titleColumn?.renderSub?.(groupRow?.subRows?.[0] as OpusWork, groupRow?.groupData as GroupHeaderData)).toBe(
      'Work 1'
    );
    expect(titleColumn?.renderPlain?.(individualRow?.plainData as IndividualWork)).toBe('Individual work');

    const genreColumn = originalColumns.find((c) => c.id === 'genre');
    expect(genreColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBe('Symphony');
    expect(genreColumn?.renderPlain?.(individualRow?.plainData as IndividualWork)).toBe('Opera');

    const yearsColumn = originalColumns.find((c) => c.id === 'years');
    expect(yearsColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBe('2020 - 2022');
    expect(yearsColumn?.renderPlain?.(individualRow?.plainData as IndividualWork)).toBe('2023');

    const statusColumn = originalColumns.find((c) => c.id === 'status');
    expect(statusColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBeDefined();
    expect(statusColumn?.renderPlain?.(individualRow?.plainData as IndividualWork)).toBeDefined();

    const actionsColumn = originalColumns.find((c) => c.id === 'actions');
    expect(actionsColumn?.renderGroup?.(groupRow?.groupData as GroupHeaderData)).toBeDefined();
    expect(
      actionsColumn?.renderSub?.(groupRow?.subRows?.[0] as OpusWork, groupRow?.groupData as GroupHeaderData)
    ).toBeDefined();
    expect(actionsColumn?.renderPlain?.(individualRow?.plainData as IndividualWork)).toBeDefined();
  });

  it('should trigger menu actions and edit click handlers successfully', () => {
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
      if (row.type === 'group') {
        triggerMenuClicks(row.groupData?.menuActions?.menuItems);
        if (row.subRows) {
          row.subRows.forEach((subRow) => {
            triggerMenuClicks(subRow.menuActions?.menuItems);
          });
        }
      } else {
        triggerMenuClicks(row.plainData?.menuActions?.menuItems);
        row.plainData?.editAction?.onEditClick?.();
      }
    });

    expect(mockHandleShareGroup).toHaveBeenCalled();
    expect(mockSetGroupToUngroup).toHaveBeenCalled();
    expect(mockHandlePublishStatusChange).toHaveBeenCalledWith('group-draft', OpusStatus.Published);
    expect(mockHandlePublishStatusChange).toHaveBeenCalledWith('group-published', OpusStatus.Draft);

    expect(mockSetUnlinkComposition).toHaveBeenCalledWith({ opusId: 'group-draft', compositionId: 'work-1' });
    expect(mockSetDeleteComposition).toHaveBeenCalledWith('individual-1');
    expect(mockOpenEditComposition).toHaveBeenCalledWith('individual-1');
    expect(mockHandleShare).toHaveBeenCalled();
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

    expect(screen.getByTestId('delete-card-modal-ungroup')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close-ungroup'));
    expect(mockSetGroupToUngroup).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByTestId('modal-delete-ungroup'));
    expect(mockHandleConfirmUngroup).toHaveBeenCalled();
  });

  it('renders DeleteCardModal for composition deletion and handles modal actions', () => {
    (useDeleteWorkAction as jest.Mock).mockReturnValue({
      deleteComposition: 'work-1',
      setDeleteComposition: mockSetDeleteComposition,
      handleConfirmCompositionDelete: mockHandleConfirmCompositionDelete,
      unlinkComposition: null,
      setUnlinkComposition: mockSetUnlinkComposition,
      handleConfirmUnlinkComposition: mockHandleConfirmUnlinkComposition
    });

    render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

    expect(screen.getByTestId('delete-card-modal-composition')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close-composition'));
    expect(mockSetDeleteComposition).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByTestId('modal-delete-composition'));
    expect(mockHandleConfirmCompositionDelete).toHaveBeenCalled();
  });

  it('renders DeleteCardModal for unlink composition and handles modal actions', () => {
    (useDeleteWorkAction as jest.Mock).mockReturnValue({
      deleteComposition: null,
      setDeleteComposition: mockSetDeleteComposition,
      handleConfirmCompositionDelete: mockHandleConfirmCompositionDelete,
      unlinkComposition: { opusId: 'group-1', compositionId: 'work-1' },
      setUnlinkComposition: mockSetUnlinkComposition,
      handleConfirmUnlinkComposition: mockHandleConfirmUnlinkComposition
    });

    render(<WorksTable activeTab={WORKS_TABS_NAMES.OPUS} items={{ groups: [group] }} />);

    expect(screen.getByTestId('delete-card-modal-composition')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close-composition'));
    expect(mockSetUnlinkComposition).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByTestId('modal-delete-composition'));
  });

  it('renders CompositionModal and handles submit and close actions', async () => {
    (useWorkUrlState as jest.Mock).mockReturnValue({
      compositionId: 'comp-123',
      compositionToEdit: { id: 'comp-123', name: 'Composition' },
      isEditOpen: true,
      openEditComposition: mockOpenEditComposition,
      closeEditComposition: mockCloseEditComposition
    });

    render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

    expect(screen.getByTestId('composition-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('composition-modal-close'));
    expect(mockCloseEditComposition).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('composition-modal-submit'));
    expect(mockHandleUpdateComposition).toHaveBeenCalledWith('comp-123', { title: 'New Composition Title' });
  });

  it('does not call handleUpdateComposition on submit when compositionId is null', async () => {
    (useWorkUrlState as jest.Mock).mockReturnValue({
      compositionId: null,
      compositionToEdit: null,
      isEditOpen: true,
      openEditComposition: mockOpenEditComposition,
      closeEditComposition: mockCloseEditComposition
    });

    render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

    fireEvent.click(screen.getByTestId('composition-modal-submit'));
    expect(mockHandleUpdateComposition).not.toHaveBeenCalled();
    expect(mockCloseEditComposition).not.toHaveBeenCalled();
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

  describe('useEffect composition validation', () => {
    it('should not call toast or closeEditComposition if compositionId is missing or loading', () => {
      (useWorkUrlState as jest.Mock).mockReturnValue({
        compositionId: null,
        compositionToEdit: null,
        isCompositionLoading: true,
        isEditOpen: false,
        openEditComposition: mockOpenEditComposition,
        closeEditComposition: mockCloseEditComposition
      });

      render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

      expect(toast.error).not.toHaveBeenCalled();
      expect(mockCloseEditComposition).not.toHaveBeenCalled();
    });

    it('should show error toast and close edit modal if compositionId exists and is not loading, but compositionToEdit is missing', () => {
      (useWorkUrlState as jest.Mock).mockReturnValue({
        compositionId: 'non-existent-id',
        compositionToEdit: null,
        isCompositionLoading: false,
        isEditOpen: true,
        openEditComposition: mockOpenEditComposition,
        closeEditComposition: mockCloseEditComposition
      });

      render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

      expect(toast.error).toHaveBeenCalledWith('Композицію не знайдено');
      expect(mockCloseEditComposition).toHaveBeenCalled();
    });

    it('should not trigger error toast if compositionToEdit is present', () => {
      (useWorkUrlState as jest.Mock).mockReturnValue({
        compositionId: 'existing-id',
        compositionToEdit: { id: 'existing-id', name: 'Test' },
        isCompositionLoading: false,
        isEditOpen: true,
        openEditComposition: mockOpenEditComposition,
        closeEditComposition: mockCloseEditComposition
      });

      render(<WorksTable activeTab={WORKS_TABS_NAMES.WORKS} items={{ works: [individualWork] }} />);

      expect(toast.error).not.toHaveBeenCalled();
      expect(mockCloseEditComposition).not.toHaveBeenCalled();
    });
  });
});
