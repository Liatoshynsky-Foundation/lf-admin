import { useState } from 'react';

import { createCompositionId } from '~/shared/hooks/use-group-content/useGroupContent';
import type { OpusCompositionData, OpusCompositionSuggestion, OpusMediaFileData } from '~/types/opus';

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return '';
  const segment = url.split('/').pop() as string;
  return decodeURIComponent(segment.split('?')[0]);
};

type AudioItem = NonNullable<OpusCompositionSuggestion['audios']>[number];
type SheetMusicItem = NonNullable<OpusCompositionSuggestion['sheetMusic']>[number];

export const toSuggestionAudio = (audio: AudioItem): OpusMediaFileData => {
  return {
    id: createCompositionId(),
    name: audio.name || fileNameFromUrl(audio.url),
    fileUrl: audio.url ?? undefined
  };
};

export const toSuggestionNote = (sheet: SheetMusicItem): OpusMediaFileData => {
  return {
    id: createCompositionId(),
    name: sheet.name || fileNameFromUrl(sheet.url),
    fileUrl: sheet.url ?? undefined,
    publishDate: sheet.publishDate ?? ''
  };
};

export const useCompositions = (works: OpusCompositionData[], onChange: (works: OpusCompositionData[]) => void) => {
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

  const closeModal = () => {
    setIsModalOpen(false);
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

  return {
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
  };
};
