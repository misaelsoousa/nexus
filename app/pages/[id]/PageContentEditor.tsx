"use client";

import { useState, useTransition } from "react";
import { updatePageContentAction, type ActionState } from "@/app/actions";
import { API_BASE_URL } from "@/lib/config";
import { getTranslation, patchTranslation, translationsFor } from "@/lib/translations";
import type { Language, Translations } from "@/types/Language";
import type { Media } from "@/types/Media";
import type { PageDetails } from "@/types/Page";
import type { PostSummary } from "@/types/Post";
import FieldList from "../../components/fields/FieldList";
import { InheritToggle, LanguageTabs } from "../../components/fields/LanguageTabs";
import { LayersIcon } from "../../components/Icons";
import { Card, CardHeader, EmptyState, Notice, buttonStyles, formatDate } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function PageContentEditor({
    page,
    languages,
    medias,
    posts,
    readOnly,
    onEditStructure,
}: {
    page: PageDetails;
    languages: Language[];
    medias: Media[];
    posts: PostSummary[];
    readOnly: boolean;
    onEditStructure?: () => void;
}) {
    const t = useT();
    const [values, setValues] = useState<Record<string, unknown>>(page.values);
    const [translations, setTranslations] = useState<Translations>(page.translations);
    const [state, setState] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    const defaultLanguage = languages.find((item) => item.isDefault) ?? languages[0];
    const [activeCode, setActiveCode] = useState(defaultLanguage?.code ?? "");
    const activeLanguage = languages.find((item) => item.code === activeCode);
    const translating = Boolean(activeLanguage && defaultLanguage && !activeLanguage.isDefault);
    const translation = getTranslation(translations, activeCode);
    const endpoint = new URL(`page/${encodeURIComponent(page.name)}`, API_BASE_URL).toString();
    const hasFields = page.fields.some((field) => field.type !== 9);

    function save() {
        startTransition(async () => {
            setState(await updatePageContentAction(page.id, values, translationsFor(translations, languages)));
        });
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                save();
            }}
            className="grid gap-5 lg:grid-cols-[1fr_280px]"
        >
            <div className="flex min-w-0 flex-col gap-5">
                {state.error && <Notice>{state.error}</Notice>}
                {state.success && <Notice tone="success">{state.success}</Notice>}

                {hasFields && <LanguageTabs languages={languages} active={activeCode} onChange={setActiveCode} translations={translations} />}

                {hasFields && translating && activeLanguage && defaultLanguage && (
                    <InheritToggle
                        language={activeLanguage}
                        defaultLanguage={defaultLanguage}
                        inherit={translation.inherit}
                        disabled={readOnly}
                        onChange={(inherit) => setTranslations((current) => patchTranslation(current, activeCode, { inherit }))}
                    />
                )}

                {!hasFields ? (
                    <Card className="animate-rise">
                        <EmptyState
                            icon={<LayersIcon />}
                            title={t("Esta página ainda não tem campos")}
                            description={t("Defina na estrutura quais textos, cores, imagens e opções de liga/desliga a página terá.")}
                            action={
                                onEditStructure && (
                                    <button type="button" onClick={onEditStructure} className={buttonStyles.secondary}>
                                        {t("Definir campos")}
                                    </button>
                                )
                            }
                        />
                    </Card>
                ) : (
                    !(translating && translation.inherit) && (
                        <fieldset disabled={readOnly} className="min-w-0">
                            <Card className="animate-rise overflow-hidden">
                                <CardHeader title={translating ? `${t("Conteúdo")} · ${activeLanguage?.name}` : t("Conteúdo")} />
                                {translating && defaultLanguage ? (
                                    <FieldList
                                        key={activeCode}
                                        fields={page.fields}
                                        values={translation.fields}
                                        onChange={(key, value) =>
                                            setTranslations((current) =>
                                                patchTranslation(current, activeCode, { fields: { ...getTranslation(current, activeCode).fields, [key]: value } }),
                                            )
                                        }
                                        medias={medias}
                                        posts={posts}
                                        fallback={{ language: defaultLanguage.name, values }}
                                    />
                                ) : (
                                    <FieldList
                                        fields={page.fields}
                                        values={values}
                                        onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
                                        medias={medias}
                                        posts={posts}
                                    />
                                )}
                            </Card>
                        </fieldset>
                    )
                )}
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-15 lg:self-start">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Publicar")} />
                    <dl className="flex flex-col gap-2.5 p-4 text-[13px]">
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Identificador")}</dt>
                            <dd className="font-mono">{page.name}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Modificada")}</dt>
                            <dd>{formatDate(t, page.updatedAt)}</dd>
                        </div>
                        <div>
                            <dt className="mb-0.5 text-muted">{t("Na API")}</dt>
                            <dd>
                                <a href={endpoint} target="_blank" rel="noreferrer" className="break-all font-mono text-xs text-accent hover:underline">
                                    GET /api/page/{page.name}
                                </a>
                            </dd>
                        </div>
                    </dl>
                    <p className="px-4 pb-4 text-xs text-muted">{t("Ao salvar, o conteúdo já fica disponível na API.")}</p>
                    {!readOnly && hasFields && (
                        <div className="flex justify-end border-t border-line bg-surface-2/50 px-4 py-3">
                            <button type="submit" disabled={pending} className={buttonStyles.primary}>
                                {pending ? t("Salvando...") : t("Salvar conteúdo")}
                            </button>
                        </div>
                    )}
                </Card>
            </aside>
        </form>
    );
}
