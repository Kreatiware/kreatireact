import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { KreatiLocale } from "./types";
import { en } from "./en";

/** Available built-in theme names */
export type KreatiTheme =
  | "light"
  | "dark"
  | "midnight"
  | "abyss"
  | "soft"
  | "arctic"
  | "high-contrast"
  | "kreati"
  | (string & NonNullable<unknown>);

interface KreatiContextValue {
  locale: KreatiLocale;
  theme: KreatiTheme;
  setTheme: (theme: KreatiTheme) => void;
  resolvedTheme: KreatiTheme;
}

const KreatiContext = createContext<KreatiContextValue>({
  locale: en,
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
});

export interface KreatiProviderProps {
  /** Locale object — use built-in `en`/`es` or provide a custom one */
  locale?: Partial<KreatiLocale>;
  /** Theme name. Use `"auto"` to follow system preference (light/dark). Default: `"light"` */
  theme?: KreatiTheme | "auto";
  /** Dark theme to use when `theme="auto"` and system prefers dark. Default: `"dark"` */
  darkTheme?: KreatiTheme;
  children: React.ReactNode;
}

/**
 * Provider for global Kreati configuration.
 *
 * @description Wraps the application to provide locale and theme to all
 * Kreati components. Supports automatic dark mode detection via `theme="auto"`.
 *
 * @example
 * ```tsx
 * import { KreatiProvider, es } from '@kreatiware/react';
 * import '@kreatiware/react/themes/dark.css';
 *
 * <KreatiProvider locale={es} theme="auto">
 *   <App />
 * </KreatiProvider>
 * ```
 */
export const KreatiProvider: React.FC<KreatiProviderProps> = ({
  locale,
  theme = "light",
  darkTheme = "dark",
  children,
}) => {
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [manualTheme, setManualTheme] = useState<KreatiTheme | "auto">(theme);

  useEffect(() => {
    setManualTheme(theme);
  }, [theme]);

  const resolvedTheme = useMemo<KreatiTheme>(() => {
    if (manualTheme === "auto") return systemDark ? darkTheme : "light";
    return manualTheme;
  }, [manualTheme, systemDark, darkTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-kreati-theme", resolvedTheme);
    return () => document.documentElement.removeAttribute("data-kreati-theme");
  }, [resolvedTheme]);

  const setTheme = useCallback((t: KreatiTheme) => setManualTheme(t), []);

  const merged = useMemo<KreatiLocale>(() => {
    if (!locale) return en;
    return {
      select: { ...en.select, ...locale.select },
      multiSelect: { ...en.multiSelect, ...locale.multiSelect },
      calendar: { ...en.calendar, ...locale.calendar },
      slider: { ...en.slider, ...locale.slider },
      message: { ...en.message, ...locale.message },
      toast: { ...en.toast, ...locale.toast },
      dial: { ...en.dial, ...locale.dial },
      rating: { ...en.rating, ...locale.rating },
      colorPicker: { ...en.colorPicker, ...locale.colorPicker },
      fileUpload: { ...en.fileUpload, ...locale.fileUpload },
      pagination: { ...en.pagination, ...locale.pagination },
      list: { ...en.list, ...locale.list },
      dialog: { ...en.dialog, ...locale.dialog },
      common: { ...en.common, ...locale.common },
      itemPicker: { ...en.itemPicker, ...locale.itemPicker },
      dataTable: { ...en.dataTable, ...locale.dataTable },
      emptyState: { ...en.emptyState, ...locale.emptyState },
      textEditor: { ...en.textEditor, ...locale.textEditor },
      avatarGroup: { ...en.avatarGroup, ...locale.avatarGroup },
      kanban: { ...en.kanban, ...locale.kanban },
      chart: { ...en.chart, ...locale.chart },
      gantt: { ...en.gantt, ...locale.gantt },
      documentViewer: { ...en.documentViewer, ...locale.documentViewer },
      qrCode: { ...en.qrCode, ...locale.qrCode },
      barcode: { ...en.barcode, ...locale.barcode },
    };
  }, [locale]);

  const value = useMemo(
    () => ({
      locale: merged,
      theme: manualTheme === "auto" ? ("auto" as KreatiTheme) : manualTheme,
      setTheme,
      resolvedTheme,
    }),
    [merged, manualTheme, setTheme, resolvedTheme]
  );

  return (
    <KreatiContext.Provider value={value}>{children}</KreatiContext.Provider>
  );
};

/**
 * Hook to access the current Kreati locale.
 * Returns English defaults if no provider is present.
 */
export const useKreatiLocale = (): KreatiLocale => {
  return useContext(KreatiContext).locale;
};

/**
 * Hook to access and control the current Kreati theme.
 *
 * @returns `{ theme, setTheme, resolvedTheme }`
 * - `theme`: The value passed to the provider (may be `"auto"`)
 * - `resolvedTheme`: The actual applied theme (never `"auto"`)
 * - `setTheme`: Function to change the theme programmatically
 *
 * @example
 * ```tsx
 * const { resolvedTheme, setTheme } = useKreatiTheme();
 * <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
 *   Toggle theme
 * </button>
 * ```
 */
export const useKreatiTheme = () => {
  const { theme, setTheme, resolvedTheme } = useContext(KreatiContext);
  return { theme, setTheme, resolvedTheme };
};
