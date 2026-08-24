'use client';

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
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FundRow = Fund & {
  editAction: { editHref: string; editLabel: string };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export interface FundsTableProps {
  funds: Fund[];
  hasActiveSearch: boolean;
  hasActiveStatusFilter: boolean;
  onPublish?: (fund: Fund) => void;
}

export const FundsTable = ({ funds, hasActiveSearch, hasActiveStatusFilter, onPublish }: FundsTableProps) => {
  const rows = funds.map((fund) => {
    const canPublish = fund.status === BaseContentStatuses.Hidden && Boolean(onPublish);
    const statusActions = [
      ...(canPublish ? [{ id: 'publish', text: { name: 'Опублікувати' }, onClick: () => onPublish?.(fund) }] : []),
      { id: 'delete', text: { name: 'Видалити' } }
    ];

    return {
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
              items: statusActions
            }
          ],
          menuTriggerLabel: `Дії для фонду ${fund.name}`
        }
      },
    };
  });

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
    <TableLayout data={rows} columns={columns} />
  );
};
