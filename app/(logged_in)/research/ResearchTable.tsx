'use client';

import { Box, Typography } from '@mui/material';

import type { ResearchWork } from './research.mock';
import { styles } from './ResearchTable.styles';
import { RESEARCH_BASE_PATH } from '~/constants/research';
import type { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import type { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { twoLineEllipsis } from '~/shared/components/table-layout/TableLayout.styles';

type PlainWork = ResearchWork & {
  editAction?: { editHref: string; editLabel: string };
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
    headerLabel: 'Рік',
    width: '120px',
    renderPlain: (work) => work.year
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

export function ResearchTable({ works }: Readonly<{ works: readonly ResearchWork[] }>) {
  const rows: BaseRowData<unknown, unknown, PlainWork>[] = works.map((work) => ({
    type: 'individual',
    id: work.id,
    plainData: {
      ...work,
      editAction: {
        editHref: `${RESEARCH_BASE_PATH}/${work.id}/edit`,
        editLabel: `Редагувати роботу ${work.author}`
      },
      menuActions: {
        menuItems: [
          {
            items: [
              { id: 'edit', text: { name: 'Редагувати' }, href: `${RESEARCH_BASE_PATH}/${work.id}/edit` },
              { id: 'share', text: { name: 'Поширити' } }
            ]
          },
          {
            items: [{ id: 'delete', text: { name: 'Видалити' } }]
          }
        ],
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
