"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, createT, type Locale, type T } from "@/lib/i18n";

const I18nContext = createContext<T>(createT(DEFAULT_LOCALE));

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
    const t = useMemo(() => createT(locale), [locale]);

    return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
}

export function useT() {
    return useContext(I18nContext);
}
