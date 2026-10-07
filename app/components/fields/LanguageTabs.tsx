"use client";

import { getTranslation } from "@/lib/translations";
import type { Language, Translations } from "@/types/Language";
import { GlobeIcon } from "../Icons";
import { useT } from "@/app/components/I18nProvider";

export function LanguageTabs({
    languages,
    active,
    onChange,
    translations,
}: {
    languages: Language[];
    active: string;
    onChange: (code: string) => void;
    translations: Translations;
}) {
    const t = useT();
    if (languages.length < 2) {
        return null;
    }

    return (
        <div role="tablist" aria-label={t("Idioma do conteúdo")} className="flex flex-wrap items-end gap-1 border-b border-line">
            <GlobeIcon className="mb-2 mr-1 size-4 text-subtle" />
            {languages.map((language) => {
                const inherits = !language.isDefault && getTranslation(translations, language.code).inherit;

                return (
                    <button
                        key={language.code}
                        type="button"
                        role="tab"
                        aria-selected={active === language.code}
                        onClick={() => onChange(language.code)}
                        className="-mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-[13px] text-muted transition-colors hover:text-fg aria-selected:border-accent aria-selected:font-medium aria-selected:text-fg cursor-pointer"
                    >
                        {language.name}
                        <code className="font-mono text-[11px] text-subtle">{language.code}</code>
                        {language.isDefault ? (
                            <span className="rounded bg-surface-3 px-1 text-[11px] text-muted">{t("padrão")}</span>
                        ) : inherits ? (
                            <span className="text-[11px] text-subtle">{t("igual ao padrão")}</span>
                        ) : (
                            <span className="size-1.5 rounded-full bg-accent" aria-label={t("traduzido")} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export function InheritToggle({
    language,
    defaultLanguage,
    inherit,
    onChange,
    disabled = false,
}: {
    language: Language;
    defaultLanguage: Language;
    inherit: boolean;
    onChange: (inherit: boolean) => void;
    disabled?: boolean;
}) {
    const t = useT();

    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface p-4 text-[13px]">
            <input
                type="checkbox"
                checked={inherit}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span>
                <span className="font-medium">{t("Usar o mesmo conteúdo de {name}", { name: defaultLanguage.name })}</span>
                <span className="mt-0.5 block text-xs text-muted">
                    {inherit
                        ? t("Quem pedir ?lang={code} recebe o conteúdo de {default}. Desmarque para escrever uma versão em {name}.", { code: language.code, default: defaultLanguage.name, name: language.name })
                        : t("Esta versão em {name} é própria. Campos deixados vazios usam o valor de {default}.", { name: language.name, default: defaultLanguage.name })}
                </span>
            </span>
        </label>
    );
}
