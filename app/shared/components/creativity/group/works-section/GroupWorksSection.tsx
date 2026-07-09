import { Box, IconButton, Typography } from '@mui/material';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { styles } from './GroupWorksSection.styles';
import Button from '~/components/design-system/button/Button';
import { OPUS_DETAILS_LABELS } from '~/constants/opus';
import { DeleteCompositionModal } from '~/shared/components/delete-composition-modal/DeleteCompositionModal';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import CompositionTitleInput from '~/shared/components/forms/opus-details-block/composition-title-input/CompositionTitleInput';
import { createCompositionId } from '~/shared/hooks/use-group-content/useGroupContent';
import type { OpusCompositionData, OpusCompositionSuggestion, OpusMediaFileData } from '~/types/opus';

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return '';
  const segment = url.split('/').pop() ?? url;
  return decodeURIComponent(segment.split('?')[0]);
};

type AudioItem = NonNullable<OpusCompositionSuggestion['audios']>[number];
type SheetMusicItem = NonNullable<OpusCompositionSuggestion['sheetMusic']>[number];

export const toSuggestionAudio = (audio: AudioItem): OpusMediaFileData => {
  return {
    id: createCompositionId(),
    name: audio.name ?? fileNameFromUrl(audio.url),
    fileUrl: audio.url ?? undefined
  };
};

export const toSuggestionNote = (sheet: SheetMusicItem): OpusMediaFileData => {
  return {
    id: createCompositionId(),
    name: sheet.name ?? fileNameFromUrl(sheet.url),
    fileUrl: sheet.url ?? undefined,
    publishDate: sheet.publishDate ?? ''
  };
};

type GroupWorksSectionProps = {
  works: OpusCompositionData[];
  onChange: (works: OpusCompositionData[]) => void;
};

export const GroupWorksSection = ({ works, onChange }: GroupWorksSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const addComposition = () => {
    const newComposition: OpusCompositionData = {
      id: `composition-${Date.now()}`,
      title: '',
      genre: '',
      year: '',
      audios: [],
      notes: []
    };
    onChange([...works, newComposition]);
  };

  const openCreateModal = (index: number) => {
    setModalMode('create');
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setModalMode('edit');
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const updateCompositionTitle = (id: string, title: string) => {
    const updatedWorks = works.map((item) => (item.id === id ? { ...item, title } : item));
    onChange(updatedWorks);
  };

  const fillComposition = (index: number, suggestion: OpusCompositionSuggestion) => {
    const updatedWorks = [...works];
    updatedWorks[index] = {
      ...updatedWorks[index],
      compositionId: suggestion.id,
      title: suggestion.title?.uk ?? suggestion.title?.en ?? '',
      genre: suggestion.genre ?? '',
      year: suggestion.year == null ? '' : String(suggestion.year),
      audios: (suggestion.audios ?? []).map(toSuggestionAudio),
      notes: (suggestion.sheetMusic ?? []).map(toSuggestionNote)
    };
    onChange(updatedWorks);
  };

  const handleModalSubmit = (compositionData: OpusCompositionData) => {
    const updatedWorks = [...works];
    if (editingIndex !== null) {
      updatedWorks[editingIndex] = compositionData;
    }
    onChange(updatedWorks);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      const updatedWorks = works.filter((item) => item.id !== deleteTargetId);
      onChange(updatedWorks);
    }
    setDeleteTargetId(null);
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
          onClose={() => setIsModalOpen(false)}
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
