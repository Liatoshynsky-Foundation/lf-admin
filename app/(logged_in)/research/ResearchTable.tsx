'use client';

import { Box, Typography } from '@mui/material';

import { styles } from './ResearchTable.styles';
import { RESEARCH_MENU_ACTIONS } from '~/constants/research';
import type { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import type { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { twoLineEllipsis } from '~/shared/components/table-layout/TableLayout.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { ResearchWork } from '~/types/researchWork';

type PlainWork = ResearchWork & {
  editAction?: { editLabel: string; onEditClick?: () => void };
  menuActions?: {
    menuItems: ActionMenuGroups;
    menuTriggerLabel: string;
  };
};

const columns: readonly ColumnDef<unknown, unknown, PlainWork>[] = [
  {
    id: 'author',
    headerLabel: 'Автор',
    width: '184px',
    renderPlain: (work) => work.author
  },
  {
    id: 'description',
    headerLabel: 'Бібліографічний опис',
    width: 'minmax(300px, 1fr)',
    renderPlain: (work) => (
      <Typography sx={{ fontSize: '16px', fontWeight: 600, ...twoLineEllipsis }}>
        {work.bibliographicDescription}
      </Typography>
    )
  },
  {
    id: 'year',
    headerLabel: 'Дати',
    width: 'minmax(96px, 120px)',
    renderPlain: (work) => <Typography sx={styles.datesCell}>{work.year}</Typography>
  },
  {
    id: 'keywords',
    headerLabel: 'Ключові слова',
    width: '252px',
    renderPlain: (work) => (
      <Typography sx={{ fontSize: '16px', fontWeight: 600, ...twoLineEllipsis }}>{work.keywords}</Typography>
    )
  },
  {
    id: 'status',
    headerLabel: 'Статус',
    width: '60px',
    hasLeftDivider: true,
    hasRightDivider: true,
    align: 'center',
    renderPlain: (work) => <StatusBadge status={work.status} updatedAt={work.updatedAt} />
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '96px',
    align: 'right',
    renderPlain: (work) => <RowActions editAction={work.editAction} menuActions={work.menuActions} />
  }
];

const buildMenuItems = (
  work: ResearchWork,
  onEditWork: (work: ResearchWork) => void,
  onDeleteWork: ((work: ResearchWork) => void) | undefined,
  onToggleStatus: ((work: ResearchWork) => void) | undefined,
  onShareWork: ((work: ResearchWork) => void) | undefined
): ActionMenuGroups => {
  const isPublished = work.status === BaseContentStatuses.Published;

  return [
    {
      items: [
        { id: 'edit', text: { name: RESEARCH_MENU_ACTIONS.edit }, onClick: () => onEditWork(work) },
        { id: 'share', text: { name: RESEARCH_MENU_ACTIONS.share }, onClick: () => onShareWork?.(work) }
      ]
    },
    {
      items: [
        {
          id: isPublished ? 'hide' : 'publish',
          text: { name: isPublished ? RESEARCH_MENU_ACTIONS.hide : RESEARCH_MENU_ACTIONS.publish },
          onClick: () => onToggleStatus?.(work)
        },
        { id: 'delete', text: { name: RESEARCH_MENU_ACTIONS.delete }, onClick: () => onDeleteWork?.(work) }
      ]
    }
  ];
};

export function ResearchTable({
  works,
  onEditWork,
  onDeleteWork,
  onToggleStatus,
  onShareWork
}: Readonly<{
  works: readonly ResearchWork[];
  onEditWork: (work: ResearchWork) => void;
  onDeleteWork?: (work: ResearchWork) => void;
  onToggleStatus?: (work: ResearchWork) => void;
  onShareWork?: (work: ResearchWork) => void;
}>) {
  const rows: BaseRowData<unknown, unknown, PlainWork>[] = works.map((work) => ({
    type: 'individual',
    id: work.id,
    plainData: {
      ...work,
      editAction: {
        editLabel: `Редагувати роботу ${work.author}`,
        onEditClick: () => onEditWork(work)
      },
      menuActions: {
        menuItems: buildMenuItems(work, onEditWork, onDeleteWork, onToggleStatus, onShareWork),
        menuTriggerLabel: `Дії для роботи ${work.author}`
      }
    }
  }));

  return (
    <Box sx={styles.researchListContainer}>
      <TableLayout data={rows} columns={columns} />
    </Box>
  );
}
