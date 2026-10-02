import type { Metadata } from "next";
import Link from "next/link";
import { getAuthStatus } from "@/lib/api";
import AuthCard from "../components/AuthCard";
import LoginForm from "./LoginForm";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Entrar") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
    const t = await getT();
    const next = (await searchParams).next;
    const status = await getAuthStatus().catch(() => null);

    return (
        <AuthCard
            title={t("Entrar")}
            description={t("Acesse o painel do Nexus com sua conta.")}
            footer={
                status?.registrationOpen ? (
                    <>
                        {t("Primeiro acesso?")}{" "}
                        <Link href="/register" className="font-medium text-fg hover:underline">
                            {t("Criar conta de administrador")}
                        </Link>
                    </>
                ) : (
                    t("Não tem conta? Peça a um administrador.")
                )
            }
        >
            <LoginForm next={typeof next === "string" ? next : undefined} />
        </AuthCard>
    );
}
