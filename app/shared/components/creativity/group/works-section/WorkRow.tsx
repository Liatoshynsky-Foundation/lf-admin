import { Box, IconButton } from '@mui/material';
import { Pencil, Trash2 } from 'lucide-react';

import { styles } from './GroupWorksSection.styles';
import CompositionTitleInput from '~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput';
import type { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

export type WorkRowProps = {
  composition: OpusCompositionData;
  index: number;
  hasDuplicateName?: boolean;
  hasNameError?: boolean;
  excludedSuggestionIds?: string[];
  updateCompositionTitle: (id: string, title: string) => void;
  fillComposition: (index: number, suggestion: OpusCompositionSuggestion) => void;
  openCreateModal: (index: number) => void;
  openEditModal: (index: number) => void;
  setDeleteTargetId: (id: string) => void;
};

export const WorkRow = ({
  composition,
  index,
  hasDuplicateName = false,
  hasNameError = false,
  excludedSuggestionIds = [],
  updateCompositionTitle,
  fillComposition,
  openCreateModal,
  openEditModal,
  setDeleteTargetId
}: WorkRowProps) => {
  return (
    <>
      <Box sx={styles.compositionInput}>
        <CompositionTitleInput
          value={composition.name}
          error={hasDuplicateName || hasNameError}
          excludedSuggestionIds={excludedSuggestionIds}
          onChangeText={(name) => updateCompositionTitle(composition.id, name)}
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
    </>
  );
};
