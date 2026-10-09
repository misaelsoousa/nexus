import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getErrorMessage, getPostType, getPostTypes, getPostsByType } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { PostType, PostTypeDetails } from "@/types/PostType";
import { Notice, PageHeader, buttonStyles, firstParam } from "../../components/ui";
import PostTypeEditor from "./PostTypeEditor";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Editar tipo de post") };
}

export default async function PostTypePage({ params, searchParams }: PageProps<"/post-types/[id]">) {
    const t = await getT();
    const user = await requirePermission("postTypes.view");
    const canEdit = can(user, "postTypes.edit");
    const { id } = await params;
    const query = await searchParams;

    let postType: PostTypeDetails | null = null;
    let postTypes: PostType[] = [];
    let error: string | null = null;

    try {
        [postType, postTypes] = await Promise.all([getPostType(id), getPostTypes()]);
    } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
            notFound();
        }

        error = t(getErrorMessage(e));
    }

    const canDelete = can(user, "postTypes.delete");
    const postCount =
        postType && canDelete && can(user, "posts.view")
            ? await getPostsByType(postType.name, { pageSize: 1 })
                  .then((result) => result.statusCounts.all)
                  .catch(() => null)
            : null;

    return (
        <>
            <PageHeader
                title={canEdit ? t("Editar tipo de post") : t("Ver tipo de post")}
                actions={
                    can(user, "postTypes.create") && (
                        <Link href="/post-types?new=1" className={buttonStyles.outline}>
                            {t("Adicionar novo")}
                        </Link>
                    )
                }
            />

            {error || !postType ? (
                <Notice>{error}</Notice>
            ) : (
                <PostTypeEditor
                    postType={postType}
                    postTypes={postTypes}
                    readOnly={!canEdit}
                    canDelete={canDelete}
                    postCount={postCount}
                    notice={firstParam(query.created) ? t("Tipo \"{name}\" criado. Agora defina os campos.", { name: postType.displayName }) : undefined}
                />
            )}
        </>
    );
}
