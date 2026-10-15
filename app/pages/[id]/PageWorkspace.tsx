"use client";

import { useSearchParams } from "next/navigation";
import type { Language } from "@/types/Language";
import type { Media } from "@/types/Media";
import type { PageDetails } from "@/types/Page";
import type { PostSummary } from "@/types/Post";
import type { PostType } from "@/types/PostType";
import PageContentEditor from "./PageContentEditor";
import PageStructureEditor from "./PageStructureEditor";
import { useT } from "@/app/components/I18nProvider";

type Tab = "content" | "structure";

const TABS: { value: Tab; label: string }[] = [
    { value: "content", label: "Conteúdo" },
    { value: "structure", label: "Estrutura" },
];

export default function PageWorkspace({
    page,
    languages,
    medias,
    posts,
    postTypes,
    canEdit,
    canManage,
    notice,
}: {
    page: PageDetails;
    languages: Language[];
    medias: Media[];
    posts: PostSummary[];
    postTypes: PostType[];
    canEdit: boolean;
    canManage: boolean;
    notice?: string;
}) {
    const t = useT();
    const params = useSearchParams();
    const tab: Tab = canManage && params.get("tab") === "structure" ? "structure" : "content";

    function select(next: Tab) {
        window.history.replaceState(null, "", next === "structure" ? `/pages/${page.id}?tab=structure` : `/pages/${page.id}`);
    }

    return (
        <>
            {canManage && (
                <div role="tablist" aria-label={t("Seções da página")} className="animate-rise mb-5 flex gap-1 border-b border-line">
                    {TABS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            role="tab"
                            aria-selected={tab === item.value}
                            onClick={() => select(item.value)}
                            className="-mb-px border-b-2 border-transparent px-3 py-2 text-[13px] text-muted transition-colors hover:text-fg aria-selected:border-accent aria-selected:font-medium aria-selected:text-fg cursor-pointer"
                        >
                            {t(item.label)}
                        </button>
                    ))}
                </div>
            )}

            <div hidden={tab !== "content"}>
                <PageContentEditor
                    page={page}
                    languages={languages}
                    medias={medias}
                    posts={posts}
                    readOnly={!canEdit}
                    onEditStructure={canManage ? () => select("structure") : undefined}
                />
            </div>

            {canManage && (
                <div hidden={tab !== "structure"}>
                    <PageStructureEditor page={page} postTypes={postTypes} notice={notice} />
                </div>
            )}
        </>
    );
}
