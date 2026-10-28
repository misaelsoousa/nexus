import { getT } from "@/lib/i18n-server";
export default async function ActiveBadge({ active }: { active: boolean }) {
    const t = await getT();
    return (
        <span className={`inline-flex h-5 items-center gap-1.5 rounded px-1.5 text-xs font-medium ${active ? "bg-success-soft text-success" : "bg-surface-3 text-muted"}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {active ? t("Recebendo envios") : t("Pausado")}
        </span>
    );
}
