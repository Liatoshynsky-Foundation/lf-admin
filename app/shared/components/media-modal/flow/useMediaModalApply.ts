'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { MediaModalResult } from '../MediaModal.types';

type Args = {
  open: boolean;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void | Promise<void>;
};

type Return = {
  isApplying: boolean;
  applyError: string | null;
  clearApplyState: () => void;
  clearApplyError: () => void;
  cancelInFlightApply: () => void;
  handleClose: () => void;
  runApply: (result: MediaModalResult) => Promise<void>;
};

export function useMediaModalApply({ open, onClose, onApply }: Readonly<Args>): Return {
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const applySeqRef = useRef(0);

  const clearApplyState = useCallback(() => {
    setIsApplying(false);
    setApplyError(null);
  }, []);

  const clearApplyError = useCallback(() => {
    setApplyError(null);
  }, []);

  const cancelInFlightApply = useCallback(() => {
    applySeqRef.current += 1;
    clearApplyState();
  }, [clearApplyState]);

  const handleClose = useCallback(() => {
    cancelInFlightApply();
    onClose();
  }, [cancelInFlightApply, onClose]);

  const runApply = useCallback(
    async (result: MediaModalResult): Promise<void> => {
      if (isApplying) return;

      const seq = ++applySeqRef.current;
      const isCurrent = () => applySeqRef.current === seq && openRef.current;

      setIsApplying(true);
      setApplyError(null);

      try {
        await onApply(result);

        if (isCurrent()) {
          handleClose();
        }
      } catch (e: unknown) {
        if (isCurrent()) {
          setApplyError(e instanceof Error ? e.message : 'Не вдалося застосувати зміни. Спробуйте ще раз.');
        }
      } finally {
        if (isCurrent()) {
          setIsApplying(false);
        }
      }
    },
    [handleClose, isApplying, onApply]
  );

  return {
    isApplying,
    applyError,
    clearApplyState,
    clearApplyError,
    cancelInFlightApply,
    handleClose,
    runApply
  };
}
