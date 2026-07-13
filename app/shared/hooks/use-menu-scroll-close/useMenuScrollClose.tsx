import { useCallback, useEffect, useRef } from 'react';

interface UseMenuScrollCloseOptions {
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export function useMenuScrollClose({ onClose, anchorEl }: UseMenuScrollCloseOptions) {
  const disableTransitionRef = useRef(false);
  const open = Boolean(anchorEl);

  const handleClose = useCallback(() => {
    disableTransitionRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open || !anchorEl) return;

    const handleScroll = () => {
      const rect = anchorEl.getBoundingClientRect();
      const isFullyOffscreen = rect.bottom < 0 || rect.top > window.innerHeight;

      if (isFullyOffscreen) {
        disableTransitionRef.current = true;
        onClose();
      }
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, anchorEl, onClose]);

  useEffect(() => {
    if (!open) {
      disableTransitionRef.current = false;
    }
  }, [open]);

  return {
    disableTransition: disableTransitionRef.current,
    handleClose
  };
}
