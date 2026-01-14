import { useCallback, useMemo, useRef, useState } from 'react';

type Point = { x: number; y: number };
type PanStart = { x: number; y: number; px: number; py: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round2 = (v: number) => Number(v.toFixed(2));

export function useZoomPan(opts?: { minZoom?: number; maxZoom?: number; step?: number; enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;

  const minZoom = opts?.minZoom ?? 1;
  const maxZoom = opts?.maxZoom ?? 4;
  const step = opts?.step ?? 0.5;

  const baseZoom = useMemo(() => clamp(1, minZoom, maxZoom), [minZoom, maxZoom]);

  const [zoom, setZoom] = useState<number>(baseZoom);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const panStart = useRef<PanStart | null>(null);

  const reset = useCallback(() => {
    setZoom(baseZoom);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
    panStart.current = null;
  }, [baseZoom]);

  const zoomIn = useCallback(() => {
    if (!enabled) return;

    setZoom((z) => {
      const next = clamp(round2(z + step), minZoom, maxZoom);
      return next;
    });
  }, [enabled, step, minZoom, maxZoom]);

  const zoomOut = useCallback(() => {
    if (!enabled) return;

    setZoom((z) => {
      const next = clamp(round2(z - step), minZoom, maxZoom);

      if (next === baseZoom) {
        setPan({ x: 0, y: 0 });
        setIsPanning(false);
        panStart.current = null;
      }

      return next;
    });
  }, [enabled, step, minZoom, maxZoom, baseZoom]);

  const onImageClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;

      e.stopPropagation();
      if (e.shiftKey) zoomOut();
      else zoomIn();
    },
    [enabled, zoomIn, zoomOut]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      if (zoom <= baseZoom) return;

      e.preventDefault();
      e.stopPropagation();

      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    },
    [enabled, zoom, baseZoom, pan.x, pan.y]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;

      const start = panStart.current;
      if (!isPanning || !start) return;

      e.preventDefault();

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      setPan({ x: start.px + dx, y: start.py + dy });
    },
    [enabled, isPanning]
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const getImageSx = useCallback(
    (base: React.CSSProperties = {}) => ({
      ...base,
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: 'center center',
      transition: isPanning ? 'none' : 'transform 120ms ease-out'
    }),
    [pan.x, pan.y, zoom, isPanning]
  );

  let containerCursor = 'default';

  if (zoom > baseZoom) {
    containerCursor = isPanning ? 'grabbing' : 'grab';
  }

  return {
    zoom,
    pan,
    isPanning,
    reset,
    zoomIn,
    zoomOut,
    onImageClick,
    onMouseDown,
    onMouseMove,
    endPan,
    getImageSx,
    containerCursor
  };
}
