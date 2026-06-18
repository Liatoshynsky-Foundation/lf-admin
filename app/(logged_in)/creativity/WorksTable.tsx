'use client';

import { Box } from '@mui/material';
import React from 'react';

import { WorkStatus } from './works.mock';
import { styles } from './WorksTable.styles';
import { COLUMNS, GROUP_MENU_ITEMS, WORK_MENU_ITEMS } from './WorksTableConent';
import { WORKS_BASE_PATH } from '~/constants/creativity';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import {
  BaseRowData,
  GroupRowRenderer,
  IndividualRowRenderer
} from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';

export type TableGroupRowData = Readonly<{
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

export type TableIndividualWorkData = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
  updatedAt: string;
  language: 'uk' | 'en' | 'bilingual';
}>;

const worksGroupRenderer: GroupRowRenderer<TableGroupRowData, TableGroupRowData['works'][number]> = {
  renderGroupCell: (colId, group) => {
    switch (colId) {
    case 'opus':
      return group.numberLabel;
    case 'title':
      return group.title;
    case 'genre':
      return group.genre;
    case 'years':
      return group.endDate && group.endDate !== group.startDate
        ? `${group.startDate} - ${group.endDate}`
        : group.startDate;
    case 'status':
      return <StatusBadge status={group.status} />;
    default:
      return null;
    }
  },
  renderSubCell: (colId, work) => {
    if (colId === 'title') return work.title;
    return null;
  }
};

const worksIndividualRenderer: IndividualRowRenderer<TableIndividualWorkData> = {
  renderPlainCell: (colId, work) => {
    switch (colId) {
    case 'title':
      return work.title;
    case 'genre':
      return work.genre;
    case 'years':
      return work.year;
    case 'status':
      return <StatusBadge status={work.status} />;
    default:
      return null;
    }
  }
};

type WorksTableProps = Readonly<{
  visibleOpusGroups: readonly TableGroupRowData[];
  visibleUngroupedGroups: readonly TableGroupRowData[];
  visibleUngroupedWorks: readonly TableIndividualWorkData[];
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
  const mixedRows: BaseRowData<TableGroupRowData, TableGroupRowData['works'][number], TableIndividualWorkData>[] = [];

  const pushGroupRows = (groups: readonly TableGroupRowData[]) => {
    groups.forEach((group) => {
      mixedRows.push({
        type: 'group',
        id: group.id,
        groupData: group,
        subRows: group.works,
        renderer: worksGroupRenderer,
        actions: {
          editHref: `${WORKS_BASE_PATH}/group/${group.id}/edit`,
          editLabel: `Редагувати групу ${group.title}`,
          menuItems: GROUP_MENU_ITEMS,
          menuTriggerLabel: `Дії групи ${group.title}`
        },
        subRowActions: (work) => ({
          menuItems: WORK_MENU_ITEMS,
          menuTriggerLabel: `Дії твору ${work.title}`
        })
      });
    });
  };

  if (showOpus) pushGroupRows(visibleOpusGroups);
  if (showUngrouped) pushGroupRows(visibleUngroupedGroups);

  if (showIndividualWorks) {
    visibleUngroupedWorks.forEach((work) => {
      mixedRows.push({
        type: 'individual',
        id: work.id,
        plainData: work,
        renderer: worksIndividualRenderer,
        actions: {
          editHref: `${WORKS_BASE_PATH}/work/${work.id}/edit`,
          editLabel: `Редагувати твір ${work.title}`,
          menuItems: WORK_MENU_ITEMS,
          menuTriggerLabel: `Дії твору ${work.title}`
        }
      });
    });
  }

  return (
    <Box sx={styles.worksListContainer}>
      <TableLayout data={mixedRows} columns={COLUMNS} />
    </Box>
  );
}
