"use client";

import { useActionState, useState, useTransition } from "react";
import { createLanguageAction, deleteLanguageAction, setDefaultLanguageAction, updateLanguageAction, type ActionState } from "@/app/actions";
import type { Language } from "@/types/Language";
import { PlusIcon } from "../components/Icons";
import { Notice, buttonStyles, inputStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";
import { rich } from "@/lib/rich";

export default function LanguageSettings({ languages, canManage }: { languages: Language[]; canManage: boolean }) {
    const t = useT();
    const [editing, setEditing] = useState<string | null>(null);
    const [result, setResult] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();
    const [createState, createAction, creating] = useActionState<ActionState, FormData>(createLanguageAction, {});

    function run(action: () => Promise<ActionState>) {
        startTransition(async () => {
            const response = await action();
            setResult(response);
            if (!response.error) setEditing(null);
        });
    }

    function remove(language: Language) {
        if (!window.confirm(t("Remover {name}? As traduções já salvas deixam de aparecer na API, mas voltam se o idioma for adicionado de novo com o mesmo código.", { name: language.name }))) return;
        run(() => deleteLanguageAction(language.code));
    }

    function makeDefault(language: Language) {
        const current = languages.find((item) => item.isDefault);
        const message = [
            t("Tornar {name} o idioma padrão?", { name: language.name }),
            t("Em cada post e página com versão própria em {name}, ela vira o conteúdo principal e o conteúdo atual passa a ser a tradução em {current}.", { name: language.name, current: current?.name ?? t("idioma atual") }),
            t("Onde {name} usa o mesmo conteúdo do padrão, nada muda no texto.", { name: language.name }),
            t("Sem ?lang, a API passa a responder em {name}.", { name: language.name }),
        ].join("\n\n");

        if (!window.confirm(message)) return;
        run(() => setDefaultLanguageAction(language.code, language.name));
    }

    const feedback = result.error || result.success ? result : createState;

    return (
        <div className="flex flex-col gap-4 p-4 text-[13px]">
            <p className="text-muted">
                {rich(t("Posts e páginas ganham uma aba por idioma. O site escolhe a versão com {param}; sem o parâmetro, a API devolve o idioma padrão."), { param: <code className="font-mono text-fg">?lang={t("código")}</code> })}
            </p>

            {feedback.error && <Notice>{feedback.error}</Notice>}
            {feedback.success && <Notice tone="success">{feedback.success}</Notice>}

            <ul className="divide-y divide-line rounded-md border border-line">
                {languages.map((language) =>
                    editing === language.code ? (
                        <li key={language.code}>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const data = new FormData(event.currentTarget);
                                    run(() => updateLanguageAction(language.code, String(data.get("code") ?? language.code), String(data.get("name") ?? "")));
                                }}
                                className="flex flex-wrap items-center gap-2 px-3 py-2"
                            >
                                <input name="name" defaultValue={language.name} aria-label={t("Nome do idioma")} required autoFocus className={`${inputStyles} h-8 w-44`} />
                                <input
                                    name="code"
                                    defaultValue={language.code}
                                    aria-label={t("Código do idioma")}
                                    required
                                    readOnly={!language.isDefault}
                                    title={language.isDefault ? undefined : t("O código identifica as traduções salvas e não pode ser alterado.")}
                                    className={`${inputStyles} h-8 w-28 font-mono read-only:bg-surface-2 read-only:text-muted`}
                                />
                                <div className="ml-auto flex gap-1">
                                    <button type="button" onClick={() => setEditing(null)} className={buttonStyles.ghost}>{t("Cancelar")}</button>
                                    <button type="submit" disabled={pending} className={buttonStyles.primary}>{t("Salvar")}</button>
                                </div>
                            </form>
                        </li>
                    ) : (
                        <li key={language.code} className="flex items-center gap-3 px-3 py-2.5">
                            <span className="font-medium">{language.name}</span>
                            <code className="font-mono text-xs text-muted">{language.code}</code>
                            {language.isDefault && <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">{t("Padrão")}</span>}
                            {canManage && (
                                <div className="ml-auto flex gap-3 text-xs">
                                    <button type="button" onClick={() => setEditing(language.code)} className="text-accent hover:underline cursor-pointer">
                                        {t("Editar")}
                                    </button>
                                    {!language.isDefault && (
                                        <>
                                            <button type="button" onClick={() => makeDefault(language)} disabled={pending} className="text-accent hover:underline cursor-pointer">
                                                {t("Tornar padrão")}
                                            </button>
                                            <button type="button" onClick={() => remove(language)} disabled={pending} className="text-danger hover:underline cursor-pointer">
                                                {t("Remover")}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    ),
                )}
            </ul>

            {canManage && (
                <form action={createAction} onSubmit={() => setResult({})} className="flex flex-wrap items-end gap-2">
                    <div>
                        <label htmlFor="language-name" className="mb-1 block text-xs font-medium text-muted">{t("Nome")}</label>
                        <input id="language-name" name="name" required placeholder="English" defaultValue={createState.values?.name} key={`name-${createState.success ?? ""}`} className={`${inputStyles} w-44`} />
                    </div>
                    <div>
                        <label htmlFor="language-code" className="mb-1 block text-xs font-medium text-muted">{t("Código")}</label>
                        <input id="language-code" name="code" required placeholder="en" defaultValue={createState.values?.code} key={`code-${createState.success ?? ""}`} className={`${inputStyles} w-28 font-mono`} />
                    </div>
                    <button type="submit" disabled={creating} className={buttonStyles.secondary}>
                        <PlusIcon className="size-4" />
                        {creating ? t("Adicionando...") : t("Adicionar idioma")}
                    </button>
                </form>
            )}
        </div>
    );
}
