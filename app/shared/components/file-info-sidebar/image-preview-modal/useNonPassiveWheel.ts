import { useEffect } from 'react';

export function useNonPassiveWheel(
  ref: React.RefObject<HTMLElement | null>,
  opts: {
    enabled: boolean;
    onWheel: (e: WheelEvent) => void;
  }
) {
  const { enabled, onWheel } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const handler = (e: WheelEvent) => onWheel(e);

    el.addEventListener('wheel', handler, { passive: false });

    return () => {
      el.removeEventListener('wheel', handler as EventListener);
    };
  }, [ref, enabled, onWheel]);
}
