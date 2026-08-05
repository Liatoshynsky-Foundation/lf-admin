'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  PaginatedWorksDocument,
  UpdateCompositionInput,
  useUpdateCompositionMutation
} from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

const TOAST_MESSAGES = {
  UPDATE_SUCCESS: 'Твір успішно оновлено',
  UPDATE_ERROR: 'Помилка при оновленні твору'
};

const mapCompositionToUpdateInput = (composition: OpusCompositionData): UpdateCompositionInput => ({
  name: { uk: composition.name, en: composition.name },
  year: composition.year.trim() ? Number(composition.year) : undefined,
  genre: composition.genre.trim() || undefined,
  audioAvailable: composition.audios.length > 0,
  sheetAvailable: composition.notes.some((note) => Boolean(note.fileUrl)),
  audios: composition.audios.map((audio) => ({
    name: audio.name.trim(),
    url: audio.fileUrl
  })),
  sheetMusic: composition.notes.map((note) => ({
    name: note.name?.trim() || '',
    url: note.fileUrl || undefined,
    publishDate: note.publishDate?.trim() || undefined,
    isFree: false,
    dateUploaded: new Date().toISOString()
  }))
});

export function useUpdateWorkAction() {
  const router = useRouter();
  const [updateCompositionMut, { loading: isUpdating }] = useUpdateCompositionMutation();

  const handleUpdateComposition = async (id: string, composition: OpusCompositionData) => {
    try {
      await updateCompositionMut({
        variables: {
          id,
          input: mapCompositionToUpdateInput(composition)
        },
        refetchQueries: [PaginatedWorksDocument],
        awaitRefetchQueries: true
      });

      toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
      router.refresh();
    } catch (error) {
      toast.error(TOAST_MESSAGES.UPDATE_ERROR);
      throw error;
    }
  };

  return {
    handleUpdateComposition,
    isUpdating
  };
}