'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';

export interface UseShareOptions {
  message?: { success?: string; error?: string };
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const DEFAULT_MESSAGES = {
  SUCCESS: 'Cкопійовано в буфер обміну.',
  ERROR: 'Не вдалося скопіювати. Спробуйте ще раз.'
};

export function useShare({
  message,
  onSuccess,
  onError
}: UseShareOptions = {}) {
  const successMessage = message?.success ?? DEFAULT_MESSAGES.SUCCESS;
  const errorMessage = message?.error ?? DEFAULT_MESSAGES.ERROR;

  const handleShare = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
        onSuccess?.();
      } catch (error) {
        toast.error(errorMessage);
        onError?.(error);
      }
    },
    [successMessage, errorMessage, onSuccess, onError]
  );

  return {
    handleShare
  };
}