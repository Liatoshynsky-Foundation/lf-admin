'use client';

import {
  ARCHIVE_BASE_PATH,
  ARCHIVE_EMPTY_STATE_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_EMPTY_STATE_TITLE,
  ARCHIVE_FONDS_TABLE_HEADERS,
} from '~/constants/archive';
import { Fond } from '~/constants/fond';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';

export type FondRow = Fond & {
  editAction: { editHref: string; editLabel: string };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export interface FondsTableProps {
  fonds: Fond[];
  hasActiveCriteria: boolean;
}

export const FondsTable = ({ fonds, hasActiveCriteria }: FondsTableProps) => {
  const rows = fonds.map((fond) => ({
    type: 'individual' as const,
    id: fond.id,
    plainData: {
      ...fond,
      editAction: {
        editHref: `${ARCHIVE_BASE_PATH}/fond/${fond.id}/edit`,
        editLabel: `Редагувати фонд ${fond.name}`
      },
      menuActions: {
        menuItems: [
          {
            items: [
              { id: 'edit', text: { name: 'Редагувати' }, href: `${ARCHIVE_BASE_PATH}/fond/${fond.id}/edit` },
              { id: 'share', text: { name: 'Поширити' }, href: `${ARCHIVE_BASE_PATH}/fond/${fond.id}/share` }
            ]
          },
          {
            items: [{ id: 'delete', text: { name: 'Видалити' } }]
          }
        ],
        menuTriggerLabel: `Дії для фонду ${fond.name}`
      }
    },
  }));

  const columns: readonly ColumnDef<never, never, FondRow>[] = [
    {
      id: 'fondNumber',
      headerLabel: ARCHIVE_FONDS_TABLE_HEADERS.fond,
      align: 'center',
      width: '46px',
      hasRightDivider: true,
      renderPlain: (fond) => fond.fondNumber,
    },
    {
      id: 'name',
      headerLabel: ARCHIVE_FONDS_TABLE_HEADERS.name,
      width: 'minmax(300px, 1fr)',
      renderPlain: (fond) => fond.name,
    },
    {
      id: 'descriptionsCount',
      headerLabel: ARCHIVE_FONDS_TABLE_HEADERS.descr,
      width: '96px',
      renderPlain: (fond) => String(fond.descriptions),
    },
    {
      id: 'casesCount',
      headerLabel: ARCHIVE_FONDS_TABLE_HEADERS.cases,
      width: '96px',
      renderPlain: (fond) => String(fond.cases),
    },
    {
      id: 'dates',
      headerLabel: ARCHIVE_FONDS_TABLE_HEADERS.dates,
      width: '160px',
      renderPlain: (fond) => fond.dates,
    },
    {
      id: 'status',
      headerLabel: ARCHIVE_FONDS_TABLE_HEADERS.status,
      width: '60px',
      align: 'center',
      hasLeftDivider: true,
      hasRightDivider: true,
      renderPlain: (fond) => <StatusBadge status={fond.status} updatedAt={fond.updatedAt} />,
    },
    {
      id: 'actions',
      width: '96px',
      align: 'right',
      renderPlain: (fond) => <RowActions editAction={{
        editLabel: fond.editAction.editLabel,
        editHref: fond.editAction.editHref
      }} menuActions={fond.menuActions} />
    }
  ];
 
  if (rows.length === 0) {
    return (
      <EmptyState
        title={hasActiveCriteria ? ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE : ARCHIVE_EMPTY_STATE_TITLE}
        description={hasActiveCriteria ? ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION : ARCHIVE_EMPTY_STATE_DESCRIPTION}
      />
    );
  }

  return (
    <TableLayout data={rows} columns={columns} />
  );
};