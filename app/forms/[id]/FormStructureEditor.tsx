"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteFormAction, updateFormAction, type ActionState } from "@/app/actions";
import type { FormDetails } from "@/types/Form";
import FieldsBuilder, { toField, toRows, type FieldRow } from "../../components/fields/FieldsBuilder";
import { Card, CardHeader, Notice, buttonStyles, formatDate, inputStyles } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

function parseEmails(value: string) {
    return [...new Set(value.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))];
}

export default function FormStructureEditor({
    form,
    smtpConfigured,
    notice,
}: {
    form: FormDetails;
    smtpConfigured: boolean | null;
    notice?: string;
}) {
    const t = useT();
    const [displayName, setDisplayName] = useState(form.displayName);
    const [isActive, setIsActive] = useState(form.isActive);
    const [emails, setEmails] = useState(form.notifyEmails.join("\n"));
    const [rows, setRows] = useState<FieldRow[]>(() => toRows(form.fields));
    const [state, setState] = useState<ActionState>(notice ? { success: notice } : {});
    const [pending, startTransition] = useTransition();
    const notifyEmails = parseEmails(emails);

    function save() {
        startTransition(async () => {
            setState(await updateFormAction(form.id, { displayName, isActive, notifyEmails, fields: rows.map(toField) }));
        });
    }

    function remove() {
        if (!window.confirm(t("Excluir o formulário \"{name}\", todos os envios e os arquivos recebidos?", { name: form.displayName }))) return;
        startTransition(async () => {
            setState(await deleteFormAction(form.id));
        });
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="flex min-w-0 flex-col gap-5">
                {state.error && <Notice>{state.error}</Notice>}
                {state.success && <Notice tone="success">{state.success}</Notice>}

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Detalhes")} />
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="formDisplayName" className="mb-1.5 block text-[13px] font-medium">{t("Nome")}</label>
                            <input id="formDisplayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={inputStyles} />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[13px] font-medium">{t("Identificador")}</span>
                            <p className="flex h-9 items-center rounded-md bg-surface-2 px-3 font-mono text-[13px] text-muted">{form.name}</p>
                        </div>
                        <label className="flex cursor-pointer items-start gap-2 text-[13px] sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) => setIsActive(event.target.checked)}
                                className="mt-0.5 size-4 accent-[var(--accent)]"
                            />
                            <span>
                                {t("Recebendo envios")}
                                <span className="block text-xs text-muted">{t("Desmarcado, a API responde 404 para o site e não aceita novos envios. Os envios já recebidos continuam aqui.")}</span>
                            </span>
                        </label>
                    </div>
                </Card>

                <FieldsBuilder
                    rows={rows}
                    onChange={setRows}
                    scope="form"
                    emptyDescription={t("Adicione os campos que o visitante vai preencher: nome, e-mail, telefone, mensagem, currículo... Use seções para agrupar.")}
                />
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-15 lg:self-start">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Salvar formulário")} />
                    <dl className="flex flex-col gap-2.5 p-4 text-[13px]">
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Campos")}</dt>
                            <dd className="tabular-nums">{rows.filter((row) => row.type !== 9).length}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Criado em")}</dt>
                            <dd>{formatDate(t, form.createdAt, true)}</dd>
                        </div>
                    </dl>
                    <p className="px-4 pb-4 text-xs text-muted">
                        {t("Remover um campo não apaga o que já foi recebido, mas ele deixa de aparecer na listagem e na exportação.")}
                    </p>
                    <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                        <button type="button" onClick={remove} disabled={pending} className="text-[13px] text-danger hover:underline cursor-pointer disabled:opacity-50">
                            {t("Excluir formulário")}
                        </button>
                        <button type="button" onClick={save} disabled={pending} className={buttonStyles.primary}>
                            {pending ? t("Salvando...") : t("Salvar")}
                        </button>
                    </div>
                </Card>

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Notificar por e-mail")} />
                    <div className="flex flex-col gap-2 p-4">
                        <label htmlFor="notifyEmails" className="text-xs text-muted">
                            {t("Quem recebe um e-mail a cada envio. Um por linha. O primeiro campo do tipo E-mail vira o \"responder para\".")}
                        </label>
                        <textarea
                            id="notifyEmails"
                            rows={3}
                            value={emails}
                            placeholder={t("rh@empresa.com.br")}
                            onChange={(event) => setEmails(event.target.value)}
                            className={`${inputStyles} h-auto py-2 font-mono text-xs`}
                        />
                        {notifyEmails.length > 0 && smtpConfigured === false && (
                            <Notice tone="warning">
                                {t("O envio de e-mails ainda não foi configurado.")} <Link href="/settings/email" className="underline">{t("Configurar SMTP")}</Link>
                            </Notice>
                        )}
                        {notifyEmails.length > 0 && smtpConfigured === null && (
                            <p className="text-xs text-muted">{t("Os e-mails só saem se um administrador tiver configurado o SMTP.")}</p>
                        )}
                    </div>
                </Card>
            </aside>
        </div>
    );
}
