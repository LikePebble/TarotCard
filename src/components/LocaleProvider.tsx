"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/locale";

// A provider-less client subtree must follow the product fallback: unknown
// country codes render English, never Korean by accident.
const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
