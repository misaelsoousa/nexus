"use client";

import { startTransition, useActionState, useState } from "react";
import { savePostAction, type ActionState } from "@/app/actions";
import { slugify } from "@/lib/slug";
import { getTranslation, patchTranslation, translationsFor } from "@/lib/translations";
import { useHydrated } from "@/lib/use-hydrated";
import type { Language, Translations } from "@/types/Language";
import type { Media } from "@/types/Media";
import { POST_STATUSES, type PostDetails, type PostStatus, type PostSummary } from "@/types/Post";
import type { PostTypeDetails } from "@/types/PostType";
import DeletePostButton from "../../components/DeletePostButton";
import { Card, CardHeader, Notice, buttonStyles, formatDate, inputStyles } from "../../components/ui";
import FieldList from "../../components/fields/FieldList";
import { InheritToggle, LanguageTabs } from "../../components/fields/LanguageTabs";
import { useT } from "@/app/components/I18nProvider";
import { rich } from "@/lib/rich";

type Props = {
    post?: PostDetails;
    postTypes: PostTypeDetails[];
    defaultTypeId?: string;
    initialTitle?: string;
    medias: Media[];
    posts: PostSummary[];
    languages: Language[];
    readOnly?: boolean;
    canDelete?: boolean;
    notice?: string;
};

/** ISO (UTC) -> valor de <input type="datetime-local"> no fuso do navegador. */
function toLocalInput(iso: string) {
    const date = new Date(iso);

    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function nextFullHour() {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);

    return toLocalInput(date.toISOString());
}

export default function PostEditor({ post, postTypes, defaultTypeId, initialTitle = "", medias, posts, languages, readOnly = false, canDelete = false, notice }: Props) {
    const t = useT();
    const [state, formAction, pending] = useActionState<ActionState, FormData>(savePostAction, {});
    const [title, setTitle] = useState(post?.title ?? initialTitle);
    const [slug, setSlug] = useState(post?.slug ?? "");
    const [slugEdited, setSlugEdited] = useState(Boolean(post));
    const [status, setStatus] = useState<PostStatus>(post?.status ?? 0);
    const [scheduledAt, setScheduledAt] = useState<string | null>(null);
    const hydrated = useHydrated();
    const [typeId, setTypeId] = useState(post?.postType.id ?? defaultTypeId ?? postTypes[0]?.id ?? "");
    const [values, setValues] = useState<Record<string, unknown>>(post?.fields ?? {});
    const [translations, setTranslations] = useState<Translations>(post?.translations ?? {});
    const defaultLanguage = languages.find((item) => item.isDefault) ?? languages[0];
    const [activeCode, setActiveCode] = useState(defaultLanguage?.code ?? "");
    const activeLanguage = languages.find((item) => item.code === activeCode);
    const translating = Boolean(activeLanguage && defaultLanguage && !activeLanguage.isDefault);
    const translation = getTranslation(translations, activeCode);

    const postType = post?.postType ?? postTypes.find((item) => item.id === typeId);
    const fields = postType?.fields ?? [];
    const currentSlug = slugEdited ? slug : slugify(title);
    const isPublished = post?.status === 1;
    const scheduleValue = scheduledAt ?? (post?.status === 3 && post.publishedAt ? toLocalInput(post.publishedAt) : "");
    const primaryLabel = status === 3 && post?.status !== 3 ? t("Agendar") : !post ? (status === 1 ? t("Publicar") : t("Salvar")) : t("Atualizar");
    const message = state.error ? null : state.success ?? notice;
    const otherPosts = posts.filter((item) => item.id !== post?.id);

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
                startTransition(() => formAction(formData));
            }}
            className="grid gap-5 lg:grid-cols-[1fr_280px]"
        >
            <input type="hidden" name="fields" value={JSON.stringify(values)} />
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="slug" value={currentSlug} />
            {languages.length > 1 && <input type="hidden" name="translations" value={JSON.stringify(translationsFor(translations, languages))} />}
            <input type="hidden" name="status" value={status} />
            {status === 3 && hydrated && scheduleValue && <input type="hidden" name="publishedAt" value={new Date(scheduleValue).toISOString()} />}
            {post ? <input type="hidden" name="id" value={post.id} /> : <input type="hidden" name="postTypeId" value={typeId} />}

            <div className="flex min-w-0 flex-col gap-5">
                {state.error && <Notice>{state.error}</Notice>}
                {message && <Notice tone="success">{message}</Notice>}

                <LanguageTabs languages={languages} active={activeCode} onChange={setActiveCode} translations={translations} />

                {translating && activeLanguage && defaultLanguage && (
                    <InheritToggle
                        language={activeLanguage}
                        defaultLanguage={defaultLanguage}
                        inherit={translation.inherit}
                        disabled={readOnly}
                        onChange={(inherit) => setTranslations((current) => patchTranslation(current, activeCode, { inherit }))}
                    />
                )}

                <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-5">
                    {translating ? (
                        !translation.inherit && (
                            <div>
                                <label htmlFor="translated-title" className="sr-only">{t("Título em {name}", { name: activeLanguage?.name ?? "" })}</label>
                                <input
                                    id="translated-title"
                                    value={translation.title ?? ""}
                                    onChange={(event) => setTranslations((current) => patchTranslation(current, activeCode, { title: event.target.value }))}
                                    placeholder={title || t("Adicionar título")}
                                    className="h-12 w-full rounded-md border border-line bg-surface px-3 text-xl font-medium shadow-soft placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                                />
                                <p className="mt-2 text-[13px] text-muted">
                                    {rich(t("O slug {slug} é o mesmo em todos os idiomas."), { slug: <code className="font-mono text-fg">{currentSlug || "—"}</code> })}
                                </p>
                            </div>
                        )
                    ) : (
                        <div>
                            <label htmlFor="title" className="sr-only">{t("Título")}</label>
                            <input
                                id="title"
                                required
                                autoFocus={!post}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder={t("Adicionar título")}
                                className="h-12 w-full rounded-md border border-line bg-surface px-3 text-xl font-medium shadow-soft placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                            />
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
                                <label htmlFor="slug" className="font-medium">{t("Slug:")}</label>
                                <span className="font-mono text-subtle">/{postType?.name ?? "tipo"}/</span>
                                <input
                                    id="slug"
                                    required
                                    value={currentSlug}
                                    onChange={(event) => {
                                        setSlugEdited(true);
                                        setSlug(slugify(event.target.value) || event.target.value.toLowerCase());
                                    }}
                                    placeholder={t("gerado-a-partir-do-titulo")}
                                    className="h-7 min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 font-mono text-[13px] text-fg hover:border-line focus:border-accent focus:bg-surface focus:outline-none"
                                />
                                {slugEdited && currentSlug !== slugify(title) && (
                                    <button type="button" onClick={() => setSlugEdited(false)} className="text-xs font-medium text-accent hover:underline cursor-pointer">
                                        {t("Gerar do título")}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!(translating && translation.inherit) && (
                        <Card className="animate-rise overflow-hidden">
                            <CardHeader title={postType ? `${t("Campos de {name}", { name: postType.displayName })}${translating ? ` · ${activeLanguage?.name}` : ""}` : t("Campos")} />
                            {fields.length === 0 ? (
                                <p className="px-4 py-8 text-center text-[13px] text-muted">
                                    {t("Este tipo ainda não tem campos.")}{" "}
                                    {postType && (
                                        <a href={`/post-types/${postType.id}`} className="text-accent hover:underline">{t("Definir campos")}</a>
                                    )}
                                </p>
                            ) : translating && defaultLanguage ? (
                                <FieldList
                                    key={activeCode}
                                    fields={fields}
                                    values={translation.fields}
                                    onChange={(key, value) =>
                                        setTranslations((current) =>
                                            patchTranslation(current, activeCode, { fields: { ...getTranslation(current, activeCode).fields, [key]: value } }),
                                        )
                                    }
                                    medias={medias}
                                    posts={otherPosts}
                                    fallback={{ language: defaultLanguage.name, values }}
                                />
                            ) : (
                                <FieldList
                                    fields={fields}
                                    values={values}
                                    onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
                                    medias={medias}
                                    posts={otherPosts}
                                />
                            )}
                        </Card>
                    )}
                </fieldset>
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-15 lg:self-start">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Publicar")} />
                    <div className="flex flex-col gap-3 p-4 text-[13px]">
                        {!isPublished && !readOnly && (
                            <button type="submit" name="intent" value="draft" onClick={() => setStatus(0)} disabled={pending} className={`${buttonStyles.secondary} self-start`}>
                                {t("Salvar rascunho")}
                            </button>
                        )}
                        <label className="flex items-center gap-2">
                            <span className="w-20 shrink-0 text-muted">{t("Status")}</span>
                            <select
                                disabled={readOnly}
                                value={status}
                                onChange={(event) => {
                                    const next = Number(event.target.value) as PostStatus;
                                    setStatus(next);

                                    if (next === 3 && !scheduleValue) {
                                        setScheduledAt(nextFullHour());
                                    }
                                }}
                                className={`${inputStyles} h-8`}
                            >
                                {POST_STATUSES.map((item) => (
                                    <option key={item.value} value={item.value}>{t(item.label)}</option>
                                ))}
                            </select>
                        </label>
                        {status === 3 && (
                            <label className="flex items-center gap-2">
                                <span className="w-20 shrink-0 text-muted">{t("Publicar em")}</span>
                                {hydrated ? (
                                    <input
                                        type="datetime-local"
                                        required
                                        disabled={readOnly}
                                        value={scheduleValue}
                                        onChange={(event) => setScheduledAt(event.target.value)}
                                        className={`${inputStyles} h-8 min-w-0 px-2`}
                                    />
                                ) : (
                                    <div className="h-8 flex-1 rounded-md border border-line bg-surface-2" />
                                )}
                            </label>
                        )}
                        {post && (
                            <>
                                <p className="flex gap-2">
                                    <span className="w-20 shrink-0 text-muted">{post.status === 3 ? "Agendado" : "Publicado"}</span>
                                    <span>{post.publishedAt ? formatDate(t, post.publishedAt) : "—"}</span>
                                </p>
                                <p className="flex gap-2">
                                    <span className="w-20 shrink-0 text-muted">{t("Modificado")}</span>
                                    <span>{formatDate(t, post.updatedAt)}</span>
                                </p>
                            </>
                        )}
                    </div>
                    {(!readOnly || (post && canDelete)) && (
                        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                            {post && canDelete ? <DeletePostButton id={post.id} title={post.title} redirectTo="/posts" /> : <span />}
                            {!readOnly && (
                                <button type="submit" name="intent" value="save" disabled={pending} className={buttonStyles.primary}>
                                    {pending ? t("Salvando...") : primaryLabel}
                                </button>
                            )}
                        </div>
                    )}
                </Card>

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Tipo de post")} />
                    <div className="p-4 text-[13px]">
                        {post ? (
                            <p>
                                <span className="font-medium">{post.postType.displayName}</span>
                                <span className="ml-1.5 font-mono text-xs text-subtle">{post.postType.name}</span>
                            </p>
                        ) : (
                            <select aria-label={t("Tipo de post")} value={typeId} onChange={(event) => setTypeId(event.target.value)} className={`${inputStyles} h-8`}>
                                {postTypes.map((item) => (
                                    <option key={item.id} value={item.id}>{item.displayName}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </Card>

                {post && (
                    <Card className="animate-rise overflow-hidden">
                        <CardHeader title={t("Informações")} />
                        <dl className="flex flex-col gap-2.5 p-4 text-[13px]">
                            <div>
                                <dt className="text-xs text-subtle">{t("Criado em")}</dt>
                                <dd>{formatDate(t, post.createdAt)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-subtle">{t("Versão do schema")}</dt>
                                <dd className="tabular-nums">
                                    v{post.schemaVersion}
                                    {post.schemaVersion !== post.postType.schemaVersion && (
                                        <span className="ml-1.5 text-warning">{t("(tipo está na v{version})", { version: post.postType.schemaVersion })}</span>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-subtle">{t("ID")}</dt>
                                <dd className="break-all font-mono text-xs text-muted">{post.id}</dd>
                            </div>
                        </dl>
                    </Card>
                )}
            </aside>
        </form>
    );
}
