import { useRef, useState, useCallback, useEffect } from 'react';

export interface OverlayCoords {
  top: number;
  left: number;
  minWidth?: number;
}

/**
 * Hook for computing fixed position of an overlay panel relative to a trigger.
 * Handles auto-flip when near viewport edges, scroll/resize tracking,
 * and optional trigger width matching.
 */
export const useOverlayPosition = (
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: {
    position?: 'top' | 'bottom';
    offset?: number;
    matchTriggerWidth?: boolean;
  } = {},
) => {
  const { position = 'bottom', offset = 4, matchTriggerWidth = true } = options;
  const [coords, setCoords] = useState<OverlayCoords>({ top: -9999, left: -9999 });
  const [positioned, setPositioned] = useState(false);

  const compute = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const tr = trigger.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let pos = position;
    if (pos === 'bottom' && tr.bottom + offset + pr.height > vh && tr.top - offset - pr.height > 0) pos = 'top';
    else if (pos === 'top' && tr.top - offset - pr.height < 0) pos = 'bottom';

    let top = pos === 'bottom' ? tr.bottom + offset : tr.top - pr.height - offset;
    let left = tr.left;

    if (left + pr.width > vw) left = vw - pr.width - 8;
    if (left < 0) left = 8;
    if (top + pr.height > vh) top = vh - pr.height - 8;
    if (top < 0) top = 8;

    setCoords({
      top,
      left,
      minWidth: matchTriggerWidth ? tr.width : undefined,
    });
    setPositioned(true);
  }, [triggerRef, panelRef, position, offset, matchTriggerWidth]);

  useEffect(() => {
    if (!isOpen) { setPositioned(false); return; }
    const frame1 = requestAnimationFrame(() => {
      requestAnimationFrame(compute);
    });
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(frame1);
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [isOpen, compute]);

  return { coords, positioned };
};
