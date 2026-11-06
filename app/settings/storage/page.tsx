import type { Metadata } from "next";
import { getErrorMessage, getStorageOverview } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import type { StorageOverview } from "@/types/Storage";
import { Notice } from "../../components/ui";
import StorageManager from "./StorageManager";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Armazenamento") };
}

export default async function StoragePage() {
    const t = await getT();
    await requireAdmin();

    let overview: StorageOverview | null = null;
    let error: string | null = null;

    try {
        overview = await getStorageOverview();
    } catch (e) {
        error = getErrorMessage(e);
    }

    return (
        <>
            <p className="animate-rise mb-5 max-w-2xl text-[13px] text-muted">
                {t("Onde os arquivos da biblioteca de mídia ficam guardados. Cada arquivo lembra onde está, então trocar o armazenamento não quebra nada: só os próximos uploads vão para o novo.")}
            </p>

            {error || !overview ? <Notice>{error ?? t("Ocorreu um erro inesperado.")}</Notice> : <StorageManager overview={overview} />}
        </>
    );
}
