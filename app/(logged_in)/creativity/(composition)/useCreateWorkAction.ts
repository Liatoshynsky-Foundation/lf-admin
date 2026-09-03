'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { CompositionErrors } from '~/constants/errors';
import { COMPOSITION_MUTATION_RESULTS } from '~/constants/opus';
import { safeMutate } from '~/lib/utils/safeMutate';
import { CreateCompositionInput, CreateCompositionMutation, CreateCompositionMutationVariables, useCreateCompositionMutation } from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

interface UseCreateWorkActionResult {
  isModalOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  clearError: () => void;
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

const mapToCreateInput = (work: OpusCompositionData): CreateCompositionInput => {
  const parsedYear = work.year ? Number(work.year) : undefined;
  const isValidYear = parsedYear !== undefined && !Number.isNaN(parsedYear);
  
  return {
    name: { uk: work.name, en: work.name },
    year: isValidYear ? parsedYear : undefined,
    genre: work.genre || undefined,
    audios: work.audios.map((a) => ({
      name: a.name.trim(),
      url: a.fileUrl
    })),
    sheetMusic: work.notes.map((n) => ({
      name: n.name?.trim() || undefined,
      publishDate: n.publishDate?.trim() || undefined,
      url: n.fileUrl || null,
      isFree: n.isFree ?? false,
      dateUploaded: new Date().toISOString()
    }))
  };
};


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

  const clearError = useCallback(() => setError(null), []);

  const handleSubmit = useCallback(
    async (work: OpusCompositionData) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await createComposition(mapToCreateInput(work));
        setIsModalOpen(false);
        toast.success(COMPOSITION_MUTATION_RESULTS.created);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не вдалося створити твір. Спробуйте ще раз.';
        setError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [createComposition, router]
  );

  return { isModalOpen, isSubmitting, error, openModal, closeModal, clearError, handleSubmit };
}
