import type { Metadata } from "next";
import { getErrorMessage, getSmtpSettings } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import type { SmtpSettings } from "@/types/Form";
import { Notice } from "../../components/ui";
import SmtpSettingsForm from "./SmtpSettingsForm";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("E-mail (SMTP)") };
}

export default async function EmailSettingsPage() {
    const t = await getT();
    const user = await requireAdmin();

    let settings: SmtpSettings | null = null;
    let error: string | null = null;

    try {
        settings = await getSmtpSettings();
    } catch (e) {
        error = getErrorMessage(e);
    }

    return (
        <>
            <p className="animate-rise mb-5 max-w-2xl text-[13px] text-muted">
                {t("Servidor usado para enviar as notificações dos formulários. Funciona com qualquer provedor SMTP: Gmail, Outlook, Amazon SES, SendGrid, Mailgun, o servidor da sua hospedagem...")}
            </p>

            {error || !settings ? <Notice>{error ?? t("Ocorreu um erro inesperado.")}</Notice> : <SmtpSettingsForm settings={settings} defaultTestEmail={user.email} />}
        </>
    );
}
