"use client";

import { useState, useTransition } from "react";
import { deleteSmtpSettingsAction, saveSmtpSettingsAction, testSmtpSettingsAction, type ActionState } from "@/app/actions";
import type { SaveSmtpSettingsRequest, SmtpSettings } from "@/types/Form";
import PasswordField from "../../components/PasswordField";
import { Card, CardHeader, Notice, buttonStyles, formatDate, inputStyles } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

const PRESETS = [
    { label: "Gmail / Google Workspace", host: "smtp.gmail.com", port: 587 },
    { label: "Outlook / Microsoft 365", host: "smtp.office365.com", port: 587 },
    { label: "Amazon SES (us-east-1)", host: "email-smtp.us-east-1.amazonaws.com", port: 587 },
    { label: "SendGrid", host: "smtp.sendgrid.net", port: 587 },
];

const label = "mb-1.5 block text-[13px] font-medium";
const hint = "mt-1.5 text-xs text-muted";

export default function SmtpSettingsForm({ settings, defaultTestEmail }: { settings: SmtpSettings; defaultTestEmail: string }) {
    const t = useT();
    const [host, setHost] = useState(settings.host);
    const [port, setPort] = useState(String(settings.port));
    const [useSsl, setUseSsl] = useState(settings.useSsl);
    const [username, setUsername] = useState(settings.username ?? "");
    const [password, setPassword] = useState("");
    const [fromEmail, setFromEmail] = useState(settings.fromEmail);
    const [fromName, setFromName] = useState(settings.fromName ?? "");
    const [testTo, setTestTo] = useState(defaultTestEmail);
    const [state, setState] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    function body(): SaveSmtpSettingsRequest {
        return {
            host: host.trim(),
            port: Number(port) || 0,
            useSsl,
            username: username.trim() || null,
            password: password || null,
            fromEmail: fromEmail.trim(),
            fromName: fromName.trim() || null,
        };
    }

    function run(action: () => Promise<ActionState>) {
        startTransition(async () => {
            const result = await action();
            setState(result);
            if (!result.error) setPassword("");
        });
    }

    function remove() {
        if (!window.confirm(t("Remover a configuração de e-mail? Os formulários deixam de enviar notificações."))) return;
        run(async () => {
            const result = await deleteSmtpSettingsAction();
            if (!result.error) {
                setHost("");
                setPort("587");
                setUseSsl(true);
                setUsername("");
                setFromEmail("");
                setFromName("");
            }
            return result;
        });
    }

    const passwordHint = settings.hasPassword
        ? t("Já existe uma senha salva. Deixe em branco para mantê-la.")
        : t("Para Gmail e Outlook com verificação em duas etapas, use uma senha de app.");

    return (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="flex min-w-0 flex-col gap-5">
                {state.error && <Notice>{state.error}</Notice>}
                {state.success && <Notice tone="success">{state.success}</Notice>}

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Servidor")} />
                    <div className="grid gap-4 p-4 sm:grid-cols-[1fr_120px]">
                        <div>
                            <label htmlFor="smtpHost" className={label}>{t("Servidor SMTP")}</label>
                            <input id="smtpHost" value={host} placeholder={t("smtp.seuprovedor.com")} onChange={(event) => setHost(event.target.value)} className={`${inputStyles} font-mono text-[13px]`} />
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.host}
                                        type="button"
                                        onClick={() => {
                                            setHost(preset.host);
                                            setPort(String(preset.port));
                                            setUseSsl(true);
                                        }}
                                        className="text-accent hover:underline cursor-pointer"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="smtpPort" className={label}>{t("Porta")}</label>
                            <input id="smtpPort" type="number" min={1} max={65535} value={port} onChange={(event) => setPort(event.target.value)} className={inputStyles} />
                        </div>
                        <label className="flex cursor-pointer items-start gap-2 text-[13px] sm:col-span-2">
                            <input type="checkbox" checked={useSsl} onChange={(event) => setUseSsl(event.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" />
                            <span>
                                {t("Usar SSL/TLS (STARTTLS)")}
                                <span className="block text-xs text-muted">{t("Recomendado. A porta 465 (SSL implícito) não é suportada: use a 587.")}</span>
                            </span>
                        </label>
                    </div>
                </Card>

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Autenticação")} />
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="smtpUsername" className={label}>{t("Usuário")}</label>
                            <input id="smtpUsername" value={username} autoComplete="off" onChange={(event) => setUsername(event.target.value)} className={inputStyles} />
                            <p className={hint}>{t("Normalmente o próprio e-mail. Deixe vazio se o servidor não exige login.")}</p>
                        </div>
                        <div>
                            <PasswordField
                                label={t("Senha")}
                                id="smtpPassword"
                                name="smtpPassword"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password"
                                placeholder={settings.hasPassword ? "••••••••" : ""}
                                disabled={!username.trim()}
                            />
                            <p className={hint}>{passwordHint} {t("A senha fica criptografada e nunca volta para o painel.")}</p>
                        </div>
                    </div>
                </Card>

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Remetente")} />
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="smtpFromEmail" className={label}>{t("E-mail do remetente")}</label>
                            <input id="smtpFromEmail" type="email" value={fromEmail} placeholder={t("nao-responda@empresa.com.br")} onChange={(event) => setFromEmail(event.target.value)} className={inputStyles} />
                            <p className={hint}>{t("Muitos provedores só aceitam o mesmo e-mail do usuário ou um domínio verificado.")}</p>
                        </div>
                        <div>
                            <label htmlFor="smtpFromName" className={label}>{t("Nome do remetente")}</label>
                            <input id="smtpFromName" value={fromName} placeholder={t("Site da Empresa")} onChange={(event) => setFromName(event.target.value)} className={inputStyles} />
                        </div>
                    </div>
                </Card>
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-15 lg:self-start">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Salvar")} />
                    <p className="p-4 text-[13px] text-muted">
                        {settings.configured ? t("Configurado. Última alteração em {date}.", { date: formatDate(t, settings.updatedAt) }) : t("Ainda não configurado: os formulários não enviam notificações.")}
                    </p>
                    <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                        {settings.configured ? (
                            <button type="button" onClick={remove} disabled={pending} className="text-[13px] text-danger hover:underline cursor-pointer disabled:opacity-50">
                                {t("Remover")}
                            </button>
                        ) : (
                            <span />
                        )}
                        <button type="button" onClick={() => run(() => saveSmtpSettingsAction(body()))} disabled={pending} className={buttonStyles.primary}>
                            {pending ? t("Salvando...") : t("Salvar")}
                        </button>
                    </div>
                </Card>

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Enviar teste")} />
                    <div className="flex flex-col gap-3 p-4">
                        <label htmlFor="smtpTestTo" className="text-xs text-muted">{t("Testa os dados preenchidos acima, mesmo antes de salvar.")}</label>
                        <input id="smtpTestTo" type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} className={inputStyles} />
                        <button type="button" onClick={() => run(() => testSmtpSettingsAction(body(), testTo))} disabled={pending} className={buttonStyles.secondary}>
                            {pending ? t("Enviando...") : t("Enviar e-mail de teste")}
                        </button>
                    </div>
                </Card>
            </aside>
        </div>
    );
}
