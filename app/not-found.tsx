import Link from "next/link";
import { Card, EmptyState, buttonStyles } from "./components/ui";
import { AlertIcon } from "./components/Icons";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
    const t = await getT();
    return (
        <Card className="mt-10">
            <EmptyState
                icon={<AlertIcon />}
                title={t("Página não encontrada")}
                description={t("O conteúdo que você procura não existe ou foi removido.")}
                action={
                    <Link href="/" className={buttonStyles.secondary}>
                        {t("Voltar ao painel")}
                    </Link>
                }
            />
        </Card>
    );
}
