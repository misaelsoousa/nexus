import { en } from "./locales/en";

export type Locale = "pt" | "en";

export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "nexus-locale";

export const LOCALES: { value: Locale; label: string; htmlLang: string; intl: string }[] = [
    { value: "pt", label: "Português", htmlLang: "pt-BR", intl: "pt-BR" },
    { value: "en", label: "English", htmlLang: "en", intl: "en-US" },
];

const DICTIONARIES: Record<Locale, Record<string, string> | null> = {
    pt: null,
    en,
};

export type TranslateVars = Record<string, string | number>;

/**
 * Traduz um texto do painel. O texto em português é a própria chave:
 * em `pt` ele volta como está; nos outros idiomas, vem do dicionário (ou cai no português se faltar).
 * `{nome}` no texto é trocado por `vars.nome`.
 */
export type T = ((text: string, vars?: TranslateVars) => string) & { locale: Locale; intl: string };

export function normalizeLocale(value: string | null | undefined): Locale {
    return LOCALES.some((item) => item.value === value) ? (value as Locale) : DEFAULT_LOCALE;
}

export function getLocaleInfo(locale: Locale) {
    return LOCALES.find((item) => item.value === locale) ?? LOCALES[0];
}

function interpolate(text: string, vars?: TranslateVars) {
    if (!vars) {
        return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

export function createT(locale: Locale): T {
    const dictionary = DICTIONARIES[locale];
    const t = ((text: string, vars?: TranslateVars) => interpolate(dictionary?.[text] ?? text, vars)) as T;

    t.locale = locale;
    t.intl = getLocaleInfo(locale).intl;

    return t;
}
