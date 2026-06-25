'use client';

import { Box } from '@mui/material';
import React from 'react';

import { WorkStatus } from './works.mock';
import { styles } from './WorksTable.styles';
import { GroupMenuItems, WorkMenuItems } from './WorksTableMenusItems';
import { WORKS_BASE_PATH } from '~/constants/creativity';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { BaseRowData, ColumnDef, MenuItem } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';

type ActionFields = {
  editAction?: { editHref: string; editLabel: string };
  menuActions?: { menuItems: readonly (readonly MenuItem[])[]; menuTriggerLabel: string };
};

export type GroupRowData = Readonly<{
  id: string;
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorkStatus;
  updatedAt: string;
  works: ReadonlyArray<{ id: string; title: string; year: string }>;
}>;

export type GroupHeaderData = Readonly<{
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorkStatus;
  updatedAt: string;
}> &
  ActionFields;

export type OpusWork = Readonly<{
  id: string;
  title: string;
  year: string;
}> &
  ActionFields;

export type IndividualWork = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
  updatedAt: string;
}> &
  ActionFields;

const modalMock = () => {};

export const columns: readonly ColumnDef<GroupHeaderData, OpusWork, IndividualWork>[] = [
  {
    id: 'opus',
    headerLabel: 'Опуси',
    width: '88px',
    hasRightDivider: true,
    renderGroup: (group) => group.numberLabel
  },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(220px, 1fr)',
    renderGroup: (group) => group.title,
    renderSub: (work) => work.title,
    renderPlain: (work) => work.title
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

type WorksTableProps = Readonly<{
  visibleOpusGroups: readonly GroupRowData[];
  visibleUngroupedGroups: readonly GroupRowData[];
  visibleUngroupedWorks: readonly IndividualWork[];
  showOpus: boolean;
  showUngrouped: boolean;
  showIndividualWorks: boolean;
}>;

export function WorksTable({
  visibleOpusGroups,
  visibleUngroupedGroups,
  visibleUngroupedWorks,
  showOpus,
  showUngrouped,
  showIndividualWorks
}: WorksTableProps) {
  function groupsRow(group: GroupRowData): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
    const isPublished = group.status === 'published';

    return {
      type: 'group',
      id: group.id,
      groupData: {
        numberLabel: group.numberLabel,
        title: group.title,
        genre: group.genre,
        startDate: group.startDate,
        endDate: group.endDate,
        status: group.status,
        updatedAt: group.updatedAt,
        editAction: {
          editHref: `${WORKS_BASE_PATH}/group/${group.id}/edit`,
          editLabel: `Редагувати групу ${group.title}`
        },
        menuActions: {
          menuItems: GroupMenuItems({
            id: group.id,
            isPublished,
            setHideModalOpen: modalMock,
            setPublicationModalOpen: modalMock
          }),
          menuTriggerLabel: `Дії групи ${group.title}`
        }
      },
      subRows: group.works.map((work) => ({
        id: work.id,
        title: work.title,
        year: work.year,
        menuActions: {
          menuItems: WorkMenuItems({
            id: work.id,
            isPublished,
            setDeleteModalOpen: modalMock
          }),
          menuTriggerLabel: `Дії твору ${work.title}`
        }
      }))
    };
  }

  function individualWorkRow(work: IndividualWork): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
    const isPublished = work.status === 'published';

    return {
      type: 'individual',
      id: work.id,
      plainData: {
        id: work.id,
        title: work.title,
        genre: work.genre,
        year: work.year,
        status: work.status,
        updatedAt: work.updatedAt,
        editAction: {
          editHref: `${WORKS_BASE_PATH}/work/${work.id}/edit`,
          editLabel: `Редагувати твір ${work.title}`
        },
        menuActions: {
          menuItems: WorkMenuItems({
            id: work.id,
            isPublished,
            setDeleteModalOpen: modalMock
          }),
          menuTriggerLabel: `Дії твору ${work.title}`
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

  if (showOpus) pushGroupRows(visibleOpusGroups);
  if (showUngrouped) pushGroupRows(visibleUngroupedGroups);

  if (showIndividualWorks) {
    visibleUngroupedWorks.forEach((work) => {
      rows.push(individualWorkRow(work));
    });
  }

  return (
    <Box sx={styles.worksListContainer}>
      <TableLayout data={rows} columns={columns} />
    </Box>
  );
}
