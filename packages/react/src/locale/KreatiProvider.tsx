import React, { createContext, useContext, useMemo } from 'react';
import type { KreatiLocale } from './types';
import { en } from './en';

interface KreatiContextValue {
  locale: KreatiLocale;
}

const KreatiContext = createContext<KreatiContextValue>({ locale: en });

export interface KreatiProviderProps {
  /** Locale object — use built-in `en`/`es` or provide a custom one */
  locale?: Partial<KreatiLocale>;
  children: React.ReactNode;
}

/**
 * Provider for global Kreati configuration.
 *
 * @description Wraps the application to provide locale strings to all
 * Kreati components. Components first check their own props, then fall
 * back to the provider locale, then to the English defaults.
 *
 * @example
 * ```tsx
 * import { KreatiProvider } from '@kreatiware/react';
 * import { es } from '@kreatiware/react/locale/es';
 *
 * <KreatiProvider locale={es}>
 *   <App />
 * </KreatiProvider>
 * ```
 */
export const KreatiProvider: React.FC<KreatiProviderProps> = ({ locale, children }) => {
  const merged = useMemo<KreatiLocale>(() => {
    if (!locale) return en;
    return {
      select: { ...en.select, ...locale.select },
      multiSelect: { ...en.multiSelect, ...locale.multiSelect },
      calendar: { ...en.calendar, ...locale.calendar },
      common: { ...en.common, ...locale.common },
    };
  }, [locale]);

  const value = useMemo(() => ({ locale: merged }), [merged]);

  return <KreatiContext.Provider value={value}>{children}</KreatiContext.Provider>;
};

/**
 * Hook to access the current Kreati locale.
 * Returns English defaults if no provider is present.
 */
export const useKreatiLocale = (): KreatiLocale => {
  return useContext(KreatiContext).locale;
};
