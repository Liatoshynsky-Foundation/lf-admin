import { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import { styles } from './GroupWorksSection.styles';
import { WorkRow } from './WorkRow';
import Button from '~/components/design-system/button/Button';
import { OPUS_DETAILS_LABELS } from '~/constants/opus';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useCompositionsForm } from '~/shared/hooks/use-compositions/useCompositions';
import type { OpusCompositionData } from '~/types/opus';

type GroupWorksSectionProps = {
  works: OpusCompositionData[];
  onChange: (works: OpusCompositionData[]) => void;
  duplicateCompositionNames?: string[];
};

export const GroupWorksSection = ({ works, onChange, duplicateCompositionNames = [] }: GroupWorksSectionProps) => {
  const normalizeName = (name: string) => name.trim().toLocaleLowerCase('uk-UA');

  const compositionIdsByName = new Map<string, string[]>();

  works.forEach((work) => {
    const normalizedName = normalizeName(work.name);

    if (!normalizedName) return;

    const ids = compositionIdsByName.get(normalizedName) ?? [];
    ids.push(work.id);
    compositionIdsByName.set(normalizedName, ids);
  });

  const externalDuplicateNames = new Set(duplicateCompositionNames.map(normalizeName));

  const duplicateCompositionIds = new Set<string>();

  compositionIdsByName.forEach((ids, name) => {
    if (ids.length > 1 || externalDuplicateNames.has(name)) {
      ids.forEach((id) => duplicateCompositionIds.add(id));
    }
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
          {works.map((composition, index) => (
            <SortableItemWrapper key={composition.id} id={composition.id} gripHandle={true}>
              <WorkRow
                composition={composition}
                index={index}
                hasDuplicateName={duplicateCompositionIds.has(composition.id)}
                updateCompositionTitle={updateCompositionTitle}
                fillComposition={fillComposition}
                openCreateModal={openCreateModal}
                openEditModal={openEditModal}
                setDeleteTargetId={setDeleteTargetId}
              />
            </SortableItemWrapper>
          ))}
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
