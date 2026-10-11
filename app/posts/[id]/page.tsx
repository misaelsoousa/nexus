import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getErrorMessage, getPost } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Notice, PageHeader, buttonStyles, firstParam } from "../../components/ui";
import PostEditor from "../editor/PostEditor";
import { loadEditorData } from "../editor/loadEditorData";
import { getT } from "@/lib/i18n-server";

async function loadPost(id: string) {
    const t = await getT();
    try {
        return { post: await getPost(id), error: null };
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
            notFound();
        }

        return { post: null, error: t(getErrorMessage(error)) };
    }
}

export async function generateMetadata({ params }: PageProps<"/posts/[id]">): Promise<Metadata> {
    const t = await getT();
    const { id } = await params;
    const { post } = await loadPost(id);

    return { title: post ? t("Editar: {title}", { title: post.title }) : t("Post") };
}

export default async function EditPostPage({ params, searchParams }: PageProps<"/posts/[id]">) {
    const t = await getT();
    const user = await requirePermission("posts.view");
    const canEdit = can(user, "posts.edit");
    const { id } = await params;
    const query = await searchParams;
    const [{ post, error }, data] = await Promise.all([loadPost(id), loadEditorData(false)]);

    if (!post) {
        return (
            <>
                <PageHeader title={t("Editar post")} />
                <Notice>{error ?? t("Ocorreu um erro inesperado.")}</Notice>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title={canEdit ? t("Editar post") : t("Ver post")}
                actions={
                    can(user, "posts.create") && (
                        <Link href={`/posts/new?type=${post.postType.id}`} className={buttonStyles.outline}>
                            {t("Adicionar novo")}
                        </Link>
                    )
                }
            />
            <PostEditor
                post={post}
                postTypes={[]}
                medias={data.medias}
                posts={data.posts}
                languages={data.languages}
                readOnly={!canEdit}
                canDelete={can(user, "posts.delete")}
                notice={firstParam(query.saved) ? t("Post salvo.") : undefined}
            />
        </>
    );
}
