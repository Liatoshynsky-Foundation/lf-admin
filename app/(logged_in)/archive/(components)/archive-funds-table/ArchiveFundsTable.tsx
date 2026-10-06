'use client';

import { Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { ArchiveCasesTable } from '../archive-cases-table/ArchiveCasesTable';
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
import TitleWithTooltip from '~/shared/components/card-layout/TitleWithTooltip';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import {
  CaseRowFields,
  useArchiveCaseRowActions
} from '~/shared/hooks/use-archive-case-row-actions/useArchiveCaseRowActions';
import { useDeleteCase, useDeleteFund } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ArchiveCase = {
  id: string;
  name: string;
  fundId: string;
  cipher: string;
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
  onUnpublish?: (fund: Fund) => void;
  groupCasesByFund?: boolean;
  caseToEdit?: ArchiveCase;
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const execCommand = Reflect.get(document, 'execCommand') as
      | ((commandId: string, showUI?: boolean, value?: string) => boolean)
      | undefined;

    if (!execCommand?.call(document, 'copy')) {
      throw new Error('Clipboard copy failed');
    }
  } finally {
    textArea.remove();
  }
}

export const FundsTable = ({
  funds,
  cases = [],
  hasActiveSearch,
  hasActiveStatusFilter,
  onDeleted,
  onCaseChanged,
  onPublish,
  onUnpublish,
  groupCasesByFund = false,
  caseToEdit
}: FundsTableProps) => {
  const [deleteFund] = useDeleteFund();
  const [deleteCase] = useDeleteCase();
  const [deleteState, setDeleteState] = useState<{ open: boolean; id?: string; name?: string; isCase?: boolean }>({
    open: false
  });

  const { getCaseRow, caseRowModals } = useArchiveCaseRowActions(onCaseChanged, caseToEdit);

  const shareFund = async (id: string) => {
    try {
      await copyToClipboard(`${window.location.origin}${ARCHIVE_BASE_PATH}/fund/${encodeURIComponent(id)}/edit`);
      toast.success('Посилання скопійовано в буфер обміну.');
    } catch {
      toast.error('Не вдалося скопіювати посилання. Спробуйте ще раз.');
    }
  };


  const buildFundRowData = (fund: Fund): FundRow => {
    const canPublish = fund.status === BaseContentStatuses.Hidden && Boolean(onPublish);
    const canUnpublish = fund.status === BaseContentStatuses.Published && Boolean(onUnpublish);
    const statusActions = [
      ...(canPublish ? [{ id: 'publish', text: { name: 'Опублікувати' }, onClick: () => onPublish?.(fund) }] : []),
      ...(canUnpublish ? [{ id: 'unpublish', text: { name: 'Сховати' }, onClick: () => onUnpublish?.(fund) }] : []),
      {
        id: 'delete',
        text: { name: 'Видалити' },
        onClick: () => setDeleteState({ open: true, id: fund.id, name: fund.name })
      }
    ];

    return {
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
              { id: 'share', text: { name: 'Поширити' }, onClick: () => shareFund(fund.id) }
            ]
          },
          {
            items: statusActions
          }
        ],
        menuTriggerLabel: `Дії для фонду ${fund.name}`
      }
    };
  };

  const buildOrphanCaseRowData = (caseRow: CaseRowFields): FundRow => ({
    id: caseRow.id,
    fundNumber: caseRow.cipher.replace(/^Ф\.\s*0\s*,\s*/i, ''),
    name: caseRow.name,
    descriptions: caseRow.descriptionLabel,
    cases: caseRow.caseLabel,
    dates: caseRow.caseDate,
    status: caseRow.status,
    updatedAt: caseRow.updatedAt,
    editAction: caseRow.editAction,
    menuActions: caseRow.menuActions
  });

  const renderDate = (date: string) => (
    <TitleWithTooltip text={date} lineClamp={2} fontWeight={600} fontSize={16} />
  );

  const renderFundNumber = (fundNumber: number | string) => {
    const text = typeof fundNumber === 'number' || /^\d+$/.test(fundNumber) ? `ф. ${fundNumber}` : fundNumber;

    return <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>{text}</Typography>;
  };

  const columns: readonly ColumnDef<FundRow, CaseRowFields, FundRow>[] = [
    {
      id: 'fundNumber',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.fund,
      align: 'center',
      width: '96px',
      hasRightDivider: true,
      hideSub: groupCasesByFund,
      renderGroup: (fund) => renderFundNumber(fund.fundNumber),
      renderSub: (caseRow) => caseRow.cipher,
      renderPlain: (fund) => renderFundNumber(fund.fundNumber)
    },
    {
      id: 'name',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.name,
      width: 'minmax(300px, 1fr)',
      subGridColumn: groupCasesByFund ? '1 / span 2' : undefined,
      renderGroup: (fund) => fund.name,
      renderSub: (caseRow) => caseRow.name,
      renderPlain: (fund) => fund.name
    },
    {
      id: 'dates',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.dates,
      width: '160px',
      renderGroup: (fund) => renderDate(fund.dates),
      renderSub: (caseRow) => renderDate(caseRow.caseDate),
      renderPlain: (fund) => renderDate(fund.dates)
    },
    {
      id: 'descriptionsCount',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.descr,
      width: '96px',
      renderGroup: (fund) => String(fund.descriptions),
      renderSub: (caseRow) => caseRow.descriptionLabel,
      renderPlain: (fund) => String(fund.descriptions)
    },
    {
      id: 'casesCount',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.cases,
      width: '96px',
      renderGroup: (fund) => String(fund.cases),
      renderSub: (caseRow) => caseRow.caseLabel,
      renderPlain: (fund) => String(fund.cases)
    },
    {
      id: 'status',
      headerLabel: ARCHIVE_FUNDS_TABLE_HEADERS.status,
      width: '60px',
      align: 'center',
      hasLeftDivider: true,
      hasRightDivider: true,
      renderGroup: (fund) => <StatusBadge status={fund.status} updatedAt={fund.updatedAt} />,
      renderSub: (caseRow) => <StatusBadge status={caseRow.status} updatedAt={caseRow.updatedAt} />,
      renderPlain: (fund) => <StatusBadge status={fund.status} updatedAt={fund.updatedAt} />
    },
    {
      id: 'actions',
      width: '96px',
      align: 'right',
      renderGroup: (fund) => <RowActions editAction={fund.editAction} menuActions={fund.menuActions} />,
      renderSub: (caseRow) => <RowActions editAction={caseRow.editAction} menuActions={caseRow.menuActions} />,
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

  if (funds.length === 0 && cases.length === 0) {
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

  const deleteFundOrCaseModal = (
    <DeleteCompositionModal
      open={deleteState.open}
      onClose={() => setDeleteState({ open: false })}
      title="Підтвердити видалення"
      description={
        deleteState.isCase 
          ? `Ви впевнені, що хочете видалити справу «${deleteState.name ?? ''}»?` 
          : `Видалити фонд «${deleteState.name ?? ''}»? Усі справи цього фонду також будуть видалені. Цю дію неможливо скасувати.`
      }
      onConfirm={async () => {
        if (!deleteState.id) return;
        if (deleteState.isCase) {
          try {
            await deleteCase({ id: deleteState.id });
            setDeleteState({ open: false });
            await onCaseChanged?.();
          } catch {}
        } else {
          try {
            await deleteFund({ id: deleteState.id });
            toast.success('Фонд видалено.');
            setDeleteState({ open: false });
            await onDeleted?.();
          } catch {
            toast.error('Не вдалося видалити фонд. Спробуйте ще раз.');
          }
        }
      }}
    />
  );

  if (groupCasesByFund) {
    const fundIds = new Set(funds.map((fund) => fund.id));
    const casesByFund = new Map<string, ArchiveCase[]>();
    const orphanCases: ArchiveCase[] = [];

    cases.forEach((caseItem) => {
      if (!fundIds.has(caseItem.fundId)) {
        orphanCases.push(caseItem);
        return;
      }
      const existing = casesByFund.get(caseItem.fundId) ?? [];
      existing.push(caseItem);
      casesByFund.set(caseItem.fundId, existing);
    });

    const rows: BaseRowData<FundRow, CaseRowFields, FundRow>[] = funds.map((fund) => ({
      type: 'group' as const,
      id: fund.id,
      groupData: buildFundRowData(fund),
      subRows: (casesByFund.get(fund.id) ?? []).map((caseItem) => getCaseRow(caseItem))
    }));

    orphanCases.forEach((caseItem) => {
      rows.push({
        type: 'individual' as const,
        id: caseItem.id,
        plainData: buildOrphanCaseRowData(getCaseRow(caseItem))
      });
    });

    if (rows.length === 0) {
      return null;
    }

    return (
      <>
        <TableLayout data={rows} columns={columns} offsetPlainRows />
        {deleteFundOrCaseModal}
        {caseRowModals}
      </>
    );
  }

  const fundRows: BaseRowData<FundRow, CaseRowFields, FundRow>[] = funds.map((fund) => ({
    type: 'individual' as const,
    id: fund.id,
    plainData: buildFundRowData(fund)
  }));

  return (
    <>
      {fundRows.length > 0 && (
        <>
          <TableLayout data={fundRows} columns={columns} withoutFirstColOffset />
          {deleteFundOrCaseModal}
        </>
      )}
      {cases.length > 0 && <ArchiveCasesTable cases={cases} onCaseChanged={onCaseChanged} />}
      {caseRowModals}
    </>
  );
};