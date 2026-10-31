import type { Metadata } from "next";
import { cookies } from "next/headers";
import { logoutAction } from "../actions";
import { API_BASE_URL } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getLanguages } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import type { Language } from "@/types/Language";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { LogoutIcon } from "../components/Icons";
import { Card, CardHeader, buttonStyles, formatDate } from "../components/ui";
import LanguageSettings from "./LanguageSettings";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Configurações") };
}

export default async function SettingsPage() {
    const t = await getT();
    const session = readSession((await cookies()).get(SESSION_COOKIE)?.value);
    const user = await getCurrentUser();
    const languages = await getLanguages().catch((): Language[] => []);
    const placeholder = (path: string) => new URL(path, API_BASE_URL).toString().replace("%7B", "{").replace("%7D", "}");
    const contentUrl = placeholder(`content/{${t("tipo")}}`);
    const pageUrl = placeholder(`page/{${t("identificador")}}`);
    const formUrl = placeholder(`form/{${t("identificador")}}/submissions`);

    return (
        <div className="flex flex-col gap-5">
            {session && (
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Conta")} />
                    <div className="flex flex-col gap-4 p-4 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
                            <dt className="text-muted">{t("Nome")}</dt>
                            <dd>{session.name}</dd>
                            <dt className="text-muted">{t("E-mail")}</dt>
                            <dd>{session.email}</dd>
                            <dt className="text-muted">{t("Cargo")}</dt>
                            <dd>{user?.role?.name ?? t("Sem cargo")}</dd>
                            <dt className="text-muted">{t("Sessão expira em")}</dt>
                            <dd>{formatDate(t, new Date(session.expiresAt).toISOString())}</dd>
                        </dl>
                        <form action={logoutAction}>
                            <button type="submit" className={buttonStyles.secondary}>
                                <LogoutIcon className="size-4" />
                                {t("Sair")}
                            </button>
                        </form>
                    </div>
                </Card>
            )}

            <Card className="animate-rise overflow-hidden">
                <CardHeader title={t("Idiomas do conteúdo")} />
                <LanguageSettings languages={languages} canManage={Boolean(user?.isAdmin)} />
            </Card>

            <Card className="animate-rise overflow-hidden">
                <CardHeader title={t("API")} />
                <dl className="grid gap-x-6 gap-y-3 p-4 text-[13px] sm:grid-cols-[auto_1fr]">
                    <dt className="text-muted">{t("Endereço da API")}</dt>
                    <dd className="break-all font-mono">{API_BASE_URL}</dd>
                    <dt className="text-muted">{t("Conteúdo público")}</dt>
                    <dd>
                        <code className="break-all font-mono">GET {contentUrl}</code>
                        <span className="mt-0.5 block text-xs text-muted">
                            {t("Lista os posts publicados de um tipo. Acrescente {suffix} para um post específico. Não exige login.", { suffix: "/{slug}" })}
                        </span>
                    </dd>
                    <dt className="text-muted">{t("Páginas")}</dt>
                    <dd>
                        <code className="break-all font-mono">GET {pageUrl}</code>
                        <span className="mt-0.5 block text-xs text-muted">
                            {t("Devolve os campos de uma página. Nas duas rotas, {param} escolhe o idioma.", { param: "?lang=en" })}
                        </span>
                    </dd>
                    <dt className="text-muted">{t("Formulários")}</dt>
                    <dd>
                        <code className="break-all font-mono">POST {formUrl}</code>
                        <span className="mt-0.5 block text-xs text-muted">
                            {t("Recebe um envio do site (multipart/form-data ou JSON). {method} sem o {suffix} devolve os campos do formulário.", { method: "GET", suffix: "/submissions" })}
                        </span>
                    </dd>
                </dl>
            </Card>
        </div>
    );
}
