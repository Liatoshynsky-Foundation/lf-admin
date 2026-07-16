'use client';

import { Box } from '@mui/material';
import React from 'react';

import { styles } from './WorksTable.styles';
import { GroupMenuItems, WorkMenuItems } from './WorksTableMenuItems';
import {
  AllTab,
  OpusTab,
  WooTab,
  WORKS_BASE_PATH,
  WORKS_TABS_NAMES,
  WorksStatusValue,
  WorksTab
} from '~/constants/creativity';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type ActionFields = {
  editAction?: { editHref: string; editLabel: string };
  menuActions?: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export type GroupRowData = Readonly<{
  id: string;
  number: string;
  numberKind: 'op' | 'bo';
  name: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorksStatusValue;
  updatedAt: string;
  works: ReadonlyArray<{ id: string; title: string }>;
}>;

export type GroupHeaderData = Readonly<{
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorksStatusValue;
  updatedAt: string;
}> &
  ActionFields;

export type OpusWork = Readonly<{
  id: string;
  title: string;
}> &
  ActionFields;

export type IndividualWork = Readonly<{
  id: string;
  title: string;
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
      activeTab: WooTab;
      items: GroupItems;
    }
  | {
      activeTab: WorksTab;
      items: WorksItems;
    };

export function WorksTable({ items, activeTab }: WorksTableProps) {
  function groupsRow(group: GroupRowData): BaseRowData<GroupHeaderData, OpusWork, IndividualWork> {
    const isPublished = group.status === BaseContentStatuses.Published;

    return {
      type: 'group',
      id: group.id,
      groupData: {
        numberLabel: group.number + (group.numberKind === 'op' ? ' op' : ' bo'),
        title: group.name,
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
            setHideModalOpen: modalMock,
            setPublicationModalOpen: modalMock
          }),
          menuTriggerLabel: `Дії групи ${group.name}`
        }
      },
      subRows: group.works.map((work) => ({
        id: work.id,
        title: work.title,
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
    const isPublished = work.status === BaseContentStatuses.Published;

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

  switch (activeTab) {
  case WORKS_TABS_NAMES.ALL:
    pushGroupRows(items.groups);
    items.works.forEach((work) => rows.push(individualWorkRow(work)));
    break;

  case WORKS_TABS_NAMES.OPUS:
  case WORKS_TABS_NAMES.WOO:
    pushGroupRows(items.groups);
    break;

  case WORKS_TABS_NAMES.WORKS:
    items.works.forEach((work) => rows.push(individualWorkRow(work)));
    break;
  }

  return (
    <Box sx={styles.worksListContainer}>
      <TableLayout data={rows} columns={columns} />
    </Box>
  );
}
