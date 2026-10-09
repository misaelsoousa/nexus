import type { Metadata } from "next";
import Link from "next/link";
import ClickableRow from "../components/ClickableRow";
import { getErrorMessage, getPostsByType, getPostTypes } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { PostType } from "@/types/PostType";
import { Notice, PageHeader, formatDate } from "../components/ui";
import CreatePostTypeDialog from "./CreatePostTypeDialog";
import DeletePostTypeDialog from "./DeletePostTypeDialog";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Tipos de post") };
}

export default async function PostTypesPage() {
    const t = await getT();
    const user = await requirePermission("postTypes.view");
    const canCreate = can(user, "postTypes.create");
    const canViewPosts = can(user, "posts.view");
    const canDelete = can(user, "postTypes.delete");
    let postTypes: PostType[] = [];
    let error: string | null = null;

    try {
        postTypes = await getPostTypes();
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    const counts = await Promise.all(
        postTypes.map((postType) =>
            canViewPosts
                ? getPostsByType(postType.name, { pageSize: 1 })
                      .then((result) => result.statusCounts.all)
                      .catch(() => null)
                : null,
        ),
    );

    return (
        <>
            <PageHeader
                title={t("Tipos de post")}
                actions={canCreate && <CreatePostTypeDialog />}
                description={t("Cada tipo define uma estrutura de conteúdo, com seus próprios campos, e agrupa os posts desse formato.")}
            />

            {error && (
                <div className="mb-5">
                    <Notice>{error}</Notice>
                </div>
            )}

            <div className="animate-rise overflow-hidden rounded-lg border border-line bg-surface">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="border-b border-line text-left">
                            <th className="px-4 py-2.5 font-medium">{t("Nome")}</th>
                            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">{t("Identificador")}</th>
                            <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t("Schema")}</th>
                            <th className="px-4 py-2.5 text-right font-medium">{t("Posts")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {postTypes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                                    {error ? t("Não foi possível carregar os tipos.") : canCreate ? t("Nenhum tipo de post. Crie o primeiro em Adicionar novo tipo.") : t("Nenhum tipo de post.")}
                                </td>
                            </tr>
                        ) : (
                            postTypes.map((postType, index) => (
                                <ClickableRow key={postType.id} href={`/post-types/${postType.id}`} className="group align-top transition-colors hover:bg-surface-2/60">
                                    <td className="px-4 py-3">
                                        <Link href={`/post-types/${postType.id}`} className="font-semibold text-accent hover:underline">
                                            {postType.displayName}
                                        </Link>
                                        <div className="mt-1 flex gap-1.5 text-xs transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                                            <Link href={`/post-types/${postType.id}`} className="text-accent hover:underline">
                                                {can(user, "postTypes.edit") ? t("Editar") : t("Ver")}
                                            </Link>
                                            {canViewPosts && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <Link href={`/posts?type=${encodeURIComponent(postType.name)}`} className="text-accent hover:underline">{t("Ver posts")}</Link>
                                                </>
                                            )}
                                            {can(user, "posts.create") && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <Link href={`/posts/new?type=${postType.id}`} className="text-accent hover:underline">{t("Novo post")}</Link>
                                                </>
                                            )}
                                            {canDelete && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <DeletePostTypeDialog
                                                        id={postType.id}
                                                        name={postType.name}
                                                        displayName={postType.displayName}
                                                        postCount={counts[index]}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">{postType.name}</td>
                                    <td className="hidden px-4 py-3 text-muted md:table-cell">
                                        v{postType.schemaVersion}
                                        <span className="block text-xs text-subtle">desde {formatDate(t, postType.createdAt, true)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        <Link href={`/posts?type=${encodeURIComponent(postType.name)}`} className="text-accent hover:underline">
                                            {counts[index] ?? "—"}
                                        </Link>
                                    </td>
                                </ClickableRow>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
