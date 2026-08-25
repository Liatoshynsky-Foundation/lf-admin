'use client';

import { closestCenter, DndContext,type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Button, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { ArchiveCaseModal } from '../../../../(logged_in)/archive/(components)/ArchiveCaseModal';
import { styles } from './FundCasesBlock.styles';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { twoLineEllipsis } from '~/shared/components/table-layout/TableLayout.styles';
import type { ArchiveCaseInitialData } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useCasesByFundId, useDeleteCase , useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

const FUND_CASES_LABEL = 'Справи в фонді';

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
    headerLabel: '',
    width: '48px',
    align: 'center',
    hasLeftDivider: true,
    hasRightDivider: true,
    renderPlain: (row) => (
      <StatusBadge status={row.status} updatedAt={row.updatedAt} />
    )
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '96px',
    align: 'right',
    renderPlain: (row) => <RowActions editAction={row.editAction} menuActions={row.menuActions} />
  }
];

export default function FundCasesBlock({
  fundId,
  onOrderChange,
  orderSaveVersion = 0
}: Readonly<{ fundId?: string; onOrderChange?: (caseIds: string[]) => void; orderSaveVersion?: number }>) {
  const { cases, error, refetch } = useCasesByFundId(fundId);
  const [deleteCase] = useDeleteCase();
  const [updateCase] = useUpdateCase();
  const [orderedCases, setOrderedCases] = useState(cases);
  const hasPendingOrder = useRef(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    caseId?: string;
    initialData?: ArchiveCaseInitialData;
  }>({ open: false });
  const [deleteModalState, setDeleteModalState] = useState<{ open: boolean; caseId?: string; caseName?: string }>({
    open: false
  });
  useEffect(() => {
    if (!hasPendingOrder.current) {
      setOrderedCases(cases);
    }
  }, [cases]);

  useEffect(() => {
    if (orderSaveVersion > 0) {
      hasPendingOrder.current = false;
      setOrderedCases([...cases].sort((first, second) => first.order - second.order));
    }
  }, [orderSaveVersion]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = orderedCases.findIndex((item) => item.id === active.id);
    const newIndex = orderedCases.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...orderedCases];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    setOrderedCases(next);
    hasPendingOrder.current = true;
    onOrderChange?.(next.map((item) => item.id));
  };

  const rows = orderedCases.map((caseItem) => ({
    type: 'individual' as const,
    id: caseItem.id,
    plainData: {
      id: caseItem.id,
      cipher: caseItem.cipher,
      caseName: caseItem.caseName.uk,
      sheetsNumber: caseItem.sheetsNumber,
      caseDate: caseItem.caseDate.uk,
      caseDescription: caseItem.caseDescriptions.uk,
      updatedAt: caseItem.updatedAt,
      status: String(caseItem.status).toLowerCase() === CaseStatus.Published
        ? BaseContentStatuses.Published
        : BaseContentStatuses.Hidden,
      editAction: {
        editHref: undefined,
        onEditClick: () => setModalState({
          open: true,
          caseId: caseItem.id,
          initialData: {
            descriptionNumber: String(caseItem.descriptionNumber),
            caseNumber: String(caseItem.caseNumber),
            order: caseItem.order,
            sheetsNumber: String(caseItem.sheetsNumber),
            caseDate: caseItem.caseDate.uk,
            caseName: caseItem.caseName.uk,
            caseDescriptions: caseItem.caseDescriptions.uk,
            detailedCaseDescription: caseItem.detailedCaseDescription?.uk ?? '',
            currentPdfFile: caseItem.pdfFile
              ? { name: caseItem.pdfFile.filename, fileName: caseItem.pdfFile.filename, url: caseItem.pdfFile.url, mimeType: caseItem.pdfFile.mimeType }
              : undefined
          }
        }),
        editLabel: `Редагувати справу ${caseItem.caseName.uk}`
      },
      menuActions: {
        menuTriggerLabel: `Дії для справи ${caseItem.caseName.uk}`,
        menuItems: [{
          items: [
            ...(caseItem.status === CaseStatus.Draft || caseItem.status === CaseStatus.Published
              ? [{
                id: 'toggle-status',
                text: { name: caseItem.status === CaseStatus.Published ? 'Сховати' : 'Опублікувати' },
                onClick: async () => {
                  const nextStatus = caseItem.status === CaseStatus.Published ? CaseStatus.Draft : CaseStatus.Published;
                  try {
                    await updateCase({ id: caseItem.id, input: { status: nextStatus } });
                    toast.success(nextStatus === CaseStatus.Published ? 'Справу успішно опубліковано' : 'Справу успішно сховано');
                    await refetch();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Не вдалося змінити статус справи');
                  }
                }
              }]
              : []),
            {
              id: 'delete',
              text: { name: 'Видалити' },
              onClick: () => setDeleteModalState({ open: true, caseId: caseItem.id, caseName: caseItem.caseName.uk })
            }
          ]
        }]
      }
    }
  }));

  if (error) {
    return (
      <Box sx={styles.container}>
        <Typography color="error">Не вдалося завантажити справи фонду.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.title}>
          {FUND_CASES_LABEL}
        </Typography>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={styles.addButton}
          onClick={() => setModalState({ open: true })}
        >
          Додати справу
        </Button>
      </Box>

      <Box sx={styles.content}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedCases.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <TableLayout
              data={rows}
              columns={columns}
              rowWrapper={(id, children) => (
                <SortableItemWrapper id={id} gripHandle tableRow>
                  {children}
                </SortableItemWrapper>
              )}
            />
          </SortableContext>
        </DndContext>
      </Box>

      {fundId && (
        <ArchiveCaseModal
          isOpen={modalState.open}
          setIsOpen={(open: boolean) => setModalState((state) => ({ ...state, open }))}
          mode={modalState.caseId ? 'edit' : 'create'}
          initialData={modalState.initialData}
          fundId={fundId}
          caseId={modalState.caseId}
          onSaved={() => refetch()}
        />
      )}

      <DeleteCompositionModal
        open={deleteModalState.open}
        onClose={() => setDeleteModalState({ open: false })}
        title="Підтвердити видалення"
        description={`Ви впевнені, що хочете видалити справу «${deleteModalState.caseName ?? ''}»?`}
        onConfirm={async () => {
          if (!deleteModalState.caseId) return;
          await deleteCase({ id: deleteModalState.caseId });
          setDeleteModalState({ open: false });
          await refetch();
        }}
      />
    </Box>
  );
}