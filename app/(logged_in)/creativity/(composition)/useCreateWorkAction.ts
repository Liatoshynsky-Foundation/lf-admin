'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { CompositionErrors } from '~/constants/errors';
import { COMPOSITION_MUTATION_RESULTS } from '~/constants/opus';
import { safeMutate } from '~/lib/utils/safeMutate';
import { resolveMediaName } from '~/shared/hooks/use-group-content/compositionMedia';
import { CreateCompositionInput, CreateCompositionMutation, CreateCompositionMutationVariables, useCreateCompositionMutation } from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

interface UseCreateWorkActionResult {
  isModalOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  handleSubmit: (work: OpusCompositionData) => Promise<void>;
}

const useCreateComposition = () => {
  const [mutate, meta] = useCreateCompositionMutation({
    refetchQueries: ['PaginatedWorks']
  });
  
  const createComposition = useCallback(
    async (opus: CreateCompositionInput) =>
      safeMutate<CreateCompositionMutation, CreateCompositionMutationVariables>(
        mutate,
        { input: opus },
        CompositionErrors.NETWORK_ERROR_CREATE,
        CompositionErrors.FAILED_TO_CREATE
      ),
    [mutate]
  );

  return [createComposition, meta] as const;
};

const mapToCreateInput = (work: OpusCompositionData): CreateCompositionInput => ({
  name: { uk: work.name, en: work.name },
  year: work.year ? Number(work.year) : undefined,
  genre: work.genre || undefined,
  audioAvailable: work.audios.length > 0,
  sheetAvailable: work.notes.some((n) => Boolean(n.fileUrl)),
  audios: work.audios.map((a) => ({
    name: resolveMediaName(a),
    url: a.fileUrl
  })),
  sheetMusic: work.notes.map((n) => ({
    name: resolveMediaName(n),
    publishDate: n.publishDate || '',
    url: n.fileUrl || null,
    isFree: n.isFree ?? false,
    dateUploaded: new Date().toISOString()
  }))
});

export function useCreateWorkAction(): UseCreateWorkActionResult {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [createComposition] = useCreateComposition();
  const router = useRouter(); 

  const openModal = useCallback(() => {
    setError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setError(null);
  }, [isSubmitting]);

  const handleSubmit = useCallback(
    async (work: OpusCompositionData) => {
      setIsSubmitting(true);
      setError(null);
        
      const result = await createComposition(mapToCreateInput(work));
        
      if (!result) {
        setError('Не вдалося створити твір. Спробуйте ще раз.');
        setIsSubmitting(false);
        toast.error(COMPOSITION_MUTATION_RESULTS.failed);
        return;
      }

      setIsModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
      toast.success(COMPOSITION_MUTATION_RESULTS.created);
    },
    [createComposition, router]
  );

  return { isModalOpen, isSubmitting, error, openModal, closeModal, handleSubmit };
}
