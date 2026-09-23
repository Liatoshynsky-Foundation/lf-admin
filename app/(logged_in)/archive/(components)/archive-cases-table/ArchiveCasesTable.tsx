'use client';

import { Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import type { ArchiveCase } from '../archive-funds-table/ArchiveFundsTable';
import { ArchiveCaseModal } from '../ArchiveCaseModal';
import { styles } from './ArchiveCasesTable.styles';
import { ARCHIVE_BASE_PATH } from '~/constants/archive';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { twoLineEllipsis } from '~/shared/components/table-layout/TableLayout.styles';
import type { ArchiveCaseInitialData } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useDeleteCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

type CaseRow = {
  id: string;
  cipher: string;
  caseName: string;
  sheetsNumber: number;
  caseDate: string;
  caseDescription: string;
  updatedAt: string;
  status: BaseContentStatuses;
  editAction: { editHref?: string; editLabel: string; onEditClick?: () => void };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

const columns: readonly ColumnDef<never, never, CaseRow>[] = [
  {
    id: 'cipher',
    headerLabel: 'Шифр',
    width: '120px',
    align: 'left',
    renderPlain: (row) => (
      <Typography component="span" sx={styles.cipherText}>
        {row.cipher}
      </Typography>
    )
  },
  {
    id: 'caseName',
    headerLabel: 'Назва справи',
    width: 'minmax(260px, 1fr)',
    align: 'left',
    renderPlain: (row) => row.caseName
  },
  {
    id: 'sheetsNumber',
    headerLabel: 'Аркуші',
    width: '84px',
    align: 'left',
    renderPlain: (row) => row.sheetsNumber
  },
  {
    id: 'caseDate',
    headerLabel: 'Дати',
    width: '110px',
    align: 'left',
    renderPlain: (row) => row.caseDate
  },
  {
    id: 'caseDescription',
    headerLabel: 'Склад і зміст документів',
    width: 'minmax(240px, 1fr)',
    align: 'left',
    renderPlain: (row) => <Typography sx={twoLineEllipsis}>{row.caseDescription}</Typography>
  },
  {
    id: 'publishedAt',
    headerLabel: 'Статус',
    width: '60px',
    align: 'center',
    hasLeftDivider: true,
    hasRightDivider: true,
    renderPlain: (row) => <StatusBadge status={row.status} updatedAt={row.updatedAt} />
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '96px',
    align: 'right',
    renderPlain: (row) => <RowActions editAction={row.editAction} menuActions={row.menuActions} />
  }
];

export interface ArchiveCasesTableProps {
  cases: ArchiveCase[];
  onCaseChanged?: () => Promise<unknown>;
}

export const ArchiveCasesTable = ({ cases, onCaseChanged }: ArchiveCasesTableProps) => {
  const [deleteCase] = useDeleteCase();
  const [updateCase] = useUpdateCase();
  const [deleteState, setDeleteState] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [editCase, setEditCase] = useState<{ item: ArchiveCase; data: ArchiveCaseInitialData }>();

  const rows = cases.map((item) => {
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
      const nextStatus = item.status === BaseContentStatuses.Published ? CaseStatus.Draft : CaseStatus.Published;
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
        id: item.id,
        cipher: item.cipher,
        caseName: item.name,
        sheetsNumber: item.sheetsNumber,
        caseDate: item.editCaseDate,
        caseDescription: item.editCaseDescriptions,
        updatedAt: item.updatedAt,
        status: item.status,
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
                  onClick: () => setDeleteState({ open: true, id: item.id, name: item.name })
                }
              ]
            }
          ]
        }
      }
    };
  });

  return (
    <>
      <TableLayout data={rows} columns={columns} withoutFirstColOffset={true} />
      <DeleteCompositionModal
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false })}
        title="Підтвердити видалення"
        description={`Ви впевнені, що хочете видалити справу «${deleteState.name ?? ''}»?`}
        onConfirm={async () => {
          if (!deleteState.id) return;
          await deleteCase({ id: deleteState.id });
          setDeleteState({ open: false });
          await onCaseChanged?.();
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
