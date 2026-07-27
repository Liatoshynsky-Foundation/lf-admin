'use client';
import { useMemo } from 'react';

import { ARCHIVE_BASE_PATH, ARCHIVE_EMPTY_STATE_DESCRIPTION, ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION, ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE, ARCHIVE_EMPTY_STATE_TITLE } from '~/constants/archive';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type Found = {
  id: string;
  fondNumber: number;
  name: string;
  descriptions: number;
  cases: number;
  dates: string;
  status: BaseContentStatuses;
  updatedAt: string;
}

export type FoundRow = Found & {
  editAction: { editHref: string; editLabel: string };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

interface FondsTableProps {
  founds: Found[];
  hasActiveCriteria: boolean;
}

export const FondsTable = ({ founds, hasActiveCriteria }: FondsTableProps) => {
  const rows = founds.map((fond) => ({
    type: 'individual' as const,
    id: fond.id,
    plainData: {
      ...fond,
      editAction: {
        editHref: `${ARCHIVE_BASE_PATH}/found/${fond.id}/edit`,
        editLabel: `Редагувати фонд ${fond.name}`
      },
      menuActions: {
        menuItems: [
          {
            items: [
              { id: 'edit', text: { name: 'Редагувати' }, href: `${ARCHIVE_BASE_PATH}/found/${fond.id}/edit` },
              { id: 'share', text: { name: 'Поширити' }, href: `${ARCHIVE_BASE_PATH}/found/${fond.id}/share` }
            ]
          },
          {
            items: [{ id: 'delete', text: { name: 'Видалити' }, onClick: () => { } }]
          }
        ],
        menuTriggerLabel: `Дії для фонду ${fond.name}`
      }
    },
  }));

  const columns = useMemo<readonly ColumnDef<never, never, FoundRow>[]>(() => {
    return [
      {
        id: 'fondId',
        headerLabel: 'Фонд',
        align: 'center',
        width: '46px',
        hasRightDivider: true,
        renderPlain: (fond) => fond.id,
      },
      {
        id: 'name',
        headerLabel: 'Назва фонду',
        width: 'minmax(300px, 1fr)',
        renderPlain: (fond) => fond.name,
      },
      {
        id: 'descriptionsCount',
        headerLabel: 'Описи',
        width: '96px',
        renderPlain: (fond) => String(fond.descriptions),
      },
      {
        id: 'casesCount',
        headerLabel: 'Справи',
        width: '96px',
        renderPlain: (fond) => String(fond.cases),
      },
      {
        id: 'dates',
        headerLabel: 'Дати утворення',
        width: '160px',
        renderPlain: (fond) => fond.dates,
      },
      {
        id: 'status',
        headerLabel: 'Статус',
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
  }, []);

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