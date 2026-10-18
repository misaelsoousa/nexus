import type { Metadata } from "next";
import { getErrorMessage, getMedias } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { Media } from "@/types/Media";
import { Notice, PageHeader, firstParam } from "../components/ui";
import MediaLibrary from "./MediaLibrary";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Biblioteca de mídia") };
}

export default async function MediaPage({ searchParams }: PageProps<"/media">) {
    const t = await getT();
    const user = await requirePermission("media.view");
    const params = await searchParams;

    let medias: Media[] = [];
    let error: string | null = null;

    try {
        medias = await getMedias();
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    return (
        <>
            <PageHeader
                title={t("Biblioteca de mídia")}
                description={t("Arquivos enviados ao armazenamento do Nexus, prontos para usar nos posts.")}
            />
            {error ? (
                <Notice>{error}</Notice>
            ) : (
                <MediaLibrary
                    medias={medias}
                    initialSelected={firstParam(params.selected)}
                    openUpload={Boolean(firstParam(params.upload))}
                    canUpload={can(user, "media.upload")}
                    canDelete={can(user, "media.delete")}
                />
            )}
        </>
    );
}
