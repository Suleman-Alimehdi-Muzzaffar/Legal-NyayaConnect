import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import translations, { type Lang } from './translations';
import { useAuth } from './auth-context';

const STORAGE_KEY = 'nyayaconnect.language';

interface LanguageContextValue {
  lang: Lang;
  setLanguage: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getSavedLanguage(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {}
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, token, updateUser } = useAuth();
  const [lang, setLangState] = useState<Lang>(getSavedLanguage);

  useEffect(() => {
    const saved = getSavedLanguage();
    setLangState(saved);
    document.documentElement.lang = saved;
  }, []);

  const setLanguage = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;

    if (user && token) {
      fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: l }),
      }).catch(() => {});
      updateUser({ language: l });
    }
  }, [user, token, updateUser]);

  const t = useCallback((key: string): string => {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLanguage, t }), [lang, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
