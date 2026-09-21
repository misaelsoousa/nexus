import { cookies } from "next/headers";
import { cache } from "react";
import { LOCALE_COOKIE, createT, normalizeLocale } from "./i18n";

/** Idioma do painel escolhido em Configurações → Personalização (cookie; português por padrão). */
export const getLocale = cache(async () => normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value));

export const getT = cache(async () => createT(await getLocale()));
