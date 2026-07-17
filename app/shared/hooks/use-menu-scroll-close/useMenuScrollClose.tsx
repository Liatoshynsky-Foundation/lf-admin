import { useCallback, useEffect, useState } from 'react';

interface UseMenuScrollCloseOptions {
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export function useMenuScrollClose({ onClose, anchorEl }: UseMenuScrollCloseOptions) {
  const [disableTransition, setDisableTransition] = useState(false);
  const open = Boolean(anchorEl);

  const handleClose = useCallback(() => {
    setDisableTransition(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open || !anchorEl) return;

    const handleScroll = () => {
      const rect = anchorEl.getBoundingClientRect();
      const isFullyOffscreen = rect.bottom < 0 || rect.top > window.innerHeight;

      if (isFullyOffscreen) {
        setDisableTransition(true);
        onClose();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [open, anchorEl, onClose]);

  useEffect(() => {
    if (!open) {
      setDisableTransition(false);
    }
  }, [open]);

  return { disableTransition, handleClose };
}
