"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions";
import { AuthField } from "../components/AuthCard";
import PasswordField from "../components/PasswordField";
import { Notice, buttonStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function LoginForm({ next }: { next?: string }) {
    const t = useT();
    const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, {});

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {state.error && <Notice>{state.error}</Notice>}
            <input type="hidden" name="next" value={next ?? "/"} />

            <AuthField
                label={t("E-mail")}
                id="email"
                name="email"
                defaultValue={state.values?.email}
                type="email"
                autoComplete="email"
                required
                autoFocus
                placeholder="admin@gmail.com"
            />
            <PasswordField
                label={t("Senha")}
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
            />

            <button type="submit" disabled={pending} className={`${buttonStyles.neutral} mt-2 h-9 w-full`}>
                {pending ? t("Entrando…") : t("Entrar")}
            </button>
        </form>
    );
}
