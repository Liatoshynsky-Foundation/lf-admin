'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { COMPOSITION_ACTIONS_MESSAGES } from '~/constants/opus';
import {
  PaginatedWorksDocument,
  useDeleteCompositionMutation,
  useUnlinkCompositionMutation
} from '~/types/graphql/generated/graphql';

interface UseDeleteWorkActionProps {
  onSuccess?: (deletedId: string) => void;
}

export function useDeleteWorkAction({ onSuccess }: UseDeleteWorkActionProps = {}) {
  const [deleteCompositionMut, { loading: isDeleting }] = useDeleteCompositionMutation();
  const [deleteComposition, setDeleteComposition] = useState<string | null>(null);
  const [unlinkCompositionMut, { loading: isUnlinking }] = useUnlinkCompositionMutation();
  const [unlinkComposition, setUnlinkComposition] = useState<{ opusId: string; compositionId: string } | null>(null);

  const handleConfirmCompositionDelete = async () => {
    if (!deleteComposition) return;

    try {
      await deleteCompositionMut({
        variables: { id: deleteComposition },
        refetchQueries: [PaginatedWorksDocument],
        awaitRefetchQueries: true
      });

      toast.success(COMPOSITION_ACTIONS_MESSAGES.DELETE_SUCCESS);
      onSuccess?.(deleteComposition);
      setDeleteComposition(null);
    } catch {
      toast.error(COMPOSITION_ACTIONS_MESSAGES.DELETE_ERROR);
    }
  };

  const handleConfirmUnlinkComposition = async () => {
    if (!unlinkComposition) return;
    
    try {
      await unlinkCompositionMut({
        variables: {
          opusId: unlinkComposition.opusId,
          compositionId: unlinkComposition.compositionId
        },
        refetchQueries: [PaginatedWorksDocument],
        awaitRefetchQueries: true
      });

      toast.success(COMPOSITION_ACTIONS_MESSAGES.UNLINK_SUCCESS);
      onSuccess?.(unlinkComposition.compositionId);
      setUnlinkComposition(null);
    } catch {
      toast.error(COMPOSITION_ACTIONS_MESSAGES.DELETE_ERROR);
    }
  };

  return {
    deleteComposition,
    setDeleteComposition,
    unlinkComposition,
    setUnlinkComposition,
    handleConfirmCompositionDelete,
    handleConfirmUnlinkComposition,
    isDeleting,
    isUnlinking
  };
}