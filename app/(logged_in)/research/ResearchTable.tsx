'use client';

import { Box } from '@mui/material';

import type { ResearchWork } from './research.mock';
import { RESEARCH_BASE_PATH } from './ResearchPageContent';
import { styles } from './ResearchTable.styles';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import type { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';

type PlainWork = ResearchWork & {
  editAction?: { editHref: string; editLabel: string };
  menuActions?: {
    menuItems: readonly (readonly { id: string; label: string; href?: string; onClick?: () => void }[])[];
    menuTriggerLabel: string;
  };
};

const columns: readonly ColumnDef<never, never, PlainWork>[] = [
  {
    id: 'author',
    headerLabel: 'Автор',
    width: '180px',
    renderPlain: (work) => work.author
  },
  {
    id: 'description',
    headerLabel: 'Бібліографічний опис',
    width: 'minmax(300px, 1fr)',
    renderPlain: (work) => work.bibliographicDescription
  },
  {
    id: 'year',
    headerLabel: 'Рік',
    width: '80px',
    renderPlain: (work) => work.year
  },
  {
    id: 'keywords',
    headerLabel: 'Ключові слова',
    width: '200px',
    renderPlain: (work) => work.keywords
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
    width: '80px',
    align: 'right',
    renderPlain: (work) => <RowActions editAction={work.editAction} menuActions={work.menuActions} />
  }
];

export function ResearchTable({ works }: Readonly<{ works: readonly ResearchWork[] }>) {
  const rows: BaseRowData<never, never, PlainWork>[] = works.map((work) => ({
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
          [
            { id: 'edit', label: 'Редагувати', href: `${RESEARCH_BASE_PATH}/${work.id}/edit` },
            { id: 'share', label: 'Поширити' }
          ],
          [{ id: 'delete', label: 'Видалити' }]
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
