import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton } from '@mui/material';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

import { styles } from './GroupWorksSection.styles';
import CompositionTitleInput from '~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput';
import type { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

export type SortableWorkRowProps = {
  composition: OpusCompositionData;
  index: number;
  updateCompositionTitle: (id: string, title: string) => void;
  fillComposition: (index: number, suggestion: OpusCompositionSuggestion) => void;
  openCreateModal: (index: number) => void;
  openEditModal: (index: number) => void;
  setDeleteTargetId: (id: string) => void;
};

export const SortableWorkRow = ({
  composition,
  index,
  updateCompositionTitle,
  fillComposition,
  openCreateModal,
  openEditModal,
  setDeleteTargetId
}: SortableWorkRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: composition.id
  });

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      sx={{
        ...(styles.compositionRow as object),
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <Box {...attributes} {...listeners} sx={styles.dragHandle}>
        <GripVertical size={18} strokeWidth={1.5} />
      </Box>

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
  );
};
