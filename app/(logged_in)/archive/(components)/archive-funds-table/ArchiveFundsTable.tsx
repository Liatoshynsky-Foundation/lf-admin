'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { ArchiveCaseModal } from '../ArchiveCaseModal';
import {
  ARCHIVE_BASE_PATH,
  ARCHIVE_EMPTY_STATE_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE,
  ARCHIVE_EMPTY_STATE_TITLE,
  ARCHIVE_FUNDS_TABLE_HEADERS,
  type PdfEntry
} from '~/constants/archive';
import { Fund } from '~/constants/fund';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import type { ArchiveCaseInitialData } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useDeleteCase, useDeleteFund, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

export type ArchiveCase = {
  id: string;
  name: string;
  fundId: string;
  caseNumber: number;
  descriptionNumber: number;
  sheetsNumber: number;
  editCaseDate: string;
  editCaseDescriptions: string;
  detailedCaseDescription: string;
  pdfFile?: PdfEntry;
  status: BaseContentStatuses;
  updatedAt: string;
};

export type FundRow = Omit<Fund, 'fundNumber' | 'descriptions' | 'cases' | 'dates'> & {
  fundNumber: number | string;
  descriptions: number | string;
  cases: number | string;
  dates: string;
  editAction: { editHref?: string; editLabel: string; onEditClick?: () => void };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export interface FundsTableProps {
  funds: Fund[];
  cases?: ArchiveCase[];
  hasActiveSearch: boolean;
  hasActiveStatusFilter: boolean;
  onDeleted?: () => Promise<unknown>;
  onCaseChanged?: () => Promise<unknown>;
  onPublish?: (fund: Fund) => void;
}

export const FundsTable = ({
  funds,
  cases = [],
  hasActiveSearch,
  hasActiveStatusFilter,
  onDeleted,
  onCaseChanged,
  onPublish
}: FundsTableProps) => {
  const [deleteFund] = useDeleteFund();
  const [deleteCase] = useDeleteCase();
  const [updateCase] = useUpdateCase();
  const [deleteState, setDeleteState] = useState<{ open: boolean; id?: string; name?: string; isCase?: boolean }>({
    open: false
  });
  const [editCase, setEditCase] = useState<{ item: ArchiveCase; data: ArchiveCaseInitialData }>();

  const fundRows = funds.map((fund) => {
    const canPublish = fund.status === BaseContentStatuses.Hidden && Boolean(onPublish);
    const statusActions = [
      ...(canPublish ? [{ id: 'publish', text: { name: 'Опублікувати' }, onClick: () => onPublish?.(fund) }] : []),
      {
        id: 'delete',
        text: { name: 'Видалити' },
        onClick: () => setDeleteState({ open: true, id: fund.id, name: fund.name })
      }
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
      }
    };
  });

  const caseRows = cases.map((item) => {
    const editData: ArchiveCaseInitialData = {
      descriptionNumber: String(item.descriptionNumber),
      caseNumber: String(item.caseNumber),
      sheetsNumber: String(item.sheetsNumber),
      caseDate: item.editCaseDate,
      caseName: item.name,
      caseDescriptions: item.editCaseDescriptions,
      detailedCaseDescription: item.detailedCaseDescription,
      currentPdfFile: item.pdfFile
    };
    const toggleStatus = async () => {
      const nextStatus = item.status === BaseContentStatuses.Published ? CaseStatus.Hidden : CaseStatus.Published;
      try {
        await updateCase({ id: item.id, input: { status: nextStatus } });
        toast.success(nextStatus === CaseStatus.Published ? 'Справу успішно опубліковано' : 'Справу успішно сховано');
        await onCaseChanged?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Не вдалося змінити статус справи');
      }
    };

    return {
      type: 'individual' as const,
      id: item.id,
      plainData: {
        ...item,
        fundNumber: '',
        descriptions: '',
        cases: '',
        dates: '',
        editAction: {
          editLabel: `Редагувати справу ${item.name}`,
          onEditClick: () => setEditCase({ item, data: editData })
        },
        menuActions: {
          menuTriggerLabel: `Дії для справи ${item.name}`,
          menuItems: [
            {
              items: [
                { id: 'edit', text: { name: 'Редагувати' }, onClick: () => setEditCase({ item, data: editData }) },
                { id: 'share', text: { name: 'Поширити' }, href: `${ARCHIVE_BASE_PATH}/case/${item.id}/share` }
              ]
            },
            {
              items: [
                {
                  id: 'toggle-status',
                  text: { name: item.status === BaseContentStatuses.Published ? 'Сховати' : 'Опублікувати' },
                  onClick: toggleStatus
                },
                {
                  id: 'delete',
                  text: { name: 'Видалити' },
                  onClick: () => setDeleteState({ open: true, id: item.id, name: item.name, isCase: true })
                }
              ]
            }
          ]
        }
      }
    };
  });

  const rows = [...fundRows, ...caseRows];

  const columns: readonly ColumnDef<never, never, FundRow>[] = [
    {
      id: 'fundNumber',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.fund,
      align: 'center',
      width: '46px',
      hasRightDivider: true,
      renderPlain: (fund) => fund.fundNumber
    },
    {
      id: 'name',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.name,
      width: 'minmax(300px, 1fr)',
      renderPlain: (fund) => fund.name
    },
    {
      id: 'descriptionsCount',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.descr,
      width: '96px',
      renderPlain: (fund) => String(fund.descriptions)
    },
    {
      id: 'casesCount',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.cases,
      width: '96px',
      renderPlain: (fund) => String(fund.cases)
    },
    {
      id: 'dates',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.dates,
      width: '160px',
      renderPlain: (fund) => fund.dates
    },
    {
      id: 'status',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.status,
      width: '60px',
      align: 'center',
      hasLeftDivider: true,
      hasRightDivider: true,
      renderPlain: (fund) => <StatusBadge status={fund.status} updatedAt={fund.updatedAt} />
    },
    {
      id: 'actions',
      width: '96px',
      align: 'right',
      renderPlain: (fund) => (
        <RowActions
          editAction={{
            editLabel: fund.editAction.editLabel,
            editHref: fund.editAction.editHref,
            onEditClick: fund.editAction.onEditClick
          }}
          menuActions={fund.menuActions}
        />
      )
    }
  ];

  if (rows.length === 0) {
    const hasActiveCriteria = hasActiveSearch || hasActiveStatusFilter;

    if (!hasActiveCriteria) {
      return <EmptyState title={ARCHIVE_EMPTY_STATE_TITLE} description={ARCHIVE_EMPTY_STATE_DESCRIPTION} />;
    }

    if (hasActiveStatusFilter && !hasActiveSearch) {
      return <EmptyState title={ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE} description="" />;
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
        description={`Ви впевнені, що хочете видалити ${deleteState.isCase ? 'справу' : 'фонд'} «${deleteState.name ?? ''}»?`}
        onConfirm={async () => {
          if (!deleteState.id) return;
          if (deleteState.isCase) {
            await deleteCase({ id: deleteState.id });
          } else {
            await deleteFund({ id: deleteState.id });
          }
          setDeleteState({ open: false });
          await (deleteState.isCase ? onCaseChanged?.() : onDeleted?.());
        }}
      />
      {editCase && (
        <ArchiveCaseModal
          isOpen
          setIsOpen={(open) => {
            if (!open) setEditCase(undefined);
          }}
          mode="edit"
          initialData={editCase.data}
          fundId={editCase.item.fundId}
          caseId={editCase.item.id}
          onSaved={async () => {
            setEditCase(undefined);
            await onCaseChanged?.();
          }}
        />
      )}
    </>
  );
};
