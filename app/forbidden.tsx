import Link from "next/link";
import { Card, EmptyState, buttonStyles } from "./components/ui";
import { ShieldIcon } from "./components/Icons";
import { getT } from "@/lib/i18n-server";

export default async function Forbidden() {
    const t = await getT();
    return (
        <Card className="mt-10">
            <EmptyState
                icon={<ShieldIcon />}
                title={t("Acesso negado")}
                description={t("Seu cargo não tem permissão para acessar esta página. Fale com um administrador se precisar de acesso.")}
                action={
                    <Link href="/" className={buttonStyles.secondary}>
                        {t("Voltar ao painel")}
                    </Link>
                }
            />
        </Card>
    );
}
