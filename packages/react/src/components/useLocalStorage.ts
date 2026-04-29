import { useSyncExternalStore, useCallback, useRef, useEffect } from "react";

/**
 * Hook that works like `useState` but persists the value in localStorage.
 * SSR-safe — returns `initialValue` on the server.
 *
 * @param key - localStorage key
 * @param initialValue - default value when key is not found
 * @returns `[value, setValue]` tuple
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('kreati-theme', 'light');
 * const [columns, setColumns] = useLocalStorage<string[]>('visible-cols', ['name', 'email']);
 * ```
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const initialRef = useRef(initialValue);

  const getSnapshot = useCallback((): string => {
    try {
      return localStorage.getItem(key) ?? JSON.stringify(initialRef.current);
    } catch {
      return JSON.stringify(initialRef.current);
    }
  }, [key]);

  const getServerSnapshot = () => JSON.stringify(initialRef.current);

  const subscribe = useCallback(
    (cb: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key]
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let value: T;
  try {
    value = JSON.parse(raw);
  } catch {
    value = initialRef.current;
  }

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      try {
        const current: T = JSON.parse(
          localStorage.getItem(key) ?? JSON.stringify(initialRef.current)
        );
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(current) : next;
        localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        /* noop */
      }
    },
    [key]
  );

  return [value, setValue];
};
