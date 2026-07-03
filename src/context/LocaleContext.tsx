import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { type Locale, type TKey, translate } from '../i18n/strings';

const STORAGE_KEY = 'kivuko_locale';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleState | null>(null);

function loadLocale(): Locale {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'sw') return stored;
  }
  return 'sw';
}

function saveLocale(locale: Locale) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore quota
    }
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    saveLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'sw' ? 'en' : 'sw');
  }, [locale, setLocale]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'en' ? 'en' : 'sw';
    }
  }, [locale]);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
