"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePostAction, deletePostsAction, type ActionState } from "@/app/actions";
import { API_BASE_URL } from "@/lib/config";
import { getPostStatusLabel, type PostStatus, type PostSummary } from "@/types/Post";
import type { PostType } from "@/types/PostType";
import { Notice, StatusBadge, buttonStyles, compactSelectStyles, formatDate } from "../components/ui";
import ClickableRow from "../components/ClickableRow";
import { useT } from "@/app/components/I18nProvider";

export default function PostsTable({
    posts,
    postTypes,
    activeType,
    status,
    search,
    canEdit,
    canDelete,
    emptyMessage,
}: {
    posts: PostSummary[];
    postTypes: PostType[];
    activeType: string | null;
    status: PostStatus | null;
    search: string | null;
    canEdit: boolean;
    canDelete: boolean;
    emptyMessage: string;
}) {
    const t = useT();
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState("");
    const [result, setResult] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    const allSelected = posts.length > 0 && posts.every((post) => selected.has(post.id));

    function toggle(id: string) {
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function run(action: () => Promise<ActionState>) {
        startTransition(async () => {
            const response = await action();
            setResult(response);
            if (!response.error) setSelected(new Set());
        });
    }

    function applyBulk() {
        if (bulkAction !== "delete" || selected.size === 0) return;
        if (!window.confirm(selected.size === 1 ? t("Excluir 1 post permanentemente?") : t("Excluir {count} posts permanentemente?", { count: selected.size }))) return;
        run(() => deletePostsAction([...selected]));
    }

    function removeOne(post: PostSummary) {
        if (!window.confirm(t("Excluir \"{title}\" permanentemente?", { title: post.title }))) return;
        run(() => deletePostAction(post.id));
    }

    function filterByType(value: string) {
        const query = new URLSearchParams();
        if (value) query.set("type", value);
        if (status !== null) query.set("status", String(status));
        if (search) query.set("s", search);
        const target = query.toString();
        router.push(target ? `/posts?${target}` : "/posts");
    }

    return (
        <div className="flex flex-col gap-3">
            {result.error && <Notice>{result.error}</Notice>}
            {result.success && <Notice tone="success">{result.success}</Notice>}

            <div className="flex flex-wrap items-center gap-2">
                {canDelete && (
                    <>
                        <select aria-label={t("Ações em massa")} value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} className={compactSelectStyles}>
                            <option value="">{t("Ações em massa")}</option>
                            <option value="delete">{t("Excluir permanentemente")}</option>
                        </select>
                        <button type="button" onClick={applyBulk} disabled={pending || !bulkAction || selected.size === 0} className={buttonStyles.secondary}>
                            {t("Aplicar")}
                        </button>
                    </>
                )}

                {postTypes.length > 0 && (
                    <select
                        aria-label={t("Filtrar por tipo")}
                        value={activeType ?? ""}
                        onChange={(event) => filterByType(event.target.value)}
                        className={`${compactSelectStyles} ${canDelete ? "sm:ml-2" : ""}`}
                    >
                        <option value="">{t("Todos os tipos")}</option>
                        {postTypes.map((postType) => (
                            <option key={postType.id} value={postType.name}>{postType.displayName}</option>
                        ))}
                    </select>
                )}

                <span className="ml-auto text-[13px] text-muted">
                    {posts.length === 1 ? t("1 item") : t("{count} itens", { count: posts.length })}
                </span>
            </div>

            <div className="animate-rise overflow-hidden rounded-lg border border-line bg-surface">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="border-b border-line text-left">
                            {canDelete && (
                                <th className="w-10 px-3 py-2.5">
                                    <input
                                        type="checkbox"
                                        aria-label={t("Selecionar todos")}
                                        checked={allSelected}
                                        onChange={() => setSelected(allSelected ? new Set() : new Set(posts.map((post) => post.id)))}
                                        className="size-4 accent-[var(--accent)]"
                                    />
                                </th>
                            )}
                            <th className="px-3 py-2.5 font-medium">{t("Título")}</th>
                            <th className="hidden px-3 py-2.5 font-medium md:table-cell">{t("Tipo")}</th>
                            <th className="hidden px-3 py-2.5 font-medium sm:table-cell">{t("Status")}</th>
                            <th className="hidden px-3 py-2.5 font-medium lg:table-cell">{t("Data")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={canDelete ? 5 : 4} className="px-4 py-10 text-center text-muted">{emptyMessage}</td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <ClickableRow key={post.id} href={`/posts/${post.id}`} className="group align-top transition-colors hover:bg-surface-2/60 aria-selected:bg-accent-soft" aria-selected={selected.has(post.id)}>
                                    {canDelete && (
                                        <td className="px-3 py-3" data-row-ignore>
                                            <input
                                                type="checkbox"
                                                aria-label={t("Selecionar {name}", { name: post.title })}
                                                checked={selected.has(post.id)}
                                                onChange={() => toggle(post.id)}
                                                className="size-4 accent-[var(--accent)]"
                                            />
                                        </td>
                                    )}
                                    <td className="max-w-0 px-3 py-3 w-full md:w-1/2">
                                        <Link href={`/posts/${post.id}`} className="block truncate font-semibold text-accent hover:underline">
                                            {post.title}
                                            {post.status !== 1 && status === null && (
                                                <span className="font-normal text-muted"> — {t(getPostStatusLabel(post.status))}</span>
                                            )}
                                        </Link>
                                        {post.translations.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {post.translations.map((code) => (
                                                    <span key={code} title={t("Traduzido: {code}", { code })} className="rounded bg-surface-3 px-1 font-mono text-[10px] uppercase text-muted">
                                                        {code}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-1 flex flex-wrap gap-x-1.5 text-xs opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                                            <Link href={`/posts/${post.id}`} className="text-accent hover:underline">{canEdit ? t("Editar") : t("Ver")}</Link>
                                            {canDelete && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <button type="button" onClick={() => removeOne(post)} disabled={pending} className="text-danger hover:underline cursor-pointer">
                                                        {t("Excluir")}
                                                    </button>
                                                </>
                                            )}
                                            {post.status === 1 && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <a
                                                        href={new URL(`content/${encodeURIComponent(post.postTypeName)}/${encodeURIComponent(post.slug)}`, API_BASE_URL).toString()}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-accent hover:underline"
                                                    >
                                                        {t("Ver JSON")}
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-muted md:hidden">
                                            {post.postTypeDisplayName} · {formatDate(t, post.publishedAt ?? post.updatedAt, true)}
                                        </p>
                                    </td>
                                    <td className="hidden px-3 py-3 md:table-cell">
                                        <Link href={`/posts?type=${encodeURIComponent(post.postTypeName)}`} className="text-accent hover:underline">
                                            {post.postTypeDisplayName}
                                        </Link>
                                    </td>
                                    <td className="hidden px-3 py-3 sm:table-cell"><StatusBadge status={post.status} t={t} /></td>
                                    <td className="hidden whitespace-nowrap px-3 py-3 text-muted lg:table-cell">
                                        <span className="block">{post.status === 1 ? t("Publicado") : post.status === 3 ? t("Agendado para") : t("Última modificação")}</span>
                                        {formatDate(t, post.status === 1 || post.status === 3 ? post.publishedAt : post.updatedAt)}
                                    </td>
                                </ClickableRow>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
