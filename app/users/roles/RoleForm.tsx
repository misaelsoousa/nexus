"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteRoleAction, saveRoleAction, type ActionState } from "@/app/actions";
import { PERMISSION_GROUPS, viewPermissionOf, type Permission } from "@/lib/permissions";
import type { Role } from "@/types/User";
import { Notice, buttonStyles, inputStyles } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function RoleForm({ role, notice }: { role?: Role; notice?: string }) {
    const t = useT();
    const [state, formAction, pending] = useActionState<ActionState, FormData>(saveRoleAction, notice ? { success: notice } : {});
    const [granted, setGranted] = useState<Set<Permission>>(new Set(role?.permissions ?? []));
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, startDelete] = useTransition();

    function toggle(permission: Permission, checked: boolean) {
        setGranted((current) => {
            const next = new Set(current);
            const view = viewPermissionOf(permission);

            if (checked) {
                next.add(permission);
                next.add(view);
            } else if (permission === view) {
                // Sem "ver", nenhuma outra ação da área faz sentido.
                for (const item of current) {
                    if (viewPermissionOf(item) === view) next.delete(item);
                }
            } else {
                next.delete(permission);
            }

            return next;
        });
    }

    function remove() {
        if (!role || !window.confirm(t("Excluir o cargo \"{name}\"?", { name: role.name }))) return;

        setDeleteError(null);
        startDelete(async () => {
            const result = await deleteRoleAction(role.id);
            if (result?.error) setDeleteError(result.error);
        });
    }

    const error = state.error ?? deleteError;

    return (
        <form action={formAction} className="flex flex-col gap-4 p-4">
            {error && <Notice>{error}</Notice>}
            {!error && state.success && <Notice tone="success">{state.success}</Notice>}
            {role && <input type="hidden" name="id" value={role.id} />}

            <div>
                <label htmlFor="role-name" className="mb-1.5 block text-[13px] font-medium">{t("Nome")}</label>
                <input
                    id="role-name"
                    name="name"
                    required
                    maxLength={100}
                    placeholder={t("Ex.: Editor")}
                    defaultValue={state.values?.name ?? role?.name}
                    className={inputStyles}
                />
            </div>

            <fieldset className="flex flex-col gap-3">
                <legend className="mb-1.5 text-[13px] font-medium">{t("Permissões")}</legend>
                {PERMISSION_GROUPS.map((group) => (
                    <div key={group.label} className="rounded-md border border-line">
                        <p className="border-b border-line bg-surface-2/50 px-3 py-1.5 text-xs font-semibold">{t(group.label)}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 px-3 py-2.5">
                            {group.permissions.map((item) => (
                                <label key={item.key} className="flex items-center gap-1.5 text-[13px]">
                                    <input
                                        type="checkbox"
                                        name="permissions"
                                        value={item.key}
                                        checked={granted.has(item.key)}
                                        onChange={(event) => toggle(item.key, event.target.checked)}
                                        className="size-4 accent-[var(--accent)]"
                                    />
                                    {t(item.label)}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <p className="text-xs text-muted">{t("Marcar qualquer ação de uma área também libera ver essa área.")}</p>
            </fieldset>

            <div className="flex items-center justify-between gap-3">
                {role ? (
                    <button type="button" onClick={remove} disabled={deleting || pending} className="text-[13px] text-danger hover:underline cursor-pointer disabled:opacity-50">
                        {deleting ? t("Excluindo...") : t("Excluir cargo")}
                    </button>
                ) : (
                    <span />
                )}
                <button type="submit" disabled={pending || deleting} className={buttonStyles.primary}>
                    {pending ? t("Salvando...") : role ? t("Salvar cargo") : t("Adicionar cargo")}
                </button>
            </div>
        </form>
    );
}
