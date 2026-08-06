'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import {
  UpdateCompositionInput,
  useUpdateCompositionMutation
} from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

interface UseUpdateWorkActionResult {
  isUpdating: boolean;
  error: string | null;
  handleUpdateComposition: (id: string, composition: OpusCompositionData) => Promise<void>;
}

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

export function useUpdateWorkAction(): UseUpdateWorkActionResult {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updateCompositionMut, { loading: isUpdating }] = useUpdateCompositionMutation();

  const handleUpdateComposition = useCallback(
    async (id: string, composition: OpusCompositionData) => {
      setError(null);
      try {
        await updateCompositionMut({
          variables: {
            id,
            input: mapCompositionToUpdateInput(composition)
          }
        });
        toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : TOAST_MESSAGES.UPDATE_ERROR;
        setError(message);
        toast.error(`Помилка: ${message}`);
        throw err;
      }
    },
    [updateCompositionMut, router]
  );

  return {
    handleUpdateComposition,
    isUpdating,
    error
  };
}