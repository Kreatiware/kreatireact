import { useSyncExternalStore, useCallback } from 'react';

/**
 * Hook that tracks a CSS media query match state.
 * SSR-safe — returns `false` on the server.
 *
 * @param query - CSS media query string (e.g. `'(min-width: 768px)'`)
 * @returns `true` if the query matches, `false` otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
