import { useCallback, useEffect, useState } from 'react';

interface UseMenuScrollCloseOptions {
  open: boolean;
  onClose: () => void;
}

export function useMenuScrollClose({ open, onClose }: UseMenuScrollCloseOptions) {
  const [disableTransition, setDisableTransition] = useState(false);

  const handleClose = useCallback(() => {
    setDisableTransition(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setDisableTransition(true);
      onClose();
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, onClose]);

  return {
    disableTransition,
    handleClose
  };
}
