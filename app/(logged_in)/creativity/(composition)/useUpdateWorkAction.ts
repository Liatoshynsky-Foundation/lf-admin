'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import {
  PaginatedWorksDocument,
  UpdateCompositionInput,
  useUpdateCompositionMutation
} from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

interface UseUpdateWorkActionResult {
  isUpdating: boolean;
  error: string | null;
  clearError: () => void;
  handleUpdateComposition: (id: string, composition: OpusCompositionData) => Promise<boolean>;
}

const TOAST_MESSAGES = {
  UPDATE_SUCCESS: 'Твір успішно оновлено',
  UPDATE_ERROR: 'Помилка при оновленні твору'
};

const mapCompositionToUpdateInput = (composition: OpusCompositionData): UpdateCompositionInput => ({
  name: { uk: composition.name, en: composition.name },
  year: composition.year.trim() ? Number(composition.year) : undefined,
  genre: composition.genre.trim() || undefined,
  audios: composition.audios.map((audio) => ({
    name: audio.name.trim(),
    url: audio.fileUrl
  })),
  sheetMusic: composition.notes.map((note) => ({
    name: note.name?.trim() || undefined,
    url: note.fileUrl || undefined,
    publishDate: note.publishDate?.trim() || undefined,
    isFree: false,
    dateUploaded: new Date().toISOString()
  }))
});

export function useUpdateWorkAction(): UseUpdateWorkActionResult {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updateCompositionMut, { loading: isUpdating }] = useUpdateCompositionMutation();
  const clearError = useCallback(() => setError(null), []);

  const handleUpdateComposition = useCallback(
    async (id: string, composition: OpusCompositionData) => {
      setError(null);

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
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : TOAST_MESSAGES.UPDATE_ERROR;
        setError(message);
        
        toast.error(message);
        return false;
      }
    },
    [updateCompositionMut, router]
  );

  return {
    handleUpdateComposition,
    isUpdating,
    error,
    clearError
  };
}
