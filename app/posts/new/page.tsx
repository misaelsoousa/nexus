import type { Metadata } from "next";
import Link from "next/link";
import { getErrorMessage } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { LayersIcon } from "../../components/Icons";
import { Card, EmptyState, Notice, PageHeader, buttonStyles, firstParam } from "../../components/ui";
import PostEditor from "../editor/PostEditor";
import { loadEditorData } from "../editor/loadEditorData";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Adicionar novo post") };
}

export default async function NewPostPage({ searchParams }: PageProps<"/posts/new">) {
    const t = await getT();
    const user = await requirePermission("posts.create");
    const params = await searchParams;
    const preselected = firstParam(params.type);

    let data: Awaited<ReturnType<typeof loadEditorData>> | null = null;
    let error: string | null = null;

    try {
        data = await loadEditorData(true);
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    return (
        <>
            <PageHeader title={t("Adicionar novo post")} />

            {error || !data ? (
                <Notice>{error ?? t("Ocorreu um erro inesperado.")}</Notice>
            ) : data.postTypes.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<LayersIcon />}
                        title={t("Nenhum tipo de post cadastrado")}
                        description={t("Todo post pertence a um tipo. Crie um tipo antes de escrever o primeiro post.")}
                        action={
                            can(user, "postTypes.create") && (
                                <Link href="/post-types?new=1" className={buttonStyles.primary}>
                                    {t("Criar tipo de post")}
                                </Link>
                            )
                        }
                    />
                </Card>
            ) : (
                <PostEditor
                    postTypes={data.postTypes}
                    defaultTypeId={data.postTypes.find((item) => item.id === preselected || item.name === preselected)?.id}
                    initialTitle={firstParam(params.title) ?? ""}
                    medias={data.medias}
                    posts={data.posts}
                    languages={data.languages}
                />
            )}
        </>
    );
}
