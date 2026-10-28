import type { Metadata } from "next";
import Link from "next/link";
import ClickableRow from "../components/ClickableRow";
import { getErrorMessage, getForms } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { FormSummary } from "@/types/Form";
import { Notice, PageHeader, formatDate } from "../components/ui";
import ActiveBadge from "./ActiveBadge";
import CreateFormDialog from "./CreateFormDialog";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Formulários") };
}

export default async function FormsPage() {
    const t = await getT();
    const user = await requirePermission("forms.view");
    const canManage = can(user, "forms.manage");
    let forms: FormSummary[] = [];
    let error: string | null = null;

    try {
        forms = await getForms();
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    return (
        <>
            <PageHeader
                title={t("Formulários")}
                actions={canManage && <CreateFormDialog />}
                description={t("Cadastros que o site envia para a API, como Trabalhe conosco, Ouvidoria ou Contato. Você define os campos e acompanha os envios por aqui.")}
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
                            <th className="px-4 py-2.5 text-right font-medium">{t("Envios")}</th>
                            <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t("Status")}</th>
                            <th className="hidden px-4 py-2.5 font-medium lg:table-cell">{t("Modificado")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {forms.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                                    {error ? t("Não foi possível carregar os formulários.") : canManage ? t("Nenhum formulário. Crie o primeiro em Adicionar novo formulário.") : t("Nenhum formulário.")}
                                </td>
                            </tr>
                        ) : (
                            forms.map((form) => (
                                <ClickableRow key={form.id} href={`/forms/${form.id}`} className="group align-top transition-colors hover:bg-surface-2/60">
                                    <td className="px-4 py-3">
                                        <Link href={`/forms/${form.id}`} className="font-semibold text-accent hover:underline">
                                            {form.displayName}
                                        </Link>
                                        <div className="mt-1 flex gap-1.5 text-xs transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                                            <Link href={`/forms/${form.id}`} className="text-accent hover:underline">{t("Envios")}</Link>
                                            {canManage && (
                                                <>
                                                    <span className="text-line-strong">|</span>
                                                    <Link href={`/forms/${form.id}?tab=structure`} className="text-accent hover:underline">{t("Campos e configurações")}</Link>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">{form.name}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        {form.submissionCount}
                                        {form.unreadCount > 0 && (
                                            <span className="ml-1.5 rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-fg">
                                                {form.unreadCount} {form.unreadCount === 1 ? "novo" : "novos"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="hidden px-4 py-3 md:table-cell">
                                        <ActiveBadge active={form.isActive} />
                                    </td>
                                    <td className="hidden px-4 py-3 text-muted lg:table-cell">{formatDate(t, form.updatedAt)}</td>
                                </ClickableRow>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

