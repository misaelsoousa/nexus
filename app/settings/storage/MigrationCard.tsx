"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
    cancelStorageMigrationAction,
    getStorageMigrationAction,
    startStorageMigrationAction,
    type ActionState,
} from "@/app/actions";
import type { StorageMigration, StorageProvider } from "@/types/Storage";
import { Card, CardHeader, Notice, buttonStyles, formatDate } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";
import { rich } from "@/lib/rich";
import type { T } from "@/lib/i18n";

const POLL_INTERVAL = 2000;

function files(t: T, count: number) {
    return count === 1 ? t("1 arquivo") : t("{count} arquivos", { count });
}

export default function MigrationCard({ active, pending, initial }: { active: StorageProvider; pending: number; initial: StorageMigration | null }) {
    const t = useT();
    const router = useRouter();
    const [polled, setPolled] = useState<StorageMigration | null>(null);
    const [deleteSource, setDeleteSource] = useState(false);
    const [result, setResult] = useState<ActionState>({});
    const [busy, startTransition] = useTransition();

    const migration = polled && polled.id === initial?.id ? polled : initial;
    const running = migration?.status === 0;

    useEffect(() => {
        if (!running) return;

        const timer = window.setInterval(async () => {
            const current = await getStorageMigrationAction();
            setPolled(current);

            if (current?.status !== 0) {
                router.refresh();
            }
        }, POLL_INTERVAL);

        return () => window.clearInterval(timer);
    }, [running, router]);

    function run(action: () => Promise<ActionState>) {
        startTransition(async () => {
            setResult(await action());
            router.refresh();
        });
    }

    function start() {
        const message = deleteSource
            ? t("Copiar {files} para {name} e apagar as cópias antigas depois de cada cópia?", { files: files(t, pending), name: active.name })
            : t("Copiar {files} para {name}? As cópias antigas continuam onde estão.", { files: files(t, pending), name: active.name });

        if (window.confirm(message)) run(() => startStorageMigrationAction(deleteSource));
    }

    const done = migration ? migration.migrated + migration.failed : 0;
    const percent = migration && migration.total > 0 ? Math.min(100, Math.round((done / migration.total) * 100)) : 0;

    return (
        <Card className="animate-rise overflow-hidden">
            <CardHeader title={t("Migração de arquivos")} />
            <div className="flex flex-col gap-4 p-4 text-[13px]">
                {result.error && <Notice>{result.error}</Notice>}
                {result.success && <Notice tone="success">{result.success}</Notice>}

                {running && migration ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between gap-3">
                            <p>
                                {rich(t("Copiando para {name}"), { name: <strong>{migration.targetProviderName}</strong> })}
                            </p>
                            <p className="tabular-nums text-muted">
                                {t("{done} de {total}", { done, total: migration.total })}
                                {migration.failed > 0 && <span className="text-danger"> · {t("{count} com falha", { count: migration.failed })}</span>}
                            </p>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="text-xs text-muted">{t("Roda em segundo plano na API. Pode fechar esta tela; se a API reiniciar, a migração continua de onde parou.")}</p>
                        <button type="button" onClick={() => run(cancelStorageMigrationAction)} disabled={busy} className={`${buttonStyles.secondary} self-start`}>
                            {t("Cancelar migração")}
                        </button>
                    </div>
                ) : pending > 0 ? (
                    <div className="flex flex-col gap-3">
                        <p>
                            {rich(
                                pending === 1
                                    ? t("{files} está em outro armazenamento. Continua funcionando normalmente, mas você pode trazer tudo para {name}.")
                                    : t("{files} estão em outro armazenamento. Continuam funcionando normalmente, mas você pode trazer tudo para {name}."),
                                { files: <strong className="tabular-nums">{files(t, pending)}</strong>, name: <strong>{active.name}</strong> },
                            )}
                        </p>
                        <label className="flex cursor-pointer items-start gap-2">
                            <input type="checkbox" checked={deleteSource} onChange={(event) => setDeleteSource(event.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" />
                            <span>
                                {t("Apagar da origem depois de copiar")}
                                <span className="block text-xs text-muted">{t("Desmarcado, as cópias antigas ficam como garantia e os endereços antigos continuam respondendo.")}</span>
                            </span>
                        </label>
                        <button type="button" onClick={start} disabled={busy} className={`${buttonStyles.primary} self-start`}>
                            {t("Migrar {files}", { files: files(t, pending) })}
                        </button>
                    </div>
                ) : (
                    <p className="text-muted">{t("Todos os arquivos estão em {name}.", { name: active.name })}</p>
                )}

                {migration && !running && (
                    <div className="border-t border-line pt-3 text-xs text-muted">
                        {(migration.status === 1
                            ? t("Última migração (concluída em {date}): {count} copiados para {name}", { date: formatDate(t, migration.finishedAt), count: migration.migrated, name: migration.targetProviderName })
                            : t("Última migração (cancelada em {date}): {count} copiados para {name}", { date: formatDate(t, migration.finishedAt), count: migration.migrated, name: migration.targetProviderName }))}
                        {migration.failed > 0 && <span className="text-danger">, {t("{count} com falha", { count: migration.failed })}</span>}.
                        {migration.failed > 0 && pending > 0 && ` ${t("Inicie a migração de novo para tentar outra vez.")}`}
                    </div>
                )}

                {migration && migration.failures.length > 0 && (
                    <details className="text-xs">
                        <summary className="cursor-pointer text-muted hover:text-fg">{t("Ver arquivos com falha")}</summary>
                        <ul className="mt-2 divide-y divide-line rounded-md border border-line">
                            {migration.failures.map((failure) => (
                                <li key={failure.mediaId} className="px-3 py-2">
                                    <span className="font-medium">{failure.fileName}</span>
                                    <span className="block text-muted">{failure.error}</span>
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            </div>
        </Card>
    );
}
