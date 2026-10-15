import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getErrorMessage, getLanguages, getMedias, getPage, getPosts, getPostTypes } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { Language } from "@/types/Language";
import type { Media } from "@/types/Media";
import type { PageDetails } from "@/types/Page";
import type { PostSummary } from "@/types/Post";
import type { PostType } from "@/types/PostType";
import { Notice, PageHeader, firstParam } from "../../components/ui";
import PageWorkspace from "./PageWorkspace";
import { getT } from "@/lib/i18n-server";

async function loadPage(id: string) {
    const t = await getT();
    try {
        return { page: await getPage(id), error: null };
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
            notFound();
        }

        return { page: null as PageDetails | null, error: t(getErrorMessage(error)) };
    }
}

export async function generateMetadata({ params }: PageProps<"/pages/[id]">): Promise<Metadata> {
    const t = await getT();
    const { id } = await params;
    const { page } = await loadPage(id);

    return { title: page ? `Página: ${page.displayName}` : t("Página") };
}

export default async function EditPagePage({ params, searchParams }: PageProps<"/pages/[id]">) {
    const t = await getT();
    const user = await requirePermission("pages.view");
    const { id } = await params;
    const query = await searchParams;

    const [{ page, error }, languages, medias, posts, postTypes] = await Promise.all([
        loadPage(id),
        getLanguages().catch((): Language[] => []),
        getMedias().catch((): Media[] => []),
        getPosts({ pageSize: 100 }).then((result) => result.posts).catch((): PostSummary[] => []),
        getPostTypes().catch((): PostType[] => []),
    ]);

    return (
        <>
            <PageHeader
                eyebrow={<Link href="/pages" className="hover:text-fg hover:underline">{t("Páginas")}</Link>}
                title={page?.displayName ?? t("Página")}
            />

            {!page ? (
                <Notice>{error}</Notice>
            ) : (
                <PageWorkspace
                    page={page}
                    languages={languages}
                    medias={medias}
                    posts={posts}
                    postTypes={postTypes}
                    canEdit={can(user, "pages.edit")}
                    canManage={can(user, "pages.manage")}
                    notice={firstParam(query.created) ? t("Página \"{name}\" criada. Agora defina os campos.", { name: page.displayName }) : undefined}
                />
            )}
        </>
    );
}
