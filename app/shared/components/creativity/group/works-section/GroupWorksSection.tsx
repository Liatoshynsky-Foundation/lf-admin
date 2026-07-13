import { Box, IconButton, Typography } from '@mui/material';
import { Pencil, Trash2 } from 'lucide-react';

import { styles } from './GroupWorksSection.styles';
import Button from '~/components/design-system/button/Button';
import { OPUS_DETAILS_LABELS } from '~/constants/opus';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import CompositionTitleInput from '~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput';
import { useCompositions } from '~/shared/hooks/use-compositions/useCompositions';
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
  } = useCompositions(works, onChange);

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
        {works.map((composition, index) => (
          <Box
            key={composition.id}
            sx={{
              ...(styles.compositionRow as object)
            }}
          >
            <Box sx={styles.compositionInput}>
              <CompositionTitleInput
                value={composition.title}
                onChangeText={(title) => updateCompositionTitle(composition.id, title)}
                onSelectSuggestion={(suggestion) => fillComposition(index, suggestion)}
                onCreateNew={() => openCreateModal(index)}
              />
            </Box>

            <IconButton aria-label="Редагувати" onClick={() => openEditModal(index)} sx={styles.rowIcon}>
              <Pencil size={18} strokeWidth={1.5} />
            </IconButton>
            <IconButton aria-label="Видалити" onClick={() => setDeleteTargetId(composition.id)} sx={styles.rowIcon}>
              <Trash2 size={18} strokeWidth={1.5} />
            </IconButton>
          </Box>
        ))}
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
