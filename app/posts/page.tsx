import type { Metadata } from "next";
import Link from "next/link";
import { getErrorMessage, getPosts, getPostsByType, getPostTypes } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { POST_STATUSES, type PostListResponse, type PostStatus } from "@/types/Post";
import type { PostType } from "@/types/PostType";
import { SearchIcon } from "../components/Icons";
import { Notice, PageHeader, Pagination, buttonStyles, firstParam, inputStyles } from "../components/ui";
import PostsTable from "./PostsTable";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Posts") };
}

const PAGE_SIZE = 20;

export default async function PostsPage({ searchParams }: PageProps<"/posts">) {
    const t = await getT();
    const user = await requirePermission("posts.view");
    const params = await searchParams;
    const type = firstParam(params.type) || null;
    const search = firstParam(params.s)?.trim() || null;
    const statusParam = firstParam(params.status);
    const status = POST_STATUSES.find((item) => String(item.value) === statusParam)?.value ?? null;
    const page = Math.max(1, Number(firstParam(params.page) ?? 1) || 1);

    let postTypes: PostType[] = [];
    let data: PostListResponse | null = null;
    let error: string | null = null;

    try {
        const query = { page, pageSize: PAGE_SIZE, status, search };
        [postTypes, data] = await Promise.all([
            getPostTypes(),
            type ? getPostsByType(type, query) : getPosts(query),
        ]);
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    const activeType = postTypes.find((postType) => postType.name === type);

    const hrefFor = (overrides: { status?: PostStatus | null; page?: number }) => {
        const query = new URLSearchParams();
        const targetStatus = "status" in overrides ? overrides.status : status;
        if (type) query.set("type", type);
        if (search) query.set("s", search);
        if (targetStatus !== null && targetStatus !== undefined) query.set("status", String(targetStatus));
        if (overrides.page && overrides.page > 1) query.set("page", String(overrides.page));
        const value = query.toString();
        return value ? `/posts?${value}` : "/posts";
    };

    const counts = data?.statusCounts;
    const statusLinks = [
        { label: t("Todos"), value: null, count: counts?.all },
        ...POST_STATUSES.map((item) => ({ label: t(item.plural), value: item.value, count: counts?.[item.key] })),
    ].filter((item) => item.value === null || item.value === status || (item.count ?? 0) > 0);

    return (
        <>
            <PageHeader
                title={activeType?.displayName ?? t("Posts")}
                actions={
                    can(user, "posts.create") && (
                        <Link href={activeType ? `/posts/new?type=${activeType.id}` : "/posts/new"} className={buttonStyles.outline}>
                            {t("Adicionar novo")}
                        </Link>
                    )
                }
            />

            {error && (
                <div className="mb-4">
                    <Notice>{error}</Notice>
                </div>
            )}

            <div className="animate-rise mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <ul className="flex flex-wrap items-center text-[13px]">
                    {statusLinks.map((item, index) => (
                        <li key={item.label} className="flex items-center">
                            {index > 0 && <span className="px-1.5 text-line-strong">|</span>}
                            <Link
                                href={hrefFor({ status: item.value })}
                                aria-current={status === item.value ? "page" : undefined}
                                className="text-accent hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-fg aria-[current=page]:no-underline"
                            >
                                {item.label} <span className="text-muted font-normal">({item.count ?? 0})</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <form action="/posts" className="flex gap-2">
                    {type && <input type="hidden" name="type" value={type} />}
                    {status !== null && <input type="hidden" name="status" value={status} />}
                    <label htmlFor="post-search" className="sr-only">{t("Pesquisar posts")}</label>
                    <input id="post-search" type="search" name="s" defaultValue={search ?? ""} placeholder={t("Pesquisar posts")} className={`${inputStyles} h-8 md:w-56`} />
                    <button type="submit" className={buttonStyles.secondary}>
                        <SearchIcon className="size-4" />
                        <span className="hidden sm:inline">{t("Pesquisar")}</span>
                    </button>
                </form>
            </div>

            <PostsTable
                key={`${type}-${status}-${search}-${page}`}
                posts={data?.posts ?? []}
                postTypes={postTypes}
                activeType={type}
                status={status}
                search={search}
                canEdit={can(user, "posts.edit")}
                canDelete={can(user, "posts.delete")}
                emptyMessage={
                    error
                        ? t("Não foi possível carregar os posts.")
                        : search
                          ? t("Nenhum post encontrado para \"{search}\".", { search })
                          : t("Nenhum post encontrado.")
                }
            />

            {data && data.totalPages > 1 && (
                <div className="mt-3 rounded-lg border border-line bg-surface">
                    <Pagination
                        t={t}
                        page={data.page}
                        totalPages={data.totalPages}
                        totalCount={data.totalCount}
                        hrefFor={(target) => hrefFor({ page: target })}
                    />
                </div>
            )}
        </>
    );
}
