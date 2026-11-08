import type { Metadata } from "next";
import Link from "next/link";
import type { T } from "@/lib/i18n";
import { getErrorMessage, getMedias, getPosts, getPostTypes } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { Media } from "@/types/Media";
import type { PostListResponse, PostSummary } from "@/types/Post";
import type { PostType } from "@/types/PostType";
import { ClockIcon, LayersIcon, MediaIcon, PostsIcon, ShieldIcon } from "./components/Icons";
import { MediaThumb } from "./components/MediaThumb";
import { Card, CardHeader, EmptyState, Notice, PageHeader, formatBytes, formatDate } from "./components/ui";
import { getT } from "@/lib/i18n-server";

function settled<T>(result: PromiseSettledResult<T>) {
    return result.status === "fulfilled" ? result.value : null;
}

const skip = Promise.resolve(null);

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Painel") };
}

export default async function Dashboard() {
    const t = await getT();
    const user = await requireUser();
    const canPosts = can(user, "posts.view");
    const canMedia = can(user, "media.view");
    const canPostTypes = can(user, "postTypes.view", "posts.view");

    if (!canPosts && !canMedia && !canPostTypes) {
        return (
            <>
                <PageHeader title={t("Painel")} />
                <Card className="animate-rise">
                    <EmptyState
                        icon={<ShieldIcon />}
                        title={user.role ? t("Seu cargo ainda não tem permissões") : t("Sua conta ainda não tem um cargo")}
                        description={t("Peça a um administrador para liberar o seu acesso ao conteúdo do painel.")}
                    />
                </Card>
            </>
        );
    }

    const results = await Promise.allSettled([
        canPosts ? getPosts({ pageSize: 1 }) : skip,
        canPosts ? getPosts({ status: 1, pageSize: 5 }) : skip,
        canPosts ? getPosts({ status: 0, pageSize: 5 }) : skip,
        canPosts ? getPosts({ status: 3, pageSize: 5 }) : skip,
        canPostTypes ? getPostTypes() : skip,
        canMedia ? getMedias() : skip,
    ]);

    const summary = settled(results[0]) as PostListResponse | null;
    const published = (settled(results[1]) as PostListResponse | null)?.posts ?? [];
    const drafts = (settled(results[2]) as PostListResponse | null)?.posts ?? [];
    const scheduled = (settled(results[3]) as PostListResponse | null)?.posts ?? [];
    const postTypes = (settled(results[4]) as PostType[] | null) ?? [];
    const medias = (settled(results[5]) as Media[] | null) ?? [];
    const failure = results.find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    const counts = summary?.statusCounts;

    const glance = [
        canPosts && { label: counts?.published === 1 ? t("post publicado") : t("posts publicados"), value: counts?.published, href: "/posts?status=1", icon: PostsIcon },
        canPosts && { label: counts?.scheduled === 1 ? t("post agendado") : t("posts agendados"), value: counts?.scheduled, href: "/posts?status=3", icon: ClockIcon },
        canPosts && { label: counts?.draft === 1 ? t("rascunho") : t("rascunhos"), value: counts?.draft, href: "/posts?status=0", icon: PostsIcon },
        can(user, "postTypes.view") && { label: postTypes.length === 1 ? t("tipo de post") : t("tipos de post"), value: postTypes.length, href: "/post-types", icon: LayersIcon },
        canMedia && { label: medias.length === 1 ? t("arquivo de mídia") : t("arquivos de mídia"), value: medias.length, href: "/media", icon: MediaIcon },
    ].filter((item) => item !== false);

    return (
        <>
            <PageHeader title={t("Painel")} />

            {failure && (
                <div className="mb-5">
                    <Notice>{t(getErrorMessage(failure.reason))}</Notice>
                </div>
            )}

            <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                    <Card className="animate-rise overflow-hidden">
                        <CardHeader title={t("Visão geral")} />
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
                            {glance.map(({ label, value, href, icon: ItemIcon }) => (
                                <li key={href}>
                                    <Link href={href} className="group flex items-center gap-2 text-[13px] text-accent hover:underline">
                                        <ItemIcon className="size-4 text-subtle group-hover:text-accent" />
                                        <span className="font-semibold tabular-nums">{value ?? "—"}</span>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {(counts?.archived || canMedia) && (
                            <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
                                {counts?.archived ? `${counts.archived} ${counts.archived === 1 ? t("post arquivado") : t("posts arquivados")}` : ""}
                                {counts?.archived && canMedia ? " · " : ""}
                                {canMedia && t("Armazenamento usado: {size}", { size: formatBytes(t, medias.reduce((sum, media) => sum + media.size, 0)) })}
                            </p>
                        )}
                    </Card>

                    {canPosts && (
                        <Card className="animate-rise overflow-hidden">
                            <CardHeader title={t("Atividade")} />
                            <div className="flex flex-col gap-4 p-4">
                                <ActivityList title={t("Publicados recentemente")} t={t} posts={published} dateOf={(post) => post.publishedAt} empty={t("Nenhum post publicado ainda.")} />
                                <ActivityList title={t("Modificados recentemente")} t={t} posts={drafts} dateOf={(post) => post.updatedAt} empty={t("Nenhum rascunho.")} />
                            </div>
                        </Card>
                    )}
                </div>

                <div className="flex flex-col gap-5">
                    {canPosts && (
                        <Card className="animate-rise overflow-hidden">
                            <CardHeader
                                title={t("Próximos agendamentos")}
                                action={
                                    (counts?.scheduled ?? 0) > scheduled.length && (
                                        <Link href="/posts?status=3" className="text-[13px] text-accent hover:underline">{t("Ver todos ({count})", { count: counts?.scheduled ?? 0 })}</Link>
                                    )
                                }
                            />
                            {scheduled.length > 0 ? (
                                <ul className="divide-y divide-line">
                                    {scheduled.map((post) => (
                                        <li key={post.id}>
                                            <Link href={`/posts/${post.id}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2/60">
                                                <span className="w-28 shrink-0 text-[13px] font-medium tabular-nums">{formatSchedule(t, post.publishedAt)}</span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-[13px] text-accent">{post.title}</span>
                                                    <span className="block truncate text-xs text-muted">{post.postTypeDisplayName}</span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-4 text-[13px] text-muted">
                                    {t("Nenhum post agendado.")}{" "}
                                    {can(user, "posts.create") && (
                                        <Link href="/posts/new" className="text-accent hover:underline">{t("Agendar um post")}</Link>
                                    )}
                                </p>
                            )}
                        </Card>
                    )}

                    {canMedia && (
                        <Card className="animate-rise overflow-hidden">
                            <CardHeader
                                title={t("Mídia recente")}
                                action={<Link href="/media" className="text-[13px] text-accent hover:underline">{t("Biblioteca")}</Link>}
                            />
                            {medias.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
                                    {medias.slice(0, 12).map((media) => (
                                        <Link
                                            key={media.id}
                                            href={`/media?selected=${media.id}`}
                                            title={media.fileName}
                                            className="relative aspect-square overflow-hidden rounded-md border border-line bg-surface-2 transition-colors hover:border-accent"
                                        >
                                            <MediaThumb media={media} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-4 text-[13px] text-muted">
                                    {t("Nenhum arquivo.")}{" "}
                                    {can(user, "media.upload") && <Link href="/media?upload=1" className="text-accent hover:underline">{t("Enviar mídia")}</Link>}
                                </p>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

function formatSchedule(t: T, value: string | null) {
    if (!value) {
        return "—";
    }

    const timeFormatter = new Intl.DateTimeFormat(t.intl, { hour: "2-digit", minute: "2-digit" });
    const dayFormatter = new Intl.DateTimeFormat(t.intl, { day: "2-digit", month: "short" });
    const date = new Date(value);
    const days = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
    const day = days === 0 ? t("Hoje") : days === 1 ? t("Amanhã") : dayFormatter.format(date);

    return `${day}, ${timeFormatter.format(date)}`;
}

function ActivityList({
    t,
    title,
    posts,
    dateOf,
    empty,
}: {
    t: T;
    title: string;
    posts: PostSummary[];
    dateOf: (post: PostSummary) => string | null;
    empty: string;
}) {
    return (
        <section>
            <h3 className="mb-2 text-[13px] font-semibold">{title}</h3>
            {posts.length > 0 ? (
                <ul className="flex flex-col gap-1.5 text-[13px]">
                    {posts.map((post) => (
                        <li key={post.id} className="grid grid-cols-[130px_1fr] gap-3">
                            <span className="text-muted">{formatDate(t, dateOf(post), true)}</span>
                            <Link href={`/posts/${post.id}`} className="truncate text-accent hover:underline">
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[13px] text-muted">{empty}</p>
            )}
        </section>
    );
}
