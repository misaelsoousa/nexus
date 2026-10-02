"use client";

import { useActionState } from "react";
import { registerAction, type ActionState } from "@/app/actions";
import { AuthField } from "../components/AuthCard";
import { Notice, buttonStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function RegisterForm() {
    const t = useT();
    const [state, formAction, pending] = useActionState<ActionState, FormData>(registerAction, {});

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {state.error && <Notice>{state.error}</Notice>}

            <AuthField
                label={t("Nome")}
                id="name"
                name="name"
                defaultValue={state.values?.name}
                autoComplete="name"
                required
                autoFocus
                placeholder={t("Seu nome")}
            />
            <AuthField
                label={t("E-mail")}
                id="email"
                name="email"
                defaultValue={state.values?.email}
                type="email"
                autoComplete="email"
                required
                placeholder={t("voce@exemplo.com")}
            />
            <AuthField
                label={t("Senha")}
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder={t("Mínimo de 8 caracteres")}
            />
            <AuthField
                label={t("Confirmar senha")}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder={t("Repita a senha")}
            />

            <button type="submit" disabled={pending} className={`${buttonStyles.neutral} mt-2 h-9 w-full`}>
                {pending ? t("Criando conta…") : t("Criar conta")}
            </button>
        </form>
    );
}
