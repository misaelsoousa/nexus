"use client";

import { useState, useTransition } from "react";
import { deletePageAction, updatePageStructureAction, type ActionState } from "@/app/actions";
import type { PageDetails } from "@/types/Page";
import type { PostType } from "@/types/PostType";
import FieldsBuilder, { toField, toRows, type FieldRow } from "../../components/fields/FieldsBuilder";
import { Card, CardHeader, Notice, buttonStyles, formatDate, inputStyles } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function PageStructureEditor({ page, postTypes, notice }: { page: PageDetails; postTypes: PostType[]; notice?: string }) {
    const t = useT();
    const [displayName, setDisplayName] = useState(page.displayName);
    const [rows, setRows] = useState<FieldRow[]>(() => toRows(page.fields));
    const [state, setState] = useState<ActionState>(notice ? { success: notice } : {});
    const [pending, startTransition] = useTransition();

    function save() {
        startTransition(async () => {
            setState(await updatePageStructureAction(page.id, displayName, rows.map(toField)));
        });
    }

    function remove() {
        if (!window.confirm(t("Excluir a página \"{name}\" e todo o seu conteúdo?", { name: page.displayName }))) return;
        startTransition(async () => {
            setState(await deletePageAction(page.id));
        });
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="flex min-w-0 flex-col gap-5">
                {state.error && <Notice>{state.error}</Notice>}
                {state.success && <Notice tone="success">{state.success}</Notice>}

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Detalhes")} />
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="pageDisplayName" className="mb-1.5 block text-[13px] font-medium">{t("Nome")}</label>
                            <input id="pageDisplayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={inputStyles} />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[13px] font-medium">{t("Identificador")}</span>
                            <p className="flex h-9 items-center rounded-md bg-surface-2 px-3 font-mono text-[13px] text-muted">{page.name}</p>
                        </div>
                    </div>
                </Card>

                <FieldsBuilder
                    rows={rows}
                    onChange={setRows}
                    postTypes={postTypes}
                    emptyDescription={t("Adicione os campos que a página terá: textos, cores, imagens, chaves de sim/não para popups e banners. Use seções para agrupar.")}
                />
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-15 lg:self-start">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Salvar estrutura")} />
                    <dl className="flex flex-col gap-2.5 p-4 text-[13px]">
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Campos")}</dt>
                            <dd className="tabular-nums">{rows.filter((row) => row.type !== 9).length}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Criada em")}</dt>
                            <dd>{formatDate(t, page.createdAt, true)}</dd>
                        </div>
                    </dl>
                    <p className="px-4 pb-4 text-xs text-muted">
                        {t("Remover um campo tira ele da API. O valor salvo some de vez na próxima vez que o conteúdo for salvo.")}
                    </p>
                    <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                        <button type="button" onClick={remove} disabled={pending} className="text-[13px] text-danger hover:underline cursor-pointer disabled:opacity-50">
                            {t("Excluir página")}
                        </button>
                        <button type="button" onClick={save} disabled={pending} className={buttonStyles.primary}>
                            {pending ? t("Salvando...") : t("Salvar estrutura")}
                        </button>
                    </div>
                </Card>
            </aside>
        </div>
    );
}
