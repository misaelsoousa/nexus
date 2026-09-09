export type Post = {
    id: string;
    postTypeId: string;
    postTypeName: string;
    title: string;
    slug: string;
    status: number;
    publishedAt: string | null;
    createdAt: string;
};

export type PostListResponse = {
    posts: Post[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};

export const POST_STATUS_LABELS: Record<number, string> = {
    0: "Rascunho",
    1: "Publicado",
    2: "Arquivado",
};

export function getPostStatusLabel(status: number) {
    return POST_STATUS_LABELS[status] ?? `Status ${status}`;
}
