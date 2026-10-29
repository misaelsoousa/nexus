"use client";

import { useActionState, useRef } from "react";
import { createUserAction, type ActionState } from "@/app/actions";
import type { Role } from "@/types/User";
import PasswordField from "../components/PasswordField";
import { Notice, buttonStyles, inputStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function CreateUserForm({ roles, autoFocus = false }: { roles: Role[]; autoFocus?: boolean }) {
    const t = useT();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, pending] = useActionState<ActionState, FormData>(async (previous, formData) => {
        const result = await createUserAction(previous, formData);

        if (result.success) {
            formRef.current?.reset();
        }

        return result;
    }, {});

    return (
        <form ref={formRef} action={formAction} className="flex flex-col gap-4 p-4">
            {state.error && <Notice>{state.error}</Notice>}
            {state.success && <Notice tone="success">{state.success}</Notice>}

            <div>
                <label htmlFor="user-name" className="mb-1.5 block text-[13px] font-medium">{t("Nome")}</label>
                <input id="user-name" name="name" required autoFocus={autoFocus} autoComplete="off" defaultValue={state.values?.name} className={inputStyles} />
            </div>

            <div>
                <label htmlFor="user-email" className="mb-1.5 block text-[13px] font-medium">{t("E-mail")}</label>
                <input id="user-email" name="email" type="email" required autoComplete="off" defaultValue={state.values?.email} className={inputStyles} />
            </div>

            <div>
                <PasswordField label={t("Senha")} id="user-password" name="password" required minLength={8} autoComplete="new-password" placeholder={t("Mínimo de 8 caracteres")} />
                <p className="mt-1.5 text-xs text-muted">{t("Envie a senha para a pessoa por um canal seguro.")}</p>
            </div>

            <div>
                <label htmlFor="user-role" className="mb-1.5 block text-[13px] font-medium">{t("Cargo")}</label>
                <select id="user-role" name="roleId" defaultValue={state.values?.roleId ?? ""} className={inputStyles}>
                    <option value="">{t("Sem cargo (sem acesso)")}</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
            </div>

            <button type="submit" disabled={pending} className={`${buttonStyles.primary} self-start`}>
                {pending ? t("Criando...") : t("Adicionar usuário")}
            </button>
        </form>
    );
}
