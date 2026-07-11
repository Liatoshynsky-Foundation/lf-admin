import { useCallback, useEffect, useRef } from 'react';

interface UseMenuScrollCloseOptions {
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export function useMenuScrollClose({ onClose, anchorEl }: UseMenuScrollCloseOptions) {
  const disableTransitionRef = useRef(false);
  const initialTop = useRef<number | null>(null);

  const open = Boolean(anchorEl);

  const handleClose = useCallback(() => {
    disableTransitionRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open || !anchorEl) return;

    initialTop.current = anchorEl.getBoundingClientRect().top;

    const handleScroll = () => {
      if (initialTop.current === null) return;

      const currentTop = anchorEl.getBoundingClientRect().top;

      if (Math.abs(currentTop - initialTop.current) > 100) {
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
