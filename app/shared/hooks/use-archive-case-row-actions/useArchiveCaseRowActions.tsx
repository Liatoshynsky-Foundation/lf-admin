'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { ArchiveCase } from '~/(logged_in)/archive/(components)/archive-funds-table/ArchiveFundsTable';
import { ArchiveCaseModal } from '~/(logged_in)/archive/(components)/ArchiveCaseModal';
import { getCaseStatusErrorMessage, showCaseStatusToast } from '~/lib/utils/caseStatus';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import type { ArchiveCaseInitialData } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useDeleteCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

export interface CaseRowFields {
  id: string;
  name: string;
  descriptionLabel: string;
  caseLabel: string;
  caseDate: string;
  cipher: string;
  status: BaseContentStatuses;
  updatedAt: string;
  editAction: { editHref?: string; editLabel: string; onEditClick?: () => void };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
}

export const useArchiveCaseRowActions = (
  onCaseChanged?: () => Promise<unknown>,
  initialCase?: ArchiveCase
) => {
  const [deleteCase] = useDeleteCase();
  const [updateCase] = useUpdateCase();
  const [deleteState, setDeleteState] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [editCase, setEditCase] = useState<{ item: ArchiveCase; data: ArchiveCaseInitialData }>();
  const openEditCase = (item: ArchiveCase) => {
    setEditCase({
      item,
      data: {
        descriptionNumber: String(item.descriptionNumber),
        caseNumber: String(item.caseNumber),
        sheetsNumber: String(item.sheetsNumber),
        caseDate: item.editCaseDate,
        caseName: item.name,
        caseDescriptions: item.editCaseDescriptions,
        detailedCaseDescription: item.detailedCaseDescription,
        currentPdfFile: item.pdfFile
      }
    });
  };

  useEffect(() => {
    if (initialCase && editCase?.item.id !== initialCase.id) {
      openEditCase(initialCase);
    }
  }, [initialCase?.id]);

  const getCaseRow = (item: ArchiveCase, fundStatus?: BaseContentStatuses): CaseRowFields => {

    const toggleStatus = async () => {
      const nextStatus = item.status === BaseContentStatuses.Published ? CaseStatus.Draft : CaseStatus.Published;
      try {
        await updateCase({ id: item.id, input: { status: nextStatus } });
        showCaseStatusToast(nextStatus, fundStatus);
        await onCaseChanged?.();
      } catch (error) {
        toast.error(getCaseStatusErrorMessage(error, nextStatus));
      }
    };

    return {
      id: item.id,
      name: item.name,
      descriptionLabel: `оп. ${item.descriptionNumber}`,
      caseLabel: `спр. ${item.caseNumber}`,
      caseDate: item.editCaseDate,
      cipher: item.cipher,
      status: item.status,
      updatedAt: item.updatedAt,
      editAction: {
        editLabel: `Редагувати справу ${item.name}`,
        onEditClick: () => openEditCase(item)
      },
      menuActions: {
        menuTriggerLabel: `Дії для справи ${item.name}`,
        menuItems: [
          {
            items: [
              { id: 'edit', text: { name: 'Редагувати' }, onClick: () => openEditCase(item) },
              {
                id: 'share',
                text: { name: 'Поширити' },
                onClick: async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}${window.location.pathname}?caseId=${encodeURIComponent(item.id)}`
                    );
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
    };
  };

  const caseRowModals = (
    <>
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
          cipher={editCase.item.cipher}
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

  return { getCaseRow, caseRowModals };
};
