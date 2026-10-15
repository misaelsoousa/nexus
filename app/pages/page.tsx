import type { Metadata } from "next";
import Link from "next/link";
import ClickableRow from "../components/ClickableRow";
import { getErrorMessage, getPages } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { can } from "@/lib/permissions";
import type { PageSummary } from "@/types/Page";
import { Notice, PageHeader, formatDate } from "../components/ui";
import CreatePageDialog from "./CreatePageDialog";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Páginas") };
}

export default async function PagesPage() {
    const t = await getT();
    const user = await requirePermission("pages.view");
    const canManage = can(user, "pages.manage");
    let pages: PageSummary[] = [];
    let error: string | null = null;

    try {
        pages = await getPages();
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    return (
        <>
            <PageHeader
                title={t("Páginas")}
                actions={canManage && <CreatePageDialog />}
                description={t("Cada página tem os próprios campos (textos, cores, imagens, chaves de liga/desliga) que o site lê pela API, como a página inicial ou o rodapé.")}
            />

            {error && (
                <div className="mb-5">
                    <Notice>{error}</Notice>
                </div>
            )}

            <div className="animate-rise overflow-hidden rounded-lg border border-line bg-surface">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="border-b border-line text-left">
                            <th className="px-4 py-2.5 font-medium">{t("Nome")}</th>
                            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">{t("Identificador")}</th>
                            <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">{t("Campos")}</th>
                            <th className="hidden px-4 py-2.5 font-medium lg:table-cell">{t("Modificada")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {pages.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                                    {error ? t("Não foi possível carregar as páginas.") : canManage ? t("Nenhuma página. Crie a primeira em Adicionar nova página.") : t("Nenhuma página.")}
                                </td>
                            </tr>
                        ) : (
                            pages.map((page) => (
                                <ClickableRow key={page.id} href={`/pages/${page.id}`} className="group align-top transition-colors hover:bg-surface-2/60">
                                    <td className="px-4 py-3">
                                        <Link href={`/pages/${page.id}`} className="font-semibold text-accent hover:underline">
                                            {page.displayName}
                                        </Link>
                                        <div className="mt-1 flex gap-1.5 text-xs transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                                            <Link href={`/pages/${page.id}`} className="text-accent hover:underline">
                                                {can(user, "pages.edit") ? t("Editar conteúdo") : t("Ver")}
                                            </Link>
                                            {canManage && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <Link href={`/pages/${page.id}?tab=structure`} className="text-accent hover:underline">{t("Estrutura")}</Link>
                                                </>
                                            )}
                                            <span className="text-line-strong">|</span>
                                            <a href={new URL(`page/${encodeURIComponent(page.name)}`, API_BASE_URL).toString()} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                                                {t("Ver JSON")}
                                            </a>
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">{page.name}</td>
                                    <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{page.fieldCount}</td>
                                    <td className="hidden px-4 py-3 text-muted lg:table-cell">{formatDate(t, page.updatedAt)}</td>
                                </ClickableRow>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
