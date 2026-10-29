import type { Metadata } from "next";
import Link from "next/link";
import { getErrorMessage, getRoles, getUsers } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import type { Role, User } from "@/types/User";
import { Card, CardHeader, Notice, PageHeader, buttonStyles, firstParam } from "../components/ui";
import CreateUserForm from "./CreateUserForm";
import UsersTable from "./UsersTable";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Usuários") };
}

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
    const t = await getT();
    const currentUser = await requireAdmin();
    const params = await searchParams;

    let users: User[] = [];
    let roles: Role[] = [];
    let error: string | null = null;

    try {
        [users, roles] = await Promise.all([getUsers(), getRoles()]);
    } catch (e) {
        error = t(getErrorMessage(e));
    }

    return (
        <>
            <PageHeader
                title={t("Usuários")}
                description={t("Contas com acesso ao painel. O cargo de cada usuário define o que ele pode fazer.")}
                actions={
                    <Link href="/users/roles" className={buttonStyles.outline}>
                        {t("Gerenciar cargos")}
                    </Link>
                }
            />

            {error && (
                <div className="mb-5">
                    <Notice>{error}</Notice>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="animate-rise h-fit overflow-hidden">
                    <CardHeader title={t("Adicionar novo usuário")} />
                    <CreateUserForm roles={roles} autoFocus={Boolean(firstParam(params.new))} />
                </Card>

                <UsersTable users={users} roles={roles} currentUserId={currentUser.id} emptyMessage={error ? t("Não foi possível carregar os usuários.") : t("Nenhum usuário.")} />
            </div>
        </>
    );
}
