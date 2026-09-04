"use client";

import { createContext, useContext, ReactNode } from "react";
import { dictionaries, Locale, TranslationKey } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ 
  children, 
  locale 
}: { 
  children: ReactNode; 
  locale: Locale 
}) {
  const t = (key: TranslationKey) => {
    return dictionaries[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
