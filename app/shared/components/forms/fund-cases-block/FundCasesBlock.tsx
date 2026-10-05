'use client';

import { Box, Button, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { ArchiveCaseModal } from '../../../../(logged_in)/archive/(components)/ArchiveCaseModal';
import { createCaseTableColumns } from '../../table-layout/columns/caseTableColumns';
import { styles } from './FundCasesBlock.styles';
import { ARCHIVE_ITEMS_PER_PAGE } from '~/constants/archive';
import { buildArchiveCaseShareUrl } from '~/lib/utils/archiveCaseShare';
import { getCaseStatusErrorMessage, showCaseStatusToast } from '~/lib/utils/caseStatus';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { Pagination } from '~/shared/components/pagination/Pagination';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import type { ArchiveCaseInitialData } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useCasesByFundId, useDeleteCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

const FUND_CASES_LABEL = 'Справи в фонді';
const DELETE_CASE_SUCCESS_MESSAGE = 'Справу видалено.';
const DELETE_CASE_ERROR_MESSAGE = 'Не вдалося видалити справу. Спробуйте ще раз.';

const columns = createCaseTableColumns();

type CaseItem = NonNullable<ReturnType<typeof useCasesByFundId>['cases']>[number];

const toInitialData = (c: CaseItem): ArchiveCaseInitialData => ({
  descriptionNumber: String(c.descriptionNumber),
  caseNumber: String(c.caseNumber),
  sheetsNumber: String(c.sheetsNumber),
  caseDate: c.caseDate.uk,
  caseName: c.caseName.uk,
  caseDescriptions: c.caseDescriptions.uk,
  detailedCaseDescription: c.detailedCaseDescription?.uk ?? '',
  currentPdfFile: c.pdfFile
    ? {
      name: c.pdfFile.filename,
      fileName: c.pdfFile.filename,
      url: c.pdfFile.url,
      mimeType: c.pdfFile.mimeType
    }
    : undefined
});

export default function FundCasesBlock({
  fundId,
  fundStatus,
  onCaseChanged
}: Readonly<{
  fundId?: string;
  fundStatus?: BaseContentStatuses;
  onCaseChanged?: () => Promise<unknown>;
}>) {
  const { cases, loading, error, refetch } = useCasesByFundId(fundId);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sharedCaseId = searchParams.get('caseId');
  const [deleteCase] = useDeleteCase();
  const [updateCase] = useUpdateCase();
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState<{
    open: boolean;
    caseId?: string;
    cipher?: string;
    initialData?: ArchiveCaseInitialData;
  }>({ open: false });

  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    caseId?: string;
    caseName?: string;
  }>({
    open: false
  });

  // TODO: `order` — remnant from another PR's schema, unused for cases (no drag-and-drop here). Remove when schema is updated.
  const sortedCases = [...cases].sort((a, b) =>
    a.descriptionNumber !== b.descriptionNumber
      ? a.descriptionNumber - b.descriptionNumber
      : a.caseNumber - b.caseNumber
  );

  const totalPages = Math.ceil(sortedCases.length / ARCHIVE_ITEMS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  useEffect(() => {
    setPage(1);
  }, [fundId]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  const clearSharedCaseId = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('caseId');
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const openEditModal = useCallback(
    (c: CaseItem) =>
      setModalState({
        open: true,
        caseId: c.id,
        cipher: c.cipher,
        initialData: toInitialData(c)
      }),
    []
  );

  const openDeleteModal = (c: CaseItem) => setDeleteModalState({ open: true, caseId: c.id, caseName: c.caseName.uk });

  useEffect(() => {
    if (!sharedCaseId || !fundId || loading) return;

    const sharedCase = cases.find((c) => c.id === sharedCaseId);
    if (!sharedCase) {
      toast.error('Справу не знайдено');
      clearSharedCaseId();
      return;
    }

    openEditModal(sharedCase);
    clearSharedCaseId();
  }, [cases, clearSharedCaseId, fundId, loading, openEditModal, sharedCaseId]);

  const buildMenuItems = (c: CaseItem) => {
    const deleteItem = {
      id: 'delete',
      text: { name: 'Видалити' },
      onClick: () => openDeleteModal(c)
    };

    if (c.status !== CaseStatus.Draft && c.status !== CaseStatus.Published) {
      return [{ items: [deleteItem] }];
    }

    const isPublished = c.status === CaseStatus.Published;
    const nextStatus = isPublished ? CaseStatus.Draft : CaseStatus.Published;

    return [
      {
        items: [
          { id: 'edit', text: { name: 'Редагувати' }, onClick: () => openEditModal(c) },
          {
            id: 'share',
            text: { name: 'Поширити' },
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(buildArchiveCaseShareUrl(window.location.origin, c.id, fundId));
                toast.success('Посилання скопійовано в буфер обміну.');
              } catch {
                toast.error('Не вдалося скопіювати посилання. Спробуйте ще раз.');
              }
            }
          }
        ]
      },
      {
        items: [
          {
            id: 'toggle-status',
            text: { name: isPublished ? 'Сховати' : 'Опублікувати' },
            onClick: async () => {
              try {
                await updateCase({ id: c.id, input: { status: nextStatus } });
                showCaseStatusToast(nextStatus, fundStatus);
                await refetch();
              } catch (err) {
                toast.error(getCaseStatusErrorMessage(err, nextStatus));
              }
            }
          },
          deleteItem
        ]
      }
    ];
  };

  const rows = sortedCases
    .slice((currentPage - 1) * ARCHIVE_ITEMS_PER_PAGE, currentPage * ARCHIVE_ITEMS_PER_PAGE)
    .map((c) => ({
      type: 'individual' as const,
      id: c.id,
      plainData: {
        id: c.id,
        cipher: c.cipher,
        caseName: c.caseName.uk,
        sheetsNumber: c.sheetsNumber,
        caseDate: c.caseDate.uk,
        caseDescription: c.caseDescriptions.uk,
        updatedAt: c.updatedAt,
        status: c.status === CaseStatus.Published ? BaseContentStatuses.Published : BaseContentStatuses.Hidden,
        editAction: {
          editHref: undefined,
          onEditClick: () => openEditModal(c),
          editLabel: `Редагувати справу ${c.caseName.uk}`
        },
        menuActions: {
          menuTriggerLabel: `Дії для справи ${c.caseName.uk}`,
          menuItems: buildMenuItems(c)
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
        <TableLayout data={rows} columns={columns} withoutFirstColOffset={true} />
      </Box>

      {totalPages > 1 && (
        <Box sx={styles.pagination}>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(_, nextPage) => setPage(nextPage)}
          />
        </Box>
      )}

      {fundId && (
        <ArchiveCaseModal
          isOpen={modalState.open}
          setIsOpen={(open: boolean) => {
            setModalState((state) => ({ ...state, open }));
            if (!open) clearSharedCaseId();
          }}
          mode={modalState.caseId ? 'edit' : 'create'}
          cipher={modalState.cipher}
          initialData={modalState.initialData}
          fundId={fundId}
          caseId={modalState.caseId}
          onSaved={async () => {
            clearSharedCaseId();
            await refetch();
            await onCaseChanged?.();
          }}
        />
      )}

      <DeleteCompositionModal
        open={deleteModalState.open}
        onClose={() => setDeleteModalState({ open: false })}
        title="Підтвердити видалення"
        description={`Ви впевнені, що хочете видалити справу «${deleteModalState.caseName ?? ''}»?`}
        onConfirm={async () => {
          if (!deleteModalState.caseId) return;
          try {
            await deleteCase({ id: deleteModalState.caseId });
            setDeleteModalState({ open: false });
            await refetch();
            await onCaseChanged?.();
            toast.success(DELETE_CASE_SUCCESS_MESSAGE);
          } catch {
            toast.error(DELETE_CASE_ERROR_MESSAGE);
          }
        }}
      />
    </Box>
  );
}
