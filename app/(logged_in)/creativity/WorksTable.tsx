'use client';

import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

import { useDeleteWorkAction } from './(composition)/useDeleteWorkAction';
import { useUpdateWorkAction } from './(composition)/useUpdateWorkAction';
import { useWorkUrlState } from './(composition)/useWorkUrlState';
import { useWorksTableActions } from './useWorksTableActions';
import { styles } from './WorksTable.styles';
import { GroupMenuItems, WorkMenuItems } from './WorksTableMenuItems';
import {
  AllTab,
  COMPOSITION_MODAL_PARAM,
  OpusTab,
  SineopTab,
  WORKS_BASE_PATH,
  WORKS_TABS_NAMES,
  WorksStatusValue,
  WorksTab
} from '~/constants/creativity';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { useShare } from '~/shared/hooks/use-share/useShare';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusStatus } from '~/types/graphql/generated/graphql';
import { OpusCompositionData } from '~/types/opus';

type ActionFields = {
  editAction?: { editHref?: string; onEditClick?: () => void; editLabel: string };
  menuActions?: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export type GroupRowData = Readonly<{
  id: string;
  number: number;
  numberKind: 'op' | 'sineop';
  name: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorksStatusValue;
  updatedAt: string;
  compositions: ReadonlyArray<{ id: string; name: string }>;
}>;

export type GroupHeaderData = Readonly<{
  numberLabel: number;
  numberKind: 'op' | 'sineop';
  name: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorksStatusValue;
  updatedAt: string;
}> &
  ActionFields;

export type OpusWork = Readonly<{
  id: string;
  name: string;
}> &
  ActionFields;

export type IndividualWork = Readonly<{
  id: string;
  name: string;
  year: string | number | null | undefined;
  genre: string | null | undefined;
  status: WorksStatusValue;
  updatedAt: string;
}> &
  ActionFields;

const modalMock = () => {};

export const columns: readonly ColumnDef<GroupHeaderData, OpusWork, IndividualWork>[] = [
  {
    id: 'opus',
    headerLabel: 'Опуси',
    width: '128px',
    hasRightDivider: true,
    renderGroup: (group) => `${group.numberKind === 'op' ? 'op.' : 'sine op.'} ${group.numberLabel}`
  },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(220px, 1fr)',
    renderGroup: (group) => group.name,
    renderSub: (work) => work.name,
    renderPlain: (work) => work.name
  },
  {
    id: 'genre',
    headerLabel: 'Жанр',
    width: '216px',
    renderGroup: (group) => group.genre,
    renderPlain: (work) => work.genre
  },
  {
    id: 'years',
    headerLabel: 'Роки',
    width: '104px',
    renderGroup: (group) =>
      group.endDate && group.endDate !== group.startDate ? `${group.startDate} - ${group.endDate}` : group.startDate,
    renderPlain: (work) => work.year
  },
  {
    id: 'status',
    headerLabel: 'Статус',
    width: '60px',
    hasRightDivider: true,
    hasLeftDivider: true,
    align: 'center',
    renderGroup: (group) => <StatusBadge status={group.status} updatedAt={group.updatedAt} />,
    renderPlain: (work) => <StatusBadge status={work.status} updatedAt={work.updatedAt} />
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '80px',
    align: 'right',
    renderGroup: (group) => <RowActions editAction={group.editAction} menuActions={group.menuActions} />,
    renderSub: (work) => <RowActions menuActions={work.menuActions} />,
    renderPlain: (work) => <RowActions editAction={work.editAction} menuActions={work.menuActions} />
  }
];

type GroupItems = Readonly<{
  groups: GroupRowData[];
}>;

type WorksItems = Readonly<{
  works: IndividualWork[];
}>;

type AllItems = GroupItems & WorksItems;

type WorksTableProps =
  | {
      activeTab: AllTab;
      items: AllItems;
    }
  | {
      activeTab: OpusTab;
      items: GroupItems;
    }
  | {
      activeTab: SineopTab;
      items: GroupItems;
    }
  | {
      activeTab: WorksTab;
      items: WorksItems;
    };

export function WorksTable({ items, activeTab }: WorksTableProps) {
  const { groupToUngroup, setGroupToUngroup, handlePublishStatusChange, handleConfirmUngroup, handleShareGroup } =
    useWorksTableActions();
  const {
    compositionId,
    compositionToEdit,
    isCompositionLoading,
    isEditOpen,
    openEditComposition,
    closeEditComposition
  } = useWorkUrlState();
  const { deleteComposition, setDeleteComposition, handleConfirmCompositionDelete } = useDeleteWorkAction();
  const { handleUpdateComposition } = useUpdateWorkAction();
  const { handleShare } = useShare();

  const handleSubmitComposition = async (compositionData: OpusCompositionData) => {
    if (!compositionId) return;
    await handleUpdateComposition(compositionId, compositionData);
    closeEditComposition();
  };

  const handleShareComposition = (id: string) => {
    const url = `${window.location.origin}${WORKS_BASE_PATH}?${COMPOSITION_MODAL_PARAM}=${id}`;
    handleShare(url);
  };

  useEffect(() => {
    if (!compositionId || isCompositionLoading) {
      return;
    }

    if (!compositionToEdit) {
      toast.error('Композицію не знайдено');
      closeEditComposition();
    }
  }, [compositionId, compositionToEdit, isCompositionLoading, closeEditComposition]);

  function groupsRow(group: GroupRowData): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
    const isPublished = group.status === BaseContentStatuses.Published;

    return {
      type: 'group',
      id: group.id,
      groupData: {
        numberLabel: group.number,
        numberKind: group.numberKind,
        name: group.name,
        genre: group.genre,
        startDate: group.startDate,
        endDate: group.endDate,
        status: group.status,
        updatedAt: group.updatedAt,
        editAction: {
          editHref: `${WORKS_BASE_PATH}/group/${group.id}/edit`,
          editLabel: `Редагувати групу ${group.name}`
        },
        menuActions: {
          menuItems: GroupMenuItems({
            id: group.id,
            isPublished,
            onPublish: (id) => handlePublishStatusChange(id, OpusStatus.Published),
            onUnpublish: (id) => handlePublishStatusChange(id, OpusStatus.Draft),
            onUngroup: (id) => setGroupToUngroup(id),
            onShare: (id) => handleShareGroup(id)
          }),
          menuTriggerLabel: `Дії групи ${group.name}`
        }
      },
      subRows: group.compositions.map((work) => ({
        id: work.id,
        name: work.name,
        menuActions: {
          menuItems: WorkMenuItems({
            id: work.id,
            isPublished,
            onDelete: () => modalMock(),
            onShare: () => modalMock(),
            onEdit: () => modalMock()
          }),
          menuTriggerLabel: `Дії твору ${work.name}`
        }
      }))
    };
  }

  function individualWorkRow(work: IndividualWork): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
    const isPublished = work.status === BaseContentStatuses.Published;

    return {
      type: 'individual',
      id: work.id,
      plainData: {
        id: work.id,
        name: work.name,
        genre: work.genre,
        year: work.year,
        status: work.status,
        updatedAt: work.updatedAt,
        editAction: {
          onEditClick: () => openEditComposition(work.id),
          editLabel: `Редагувати твір ${work.name}`
        },
        menuActions: {
          menuItems: WorkMenuItems({
            id: work.id,
            isPublished,
            onDelete: (id) => setDeleteComposition(id),
            onShare: (id) => handleShareComposition(id),
            onEdit: (id) => openEditComposition(id)
          }),
          menuTriggerLabel: `Дії твору ${work.name}`
        }
      }
    };
  }

  const rows: BaseRowData<GroupHeaderData, OpusWork, IndividualWork>[] = [];

  const pushGroupRows = (groups: readonly GroupRowData[]) => {
    groups.forEach((group) => {
      rows.push(groupsRow(group));
    });
  };

  switch (activeTab) {
  case WORKS_TABS_NAMES.ALL:
    pushGroupRows(items.groups);
    items.works.forEach((work) => rows.push(individualWorkRow(work)));
    break;

  case WORKS_TABS_NAMES.OPUS:
  case WORKS_TABS_NAMES.SINEOP:
    pushGroupRows(items.groups);
    break;

  case WORKS_TABS_NAMES.WORKS:
    items.works.forEach((work) => rows.push(individualWorkRow(work)));
    break;
  }

  return (
    <Box sx={styles.worksListContainer}>
      <TableLayout data={rows} columns={columns} />

      <DeleteCardModal
        open={!!groupToUngroup}
        onClose={() => setGroupToUngroup(null)}
        onDelete={handleConfirmUngroup}
        title="Підтвердити розгрупування"
        confirmButtonText="Розгрупувати"
        description="Ви впевнені, що хочете розгрупувати групу? Опис сторінки буде видалено, але композиції залишаться в системі."
      />

      <DeleteCardModal
        open={Boolean(deleteComposition)}
        onClose={() => setDeleteComposition(null)}
        onDelete={handleConfirmCompositionDelete}
        title="Підтвердити видалення композиції"
        confirmButtonText="Видалити"
        description="Ви впевнені, що хочете видалити цю композицію? Це дію можна скасувати лише шляхом повторного додавання композиції."
      />

      <CompositionModal
        open={isEditOpen}
        mode="edit"
        initialValue={compositionToEdit}
        onClose={closeEditComposition}
        onSubmit={handleSubmitComposition}
      />
    </Box>
  );
}
