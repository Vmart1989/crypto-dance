"use client";

import { createContext, useContext } from "react";
import { localizePath, normalizeLocale, translate } from "@/i18n/config";

const LanguageContext = createContext(null);

export function LanguageProvider({ initialLocale = "en", children }) {
  const locale = normalizeLocale(initialLocale);
  const value = {
    locale,
    t: (key, variables) => translate(locale, key, variables),
    href: (path) => localizePath(path, locale),
  };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
