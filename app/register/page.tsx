import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/api";
import AuthCard from "../components/AuthCard";
import RegisterForm from "./RegisterForm";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Criar conta") };
}

export default async function RegisterPage() {
    const t = await getT();
    const status = await getAuthStatus().catch(() => null);

    // O cadastro público só existe para criar o primeiro administrador.
    if (status && !status.registrationOpen) {
        redirect("/login");
    }

    return (
        <AuthCard
            title={t("Criar conta de administrador")}
            description={t("Esta é a primeira conta do Nexus e terá acesso total. As próximas contas serão criadas por você no painel.")}
            footer={
                <>
                    {t("Já tem uma conta?")}{" "}
                    <Link href="/login" className="font-medium text-fg hover:underline">
                        {t("Entrar")}
                    </Link>
                </>
            }
        >
            <RegisterForm />
        </AuthCard>
    );
}
