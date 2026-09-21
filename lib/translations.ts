import { EMPTY_TRANSLATION, type Language, type Translation, type Translations } from "@/types/Language";

export function getTranslation(translations: Translations, code: string): Translation {
    return translations[code] ?? EMPTY_TRANSLATION;
}

export function patchTranslation(translations: Translations, code: string, patch: Partial<Translation>): Translations {
    return { ...translations, [code]: { ...getTranslation(translations, code), ...patch } };
}

/** Só os idiomas configurados que não são o padrão: é o que a API aceita ao salvar. */
export function translationsFor(translations: Translations, languages: Language[]): Translations {
    return Object.fromEntries(
        languages
            .filter((language) => !language.isDefault)
            .map((language) => [language.code, getTranslation(translations, language.code)]),
    );
}
