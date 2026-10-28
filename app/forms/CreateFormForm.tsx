"use client";

import { useActionState, useState } from "react";
import { createFormAction, type ActionState } from "@/app/actions";
import { slugify } from "@/lib/slug";
import { Notice, buttonStyles, inputStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";
import { rich } from "@/lib/rich";

export default function CreateFormForm({ onCancel }: { onCancel: () => void }) {
    const t = useT();
    const [displayName, setDisplayName] = useState("");
    const [name, setName] = useState("");
    const [nameEdited, setNameEdited] = useState(false);
    const [state, formAction, pending] = useActionState<ActionState, FormData>(createFormAction, {});

    const currentName = nameEdited ? name : slugify(displayName);

    return (
        <form action={formAction} className="flex flex-col gap-4 p-4">
            {state.error && <Notice>{state.error}</Notice>}

            <div>
                <label htmlFor="displayName" className="mb-1.5 block text-[13px] font-medium">{t("Nome")}</label>
                <input
                    id="displayName"
                    name="displayName"
                    required
                    autoFocus
                    placeholder={t("Ex.: Trabalhe conosco")}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className={inputStyles}
                />
                <p className="mt-1.5 text-xs text-muted">{t("O nome como aparece no painel e no assunto dos e-mails de notificação.")}</p>
            </div>

            <div>
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium">{t("Identificador")}</label>
                <input
                    id="name"
                    name="name"
                    required
                    placeholder={t("trabalhe-conosco")}
                    value={currentName}
                    onChange={(event) => {
                        setNameEdited(true);
                        setName(slugify(event.target.value) || event.target.value.toLowerCase());
                    }}
                    className={`${inputStyles} font-mono text-[13px]`}
                />
                <p className="mt-1.5 text-xs text-muted">
                    {rich(t("O site envia para {path}. Não pode ser alterado depois."), { path: <code className="font-mono">/api/form/{currentName || t("identificador")}/submissions</code> })}
                </p>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className={buttonStyles.ghost}>
                    {t("Cancelar")}
                </button>
                <button type="submit" disabled={pending} className={buttonStyles.primary}>
                    {pending ? t("Criando...") : t("Criar e definir campos")}
                </button>
            </div>
        </form>
    );
}
