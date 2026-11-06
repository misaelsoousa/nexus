"use client";

import { useState, useTransition } from "react";
import { activateStorageProviderAction, deleteStorageProviderAction, type ActionState } from "@/app/actions";
import { STORAGE_TYPE_LABELS, describeStorage, type StorageOverview, type StorageProvider } from "@/types/Storage";
import { PlusIcon } from "../../components/Icons";
import Modal from "../../components/Modal";
import { Card, CardHeader, Notice, buttonStyles } from "../../components/ui";
import MigrationCard from "./MigrationCard";
import StorageProviderForm from "./StorageProviderForm";
import { useT } from "@/app/components/I18nProvider";
import { rich } from "@/lib/rich";
import type { T } from "@/lib/i18n";

function files(t: T, count: number) {
    return count === 1 ? t("1 arquivo") : t("{count} arquivos", { count });
}

export default function StorageManager({ overview }: { overview: StorageOverview }) {
    const t = useT();
    const [editing, setEditing] = useState<StorageProvider | "new" | null>(null);
    const [result, setResult] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    const active = overview.providers.find((provider) => provider.isActive) ?? overview.providers[0];
    const migrating = overview.migration?.status === 0;

    function run(action: () => Promise<ActionState>) {
        startTransition(async () => setResult(await action()));
    }

    function activate(provider: StorageProvider) {
        const message = provider.isBuiltIn
            ? t("Voltar a guardar os novos uploads no servidor da API?")
            : t("Ativar {name}? A conexão é testada antes. Os novos uploads passam a ir para ele; os arquivos atuais continuam onde estão até você migrar.", { name: provider.name });

        if (!window.confirm(message)) return;
        run(() => activateStorageProviderAction(provider.id, provider.name));
    }

    function remove(provider: StorageProvider) {
        if (!window.confirm(t("Excluir a configuração {name}? As credenciais salvas são apagadas.", { name: provider.name }))) return;
        run(() => deleteStorageProviderAction(provider.id));
    }

    return (
        <div className="flex flex-col gap-5">
            {result.error && <Notice>{result.error}</Notice>}
            {result.success && <Notice tone="success">{result.success}</Notice>}
            {result.warning && <Notice tone="warning">{result.warning}</Notice>}

            {active && (
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Em uso agora")} />
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-[13px]">
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-medium">{active.name}</p>
                            <p className="text-muted">
                                {t(STORAGE_TYPE_LABELS[active.type])} · <span className="font-mono text-xs">{t(describeStorage(active))}</span>
                            </p>
                        </div>
                        <p className="text-muted">
                            {rich(t("Novos uploads vão para cá · {count} guardados"), { count: <span className="tabular-nums text-fg">{files(t, active.mediaCount)}</span> })}
                        </p>
                    </div>
                </Card>
            )}

            <Card className="animate-rise overflow-hidden">
                <CardHeader
                    title={t("Armazenamentos configurados")}
                    action={
                        <button type="button" onClick={() => setEditing("new")} className={buttonStyles.ghost}>
                            <PlusIcon className="size-4" />
                            {t("Adicionar armazenamento")}
                        </button>
                    }
                />
                <ul className="divide-y divide-line">
                    {overview.providers.map((provider) => (
                        <li key={provider.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-[13px]">
                            <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">{provider.name}</span>
                                    {provider.isActive && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[11px] font-medium text-success">{t("Ativo")}</span>}
                                    {!provider.isBuiltIn && !provider.hasSecrets && (
                                        <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[11px] font-medium text-warning">{t("Sem credenciais")}</span>
                                    )}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-muted">
                                    {t(STORAGE_TYPE_LABELS[provider.type])} · <span className="font-mono">{t(describeStorage(provider))}</span>
                                </p>
                            </div>
                            <span className="text-xs tabular-nums text-muted">{files(t, provider.mediaCount)}</span>
                            <div className="flex gap-3 text-xs">
                                {!provider.isActive && (
                                    <button type="button" onClick={() => activate(provider)} disabled={pending || migrating} className="font-medium text-accent hover:underline cursor-pointer disabled:opacity-50">
                                        {t("Ativar")}
                                    </button>
                                )}
                                {!provider.isBuiltIn && (
                                    <button type="button" onClick={() => setEditing(provider)} className="text-accent hover:underline cursor-pointer">
                                        {t("Editar")}
                                    </button>
                                )}
                                {!provider.isBuiltIn && !provider.isActive && provider.mediaCount === 0 && (
                                    <button type="button" onClick={() => remove(provider)} disabled={pending} className="text-danger hover:underline cursor-pointer">
                                        {t("Excluir")}
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                {migrating && (
                    <p className="border-t border-line px-4 py-2.5 text-xs text-muted">{t("Não é possível trocar o armazenamento ativo enquanto uma migração está em andamento.")}</p>
                )}
            </Card>

            {active && <MigrationCard active={active} pending={overview.pendingMigration} initial={overview.migration} />}

            {editing && (
                <Modal title={editing === "new" ? t("Adicionar armazenamento") : t("Editar {name}", { name: editing.name })} onClose={() => setEditing(null)} className="max-w-xl">
                    <StorageProviderForm provider={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
                </Modal>
            )}
        </div>
    );
}
