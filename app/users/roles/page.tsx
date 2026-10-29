import type { Metadata } from "next";
import Link from "next/link";
import ClickableRow from "../../components/ClickableRow";
import { getErrorMessage, getRoles } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { PERMISSION_GROUPS } from "@/lib/permissions";
import type { Role } from "@/types/User";
import { Card, CardHeader, Notice, PageHeader, buttonStyles, firstParam } from "../../components/ui";
import RoleForm from "./RoleForm";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Cargos") };
}

function summarize(t: T, role: Role) {
    if (role.isAdmin) {
        return t("Acesso total, incluindo usuários e cargos");
    }

    const parts = PERMISSION_GROUPS.map((group) => {
        const granted = group.permissions.filter((item) => role.permissions.includes(item.key));
        return granted.length > 0 ? `${t(group.label)}: ${granted.map((item) => t(item.label).toLowerCase()).join(", ")}` : null;
    }).filter(Boolean);

    return parts.length > 0 ? parts.join(" · ") : t("Nenhuma permissão");
}

export default async function RolesPage({ searchParams }: PageProps<"/users/roles">) {
    const t = await getT();
    await requireAdmin();
    const params = await searchParams;
    const editId = firstParam(params.edit);

    let roles: Role[] = [];
    let error: string | null = null;

    try {
        roles = await getRoles();
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    const editing = roles.find((role) => role.id === editId && !role.isAdmin);

    return (
        <>
            <PageHeader
                eyebrow={<Link href="/users" className="hover:underline">{t("Usuários")}</Link>}
                title={t("Cargos")}
                description={t("Cada cargo reúne as ações que seus usuários podem fazer no painel. Só administradores gerenciam usuários e cargos.")}
                actions={
                    editing && (
                        <Link href="/users/roles" className={buttonStyles.outline}>
                            {t("Adicionar novo")}
                        </Link>
                    )
                }
            />

            {error && (
                <div className="mb-5">
                    <Notice>{error}</Notice>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <Card className="animate-rise h-fit overflow-hidden">
                    <CardHeader title={editing ? `Editar "${editing.name}"` : t("Adicionar novo cargo")} />
                    <RoleForm
                        key={editing?.id ?? "new"}
                        role={editing}
                        notice={firstParam(params.created) ? t("Cargo criado.") : undefined}
                    />
                </Card>

                <div className="animate-rise min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="border-b border-line text-left">
                                <th className="px-4 py-2.5 font-medium">{t("Cargo")}</th>
                                <th className="px-4 py-2.5 text-right font-medium">{t("Usuários")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-10 text-center text-muted">
                                        {error ? t("Não foi possível carregar os cargos.") : t("Nenhum cargo.")}
                                    </td>
                                </tr>
                            ) : (
                                roles.map((role) => (
                                    <ClickableRow key={role.id} href={role.isAdmin ? null : `/users/roles?edit=${role.id}`} aria-selected={role.id === editing?.id} className="align-top transition-colors hover:bg-surface-2/60 aria-selected:bg-accent-soft">
                                        <td className="px-4 py-3">
                                            {role.isAdmin ? (
                                                <span className="font-semibold">{role.name}</span>
                                            ) : (
                                                <Link href={`/users/roles?edit=${role.id}`} className="font-semibold text-accent hover:underline">
                                                    {role.name}
                                                </Link>
                                            )}
                                            <span className="mt-0.5 block text-xs text-muted">{summarize(t, role)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">{role.userCount}</td>
                                    </ClickableRow>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
