"use client";

import { useState, useTransition } from "react";
import { deleteUserAction, updateUserRoleAction, type ActionState } from "@/app/actions";
import type { Role, User } from "@/types/User";
import { Notice, compactSelectStyles, formatDate } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function UsersTable({
    users,
    roles,
    currentUserId,
    emptyMessage,
}: {
    users: User[];
    roles: Role[];
    currentUserId: string;
    emptyMessage: string;
}) {
    const t = useT();
    const [result, setResult] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    function run(action: () => Promise<ActionState>) {
        startTransition(async () => setResult(await action()));
    }

    function changeRole(user: User, roleId: string) {
        if (user.id === currentUserId && user.role?.isAdmin && !roles.find((role) => role.id === roleId)?.isAdmin) {
            if (!window.confirm(t("Você vai perder o acesso de administrador. Continuar?"))) return;
        }

        run(() => updateUserRoleAction(user.id, roleId || null));
    }

    function remove(user: User) {
        if (!window.confirm(t("Excluir a conta de {name}? Essa pessoa não conseguirá mais entrar no painel.", { name: user.name }))) return;
        run(() => deleteUserAction(user.id));
    }

    return (
        <div className="flex min-w-0 flex-col gap-3">
            {result.error && <Notice>{result.error}</Notice>}
            {result.success && <Notice tone="success">{result.success}</Notice>}

            <div className="animate-rise overflow-hidden rounded-lg border border-line bg-surface">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="border-b border-line text-left">
                            <th className="px-4 py-2.5 font-medium">{t("Nome")}</th>
                            <th className="px-4 py-2.5 font-medium">{t("Cargo")}</th>
                            <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t("Desde")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-10 text-center text-muted">{emptyMessage}</td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const isSelf = user.id === currentUserId;

                                return (
                                    <tr key={user.id} className="group align-top transition-colors hover:bg-surface-2/60">
                                        <td className="max-w-0 px-4 py-3 w-full">
                                            <span className="block truncate font-semibold">
                                                {user.name}
                                                {isSelf && <span className="font-normal text-muted"> — {t("você")}</span>}
                                            </span>
                                            <span className="block truncate text-xs text-muted">{user.email}</span>
                                            {!isSelf && (
                                                <div className="mt-1 text-xs transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                                                    <button type="button" onClick={() => remove(user)} disabled={pending} className="text-danger hover:underline cursor-pointer disabled:opacity-50">
                                                        {t("Excluir")}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                aria-label={t("Cargo de {name}", { name: user.name })}
                                                value={user.role?.id ?? ""}
                                                disabled={pending}
                                                onChange={(event) => changeRole(user, event.target.value)}
                                                className={`${compactSelectStyles} max-w-48`}
                                            >
                                                <option value="">{t("Sem cargo")}</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="hidden whitespace-nowrap px-4 py-3 text-muted md:table-cell">{formatDate(t, user.createdAt, true)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
