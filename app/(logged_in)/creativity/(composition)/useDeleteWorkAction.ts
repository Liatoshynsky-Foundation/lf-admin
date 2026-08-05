'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  PaginatedWorksDocument,
  useDeleteCompositionMutation
} from '~/types/graphql/generated/graphql';

const TOAST_MESSAGES = {
  DELETE_SUCCESS: 'Твір успішно видалено',
  DELETE_ERROR: 'Помилка при видаленні твору'
};

interface UseDeleteWorkActionProps {
  onSuccess?: (deletedId: string) => void;
}

export function useDeleteWorkAction({ onSuccess }: UseDeleteWorkActionProps = {}) {
  const [deleteCompositionMut, { loading: isDeleting }] = useDeleteCompositionMutation();
  const [deleteComposition, setDeleteComposition] = useState<string | null>(null);

  const handleConfirmCompositionDelete = async () => {
    if (!deleteComposition) return;

    try {
      await deleteCompositionMut({
        variables: { id: deleteComposition },
        refetchQueries: [PaginatedWorksDocument],
        awaitRefetchQueries: true
      });

      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      onSuccess?.(deleteComposition);
      setDeleteComposition(null);
    } catch {
      toast.error(TOAST_MESSAGES.DELETE_ERROR);
    }
  };

  return {
    deleteComposition,
    setDeleteComposition,
    handleConfirmCompositionDelete,
    isDeleting
  };
}