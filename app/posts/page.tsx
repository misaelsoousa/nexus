import Link from "next/link";
import { getPostsByType } from "@/lib/api";
import { getPostStatusLabel, type PostListResponse } from "@/types/Post";

const PAGE_SIZE = 20;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
});

function formatDate(value: string | null) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function firstValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function EmptyRow({ children }: { children: React.ReactNode }) {
    return (
        <tr className="bg-light-gray">
            <td className="p-4 text-white/70" colSpan={4}>
                {children}
            </td>
        </tr>
    );
}

export default async function PostsPage({ searchParams }: PageProps<"/posts">) {
    const params = await searchParams;
    const type = firstValue(params.type);
    const page = Number(firstValue(params.page) ?? 1) || 1;

    let data: PostListResponse | null = null;
    let error: string | null = null;

    if (type) {
        try {
            data = await getPostsByType(
                type,
                { page, pageSize: PAGE_SIZE },
                { next: { revalidate: 60 } },
            );
        } catch {
            error = `Não foi possível carregar os posts de "${type}".`;
        }
    }

    const posts = data?.posts ?? [];

    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto w-full">
                <table className="w-full rounded-t-lg overflow-hidden mt-5">
                    <thead className="bg-gray">
                        <tr>
                            <th className="w-1/4 text-start p-4">Title</th>
                            <th className="w-1/4 text-start p-4">Type</th>
                            <th className="w-1/4 text-start p-4">Status</th>
                            <th className="w-1/4 text-start p-4">Last Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!type && (
                            <EmptyRow>
                                Selecione um tipo de post no menu lateral.
                            </EmptyRow>
                        )}

                        {type && error && <EmptyRow>{error}</EmptyRow>}

                        {type && !error && posts.length === 0 && (
                            <EmptyRow>Nenhum post encontrado para &quot;{type}&quot;.</EmptyRow>
                        )}

                        {posts.map((post) => (
                            <tr key={post.id} className="bg-light-gray">
                                <td className="w-1/4 text-start p-4">
                                    {post.title}
                                </td>
                                <td className="w-1/4 text-start p-4">
                                    {post.postTypeName}
                                </td>
                                <td className="w-1/4 text-start p-4">
                                    {getPostStatusLabel(post.status)}
                                </td>
                                <td className="w-1/4 text-start p-4">
                                    {formatDate(post.publishedAt ?? post.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between gap-4 mt-4 text-sm">
                        <span className="text-white/70">
                            Página {data.page} de {data.totalPages} · {data.totalCount} posts
                        </span>
                        <div className="flex gap-2">
                            {data.page > 1 && (
                                <Link
                                    href={`/posts?type=${encodeURIComponent(type!)}&page=${data.page - 1}`}
                                    className="rounded-lg px-3 py-2 bg-gray hover:bg-white/10 transition-colors"
                                >
                                    Anterior
                                </Link>
                            )}
                            {data.page < data.totalPages && (
                                <Link
                                    href={`/posts?type=${encodeURIComponent(type!)}&page=${data.page + 1}`}
                                    className="rounded-lg px-3 py-2 bg-gray hover:bg-white/10 transition-colors"
                                >
                                    Próxima
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
