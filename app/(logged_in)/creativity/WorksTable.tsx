'use client';

import { Box } from '@mui/material';
import React from 'react';

import { WorkStatus } from './works.mock';
import { styles } from './WorksTable.styles';
import { GROUP_MENU_ITEMS, WORK_MENU_ITEMS, WORKS_BASE_PATH } from '~/constants/creativity';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { BaseRowData, ColumnDef, MenuItem } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';

type ActionFields = {
  editAction?: { editHref: string; editLabel: string };
  menuActions?: { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
};

export type GroupRowData = Readonly<{
  id: string;
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  works: ReadonlyArray<{ id: string; title: string; year: string }>;
}>;

export type GroupHeaderData = Readonly<{
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorkStatus;
}> &
  ActionFields;

export type OpusWork = Readonly<{
  id: string;
  title: string;
  year: string;
}>;

export type IndividualWork = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
}> &
  ActionFields;

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
    renderGroup: (group) => <StatusBadge status={group.status} />,
    renderPlain: (work) => <StatusBadge status={work.status} />
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '80px',
    align: 'right',
    renderGroup: (group) => <RowActions editAction={group.editAction} menuActions={group.menuActions} />,
    renderSub: (work) => (
      <RowActions
        menuActions={{
          menuItems: WORK_MENU_ITEMS,
          menuTriggerLabel: `Дії твору ${work.title}`
        }}
      />
    ),
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

function groupsRow(group: GroupRowData): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
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
      editAction: {
        editHref: `${WORKS_BASE_PATH}/group/${group.id}/edit`,
        editLabel: `Редагувати групу ${group.title}`
      },
      menuActions: {
        menuItems: GROUP_MENU_ITEMS,
        menuTriggerLabel: `Дії групи ${group.title}`
      }
    },
    subRows: group.works
  };
}

function individualWorkRow(work: IndividualWork): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
  return {
    type: 'individual',
    id: work.id,
    plainData: {
      id: work.id,
      title: work.title,
      genre: work.genre,
      year: work.year,
      status: work.status,
      editAction: {
        editHref: `${WORKS_BASE_PATH}/work/${work.id}/edit`,
        editLabel: `Редагувати твір ${work.title}`
      },
      menuActions: {
        menuItems: WORK_MENU_ITEMS,
        menuTriggerLabel: `Дії твору ${work.title}`
      }
    }
  };
}

export function WorksTable({
  visibleOpusGroups,
  visibleUngroupedGroups,
  visibleUngroupedWorks,
  showOpus,
  showUngrouped,
  showIndividualWorks
}: WorksTableProps) {
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
