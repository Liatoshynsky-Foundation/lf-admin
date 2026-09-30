'use client';

import { Box, Button, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { ArchiveCaseModal } from '../../../../(logged_in)/archive/(components)/ArchiveCaseModal';
import { createCaseTableColumns } from '../../table-layout/columns/caseTableColumns';
import { styles } from './FundCasesBlock.styles';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import type { ArchiveCaseInitialData } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useCasesByFundId, useDeleteCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

const FUND_CASES_LABEL = 'Справи в фонді';

const columns = createCaseTableColumns(styles.cipherText);

export default function FundCasesBlock({ fundId }: Readonly<{ fundId?: string }>) {
  const { cases, error, refetch } = useCasesByFundId(fundId);
  const [deleteCase] = useDeleteCase();
  const [updateCase] = useUpdateCase();
  const [modalState, setModalState] = useState<{
    open: boolean;
    caseId?: string;
    initialData?: ArchiveCaseInitialData;
  }>({ open: false });
  const [deleteModalState, setDeleteModalState] = useState<{ open: boolean; caseId?: string; caseName?: string }>({
    open: false
  });

  // TODO: `order` — remnant from another PR's schema, unused for cases (no drag-and-drop here). Remove when schema is updated.
  const sortedCases = [...cases].sort((a, b) =>
    a.descriptionNumber !== b.descriptionNumber
      ? a.descriptionNumber - b.descriptionNumber
      : a.caseNumber - b.caseNumber
  );

  const rows = sortedCases.map((caseItem) => ({
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
      status: caseItem.status === CaseStatus.Published ? BaseContentStatuses.Published : BaseContentStatuses.Hidden,
      editAction: {
        editHref: undefined,
        onEditClick: () =>
          setModalState({
            open: true,
            caseId: caseItem.id,
            initialData: {
              descriptionNumber: String(caseItem.descriptionNumber),
              caseNumber: String(caseItem.caseNumber),
              sheetsNumber: String(caseItem.sheetsNumber),
              caseDate: caseItem.caseDate.uk,
              caseName: caseItem.caseName.uk,
              caseDescriptions: caseItem.caseDescriptions.uk,
              detailedCaseDescription: caseItem.detailedCaseDescription?.uk ?? '',
              currentPdfFile: caseItem.pdfFile
                ? {
                  name: caseItem.pdfFile.filename,
                  fileName: caseItem.pdfFile.filename,
                  url: caseItem.pdfFile.url,
                  mimeType: caseItem.pdfFile.mimeType
                }
                : undefined
            }
          }),
        editLabel: `Редагувати справу ${caseItem.caseName.uk}`
      },
      menuActions: {
        menuTriggerLabel: `Дії для справи ${caseItem.caseName.uk}`,
        menuItems: [
          {
            items: [
              ...(caseItem.status === CaseStatus.Draft || caseItem.status === CaseStatus.Published
                ? [
                  {
                    id: 'toggle-status',
                    text: { name: caseItem.status === CaseStatus.Published ? 'Сховати' : 'Опублікувати' },
                    onClick: async () => {
                      const nextStatus =
                          caseItem.status === CaseStatus.Published ? CaseStatus.Draft : CaseStatus.Published;
                      try {
                        await updateCase({ id: caseItem.id, input: { status: nextStatus } });
                        toast.success(
                          nextStatus === CaseStatus.Published
                            ? 'Справу успішно опубліковано'
                            : 'Справу успішно сховано'
                        );
                        await refetch();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Не вдалося змінити статус справи');
                      }
                    }
                  }
                ]
                : []),
              {
                id: 'delete',
                text: { name: 'Видалити' },
                onClick: () => setDeleteModalState({ open: true, caseId: caseItem.id, caseName: caseItem.caseName.uk })
              }
            ]
          }
        ]
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
