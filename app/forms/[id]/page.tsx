import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getErrorMessage, getForm, getFormSubmissions, getSmtpSettings } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { FormDetails, FormSubmissionList } from "@/types/Form";
import { SearchIcon } from "../../components/Icons";
import { Notice, PageHeader, Pagination, buttonStyles, firstParam, inputStyles } from "../../components/ui";
import ActiveBadge from "../ActiveBadge";
import FormIntegration from "./FormIntegration";
import FormStructureEditor from "./FormStructureEditor";
import SubmissionsTable from "./SubmissionsTable";
import { getT } from "@/lib/i18n-server";

const PAGE_SIZE = 20;

async function loadForm(id: string) {
    const t = await getT();
    try {
        return { form: await getForm(id), error: null };
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
            notFound();
        }

        return { form: null as FormDetails | null, error: t(getErrorMessage(error)) };
    }
}

export async function generateMetadata({ params }: PageProps<"/forms/[id]">): Promise<Metadata> {
    const t = await getT();
    const { id } = await params;
    const { form } = await loadForm(id);

    return { title: form ? `Formulário: ${form.displayName}` : t("Formulário") };
}

export default async function FormPage({ params, searchParams }: PageProps<"/forms/[id]">) {
    const t = await getT();
    const user = await requirePermission("forms.view");
    const { id } = await params;
    const query = await searchParams;
    const canManage = can(user, "forms.manage");
    const tab = canManage && firstParam(query.tab) === "structure" ? "structure" : "submissions";
    const { form, error } = await loadForm(id);

    return (
        <>
            <PageHeader
                eyebrow={<Link href="/forms" className="hover:text-fg hover:underline">{t("Formulários")}</Link>}
                title={form?.displayName ?? t("Formulário")}
                actions={form && <ActiveBadge active={form.isActive} />}
            />

            {!form ? (
                <Notice>{error}</Notice>
            ) : (
                <>
                    {canManage && (
                        <nav aria-label={t("Seções do formulário")} className="animate-rise mb-5 flex gap-1 border-b border-line">
                            {[
                                { value: "submissions", label: form.unreadCount > 0 ? t("Envios ({count} novos)", { count: form.unreadCount }) : t("Envios"), href: `/forms/${form.id}` },
                                { value: "structure", label: t("Campos e configurações"), href: `/forms/${form.id}?tab=structure` },
                            ].map((item) => (
                                <Link
                                    key={item.value}
                                    href={item.href}
                                    aria-current={tab === item.value ? "page" : undefined}
                                    className="-mb-px border-b-2 border-transparent px-3 py-2 text-[13px] text-muted transition-colors hover:text-fg aria-[current=page]:border-accent aria-[current=page]:font-medium aria-[current=page]:text-fg"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {tab === "structure" ? (
                        <>
                            <FormStructureEditor
                                form={form}
                                smtpConfigured={user.isAdmin ? await getSmtpSettings().then((smtp) => smtp.configured).catch(() => null) : null}
                                notice={firstParam(query.created) ? t("Formulário \"{name}\" criado. Agora defina os campos.", { name: form.displayName }) : undefined}
                            />
                            <FormIntegration form={form} />
                        </>
                    ) : (
                        <Submissions form={form} search={firstParam(query.s)?.trim() || null} page={Math.max(1, Number(firstParam(query.page) ?? 1) || 1)} canDelete={can(user, "forms.delete")} />
                    )}
                </>
            )}
        </>
    );
}

async function Submissions({ form, search, page, canDelete }: { form: FormDetails; search: string | null; page: number; canDelete: boolean }) {
    const t = await getT();
    let data: FormSubmissionList | null = null;
    let error: string | null = null;

    try {
        data = await getFormSubmissions(form.id, { page, pageSize: PAGE_SIZE, search });
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    const hrefFor = (target: number) => {
        const params = new URLSearchParams();
        if (search) params.set("s", search);
        if (target > 1) params.set("page", String(target));
        const value = params.toString();
        return value ? `/forms/${form.id}?${value}` : `/forms/${form.id}`;
    };

    return (
        <>
            {error && (
                <div className="mb-4">
                    <Notice>{error}</Notice>
                </div>
            )}

            <div className="animate-rise mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-[13px] text-muted">
                    {data ? (data.totalCount === 1 ? t("1 envio") : t("{count} envios", { count: data.totalCount })) : ""}
                    {search && data ? ` ${t("para \"{search}\"", { search })}` : ""}
                </p>

                <div className="flex flex-wrap gap-2">
                    <form action={`/forms/${form.id}`} className="flex gap-2">
                        <label htmlFor="submission-search" className="sr-only">{t("Pesquisar envios")}</label>
                        <input id="submission-search" type="search" name="s" defaultValue={search ?? ""} placeholder={t("Pesquisar envios")} className={`${inputStyles} h-8 md:w-56`} />
                        <button type="submit" className={buttonStyles.secondary}>
                            <SearchIcon className="size-4" />
                            <span className="hidden sm:inline">{t("Pesquisar")}</span>
                        </button>
                    </form>
                    {data && data.totalCount > 0 && (
                        <a href={`/forms/${form.id}/export`} className={buttonStyles.secondary}>
                            {t("Exportar CSV")}
                        </a>
                    )}
                </div>
            </div>

            <SubmissionsTable
                key={`${search}-${page}`}
                form={form}
                submissions={data?.submissions ?? []}
                canDelete={canDelete}
                emptyMessage={
                    error
                        ? t("Não foi possível carregar os envios.")
                        : search
                          ? t("Nenhum envio encontrado para \"{search}\".", { search })
                          : t("Nenhum envio ainda. Veja em Campos e configurações como ligar o formulário ao site.")
                }
            />

            {data && data.totalPages > 1 && (
                <div className="mt-3 rounded-lg border border-line bg-surface">
                    <Pagination t={t} page={data.page} totalPages={data.totalPages} totalCount={data.totalCount} hrefFor={hrefFor} />
                </div>
            )}
        </>
    );
}
