'use client';

import { useState } from 'react';

import {
  ARCHIVE_BASE_PATH,
  ARCHIVE_EMPTY_STATE_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE,
  ARCHIVE_EMPTY_STATE_TITLE,
  ARCHIVE_FUNDS_TABLE_HEADERS,
} from '~/constants/archive';
import { Fund } from '~/constants/fund';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { useDeleteFund } from '~/shared/hooks/use-funds/useFunds';

export type FundRow = Fund & {
  editAction: { editHref: string; editLabel: string };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export interface FundsTableProps {
  funds: Fund[];
  hasActiveSearch: boolean;
  hasActiveStatusFilter: boolean;
  onDeleted?: () => Promise<unknown>;
}

export const FundsTable = ({ funds, hasActiveSearch, hasActiveStatusFilter, onDeleted }: FundsTableProps) => {
  const [deleteFund] = useDeleteFund();
  const [deleteState, setDeleteState] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const rows = funds.map((fund) => ({
    type: 'individual' as const,
    id: fund.id,
    plainData: {
      ...fund,
      editAction: {
        editHref: `${ARCHIVE_BASE_PATH}/fund/${fund.id}/edit`,
        editLabel: `Редагувати фонд ${fund.name}`
      },
      menuActions: {
        menuItems: [
          {
            items: [
              { id: 'edit', text: { name: 'Редагувати' }, href: `${ARCHIVE_BASE_PATH}/fund/${fund.id}/edit` },
              { id: 'share', text: { name: 'Поширити' }, href: `${ARCHIVE_BASE_PATH}/fund/${fund.id}/share` }
            ]
          },
          {
            items: [{ id: 'delete', text: { name: 'Видалити' }, onClick: () => setDeleteState({ open: true, id: fund.id, name: fund.name }) }]
          }
        ],
        menuTriggerLabel: `Дії для фонду ${fund.name}`
      }
    },
  }));

  const columns: readonly ColumnDef<never, never, FundRow>[] = [
    {
      id: 'fundNumber',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.fund,
      align: 'center',
      width: '46px',
      hasRightDivider: true,
      renderPlain: (fund) => fund.fundNumber,
    },
    {
      id: 'name',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.name,
      width: 'minmax(300px, 1fr)',
      renderPlain: (fund) => fund.name,
    },
    {
      id: 'descriptionsCount',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.descr,
      width: '96px',
      renderPlain: (fund) => String(fund.descriptions),
    },
    {
      id: 'casesCount',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.cases,
      width: '96px',
      renderPlain: (fund) => String(fund.cases),
    },
    {
      id: 'dates',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.dates,
      width: '160px',
      renderPlain: (fund) => fund.dates,
    },
    {
      id: 'status',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.status,
      width: '60px',
      align: 'center',
      hasLeftDivider: true,
      hasRightDivider: true,
      renderPlain: (fund) => <StatusBadge status={fund.status} updatedAt={fund.updatedAt} />,
    },
    {
      id: 'actions',
      width: '96px',
      align: 'right',
      renderPlain: (fund) => <RowActions editAction={{
        editLabel: fund.editAction.editLabel,
        editHref: fund.editAction.editHref
      }} menuActions={fund.menuActions} />
    }
  ];
 
  if (rows.length === 0) {
    const hasActiveCriteria = hasActiveSearch || hasActiveStatusFilter;

    if (!hasActiveCriteria) {
      return (
        <EmptyState
          title={ARCHIVE_EMPTY_STATE_TITLE}
          description={ARCHIVE_EMPTY_STATE_DESCRIPTION}
        />
      );
    }

    if (hasActiveStatusFilter && !hasActiveSearch) {
      return (
        <EmptyState
          title={ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE}
          description=""
        />
      );
    }

    return (
      <EmptyState
        title={ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE}
        description={ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION}
      />
    );
  }

  return (
    <>
      <TableLayout data={rows} columns={columns} />
      <DeleteCompositionModal
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false })}
        title="Підтвердити видалення"
        description={`Ви впевнені, що хочете видалити фонд «${deleteState.name ?? ''}»?`}
        onConfirm={async () => {
          if (!deleteState.id) return;
          await deleteFund({ id: deleteState.id });
          setDeleteState({ open: false });
          await onDeleted?.();
        }}
      />
    </>
  );
};