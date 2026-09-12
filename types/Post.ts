import type { Translations } from "./Language";
import type { PostTypeDetails } from "./PostType";

export type PostStatus = 0 | 1 | 2 | 3;

export type PostSummary = {
    id: string;
    postTypeId: string;
    postTypeName: string;
    postTypeDisplayName: string;
    title: string;
    slug: string;
    status: PostStatus;
    translations: string[];
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PostDetails = {
    id: string;
    title: string;
    slug: string;
    status: PostStatus;
    fields: Record<string, unknown>;
    translations: Translations;
    schemaVersion: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    postType: PostTypeDetails;
};

export type StatusCounts = {
    all: number;
    draft: number;
    published: number;
    archived: number;
    scheduled: number;
};

export type PostListResponse = {
    posts: PostSummary[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    statusCounts: StatusCounts;
};

export type SavePostRequest = {
    title: string;
    slug: string;
    status: PostStatus;
    publishedAt?: string | null;
    fields: Record<string, unknown>;
    translations?: Translations;
};

export const POST_STATUSES: { value: PostStatus; label: string; plural: string; key: keyof StatusCounts }[] = [
    { value: 0, label: "Rascunho", plural: "Rascunhos", key: "draft" },
    { value: 3, label: "Agendado", plural: "Agendados", key: "scheduled" },
    { value: 1, label: "Publicado", plural: "Publicados", key: "published" },
    { value: 2, label: "Arquivado", plural: "Arquivados", key: "archived" },
];

export function getPostStatusLabel(status: number) {
    return POST_STATUSES.find((item) => item.value === status)?.label ?? `Status ${status}`;
}
