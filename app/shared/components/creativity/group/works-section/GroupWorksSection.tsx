import { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import { styles } from './GroupWorksSection.styles';
import { SortableWorkRow } from './SortableWorkRow';
import Button from '~/components/design-system/button/Button';
import { OPUS_DETAILS_LABELS } from '~/constants/opus';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useCompositionsForm } from '~/shared/hooks/use-compositions/useCompositions';
import type { OpusCompositionData } from '~/types/opus';

type GroupWorksSectionProps = {
  works: OpusCompositionData[];
  onChange: (works: OpusCompositionData[]) => void;
};

export const GroupWorksSection = ({ works, onChange }: GroupWorksSectionProps) => {
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
            <SortableWorkRow
              key={composition.id}
              composition={composition}
              index={index}
              updateCompositionTitle={updateCompositionTitle}
              fillComposition={fillComposition}
              openCreateModal={openCreateModal}
              openEditModal={openEditModal}
              setDeleteTargetId={setDeleteTargetId}
            />
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
