import { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import { styles } from './GroupWorksSection.styles';
import { WorkRow } from './WorkRow';
import Button from '~/components/design-system/button/Button';
import { COMPOSITION_DUPLICATE_INPUT_ERROR, OPUS_DETAILS_LABELS } from '~/constants/opus';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { getExcludedSuggestionIds, useCompositionsForm } from '~/shared/hooks/use-compositions/useCompositions';
import type { OpusCompositionData } from '~/types/opus';

type GroupWorksSectionProps = {
  works: OpusCompositionData[];
  onChange: (works: OpusCompositionData[]) => void;
  compositionErrors?: Record<string, string>;
};

export const GroupWorksSection = ({ works, onChange, compositionErrors = {} }: GroupWorksSectionProps) => {
  const normalizeName = (name: string) => name.trim().toLocaleLowerCase('uk-UA');
  const compositionIdsByName = new Map<string, string[]>();
  const compositionFieldErrors = { ...compositionErrors };

  works.forEach((work) => {
    const normalizedName = normalizeName(work.name);

    if (!normalizedName) return;

    const ids = compositionIdsByName.get(normalizedName) ?? [];
    ids.push(work.id);
    compositionIdsByName.set(normalizedName, ids);
  });

  compositionIdsByName.forEach((ids) => {
    if (ids.length < 2) return;

    ids.forEach((id, index) => {
      const fieldPath = `compositions.${id}.name`;
      compositionFieldErrors[fieldPath] ??= index === 0 ? '' : COMPOSITION_DUPLICATE_INPUT_ERROR;
    });
  });

  const {
    isModalOpen,
    modalMode,
    editingIndex,
    deleteTargetId,
    setDeleteTargetId,
    addComposition,
    openCreateModal,
    openEditModal,
    closeModal,
    updateCompositionTitle,
    fillComposition,
    handleModalSubmit,
    handleDeleteConfirm
  } = useCompositionsForm(works, onChange);

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, works, onChange);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.compositionsHeader}>
        <Typography sx={styles.compositionsTitle}>{OPUS_DETAILS_LABELS.compositions}</Typography>
        <Box sx={styles.compositionsDivider} />
        <Button variant="outlined" sx={styles.addBtnTop} onClick={addComposition}>
          {OPUS_DETAILS_LABELS.addComposition}
        </Button>
      </Box>

      <Box sx={styles.compositionsList}>
        <SortableList id="group-works-list" items={works.map((work) => work.id)} onDragEnd={handleDragEnd}>
          {works.map((composition, index) => {
            const fieldError = compositionFieldErrors[`compositions.${composition.id}.name`];

            return (
              <SortableItemWrapper key={composition.id} id={composition.id} gripHandle={true}>
                <WorkRow
                  composition={composition}
                  index={index}
                  error={fieldError || undefined}
                  hasError={fieldError !== undefined}
                  excludedSuggestionIds={getExcludedSuggestionIds(works, index)}
                  updateCompositionTitle={updateCompositionTitle}
                  fillComposition={fillComposition}
                  openCreateModal={openCreateModal}
                  openEditModal={openEditModal}
                  setDeleteTargetId={setDeleteTargetId}
                />
              </SortableItemWrapper>
            );
          })}
        </SortableList>
      </Box>

      {isModalOpen && (
        <CompositionModal
          open={isModalOpen}
          mode={modalMode}
          initialValue={editingIndex !== null ? works[editingIndex] : undefined}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      )}

      <DeleteCompositionModal
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};
