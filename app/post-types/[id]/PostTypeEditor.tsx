"use client";

import { useState, useTransition } from "react";
import { updatePostTypeAction, type ActionState } from "@/app/actions";
import type { PostType, PostTypeDetails } from "@/types/PostType";
import FieldsBuilder, { toField, toRows, type FieldRow } from "../../components/fields/FieldsBuilder";
import DeletePostTypeDialog from "../DeletePostTypeDialog";
import { Card, CardHeader, Notice, buttonStyles, formatDate, inputStyles } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

export default function PostTypeEditor({
    postType,
    postTypes,
    readOnly = false,
    canDelete = false,
    postCount = null,
    notice,
}: {
    postType: PostTypeDetails;
    postTypes: PostType[];
    readOnly?: boolean;
    canDelete?: boolean;
    postCount?: number | null;
    notice?: string;
}) {
    const t = useT();
    const [displayName, setDisplayName] = useState(postType.displayName);
    const [rows, setRows] = useState<FieldRow[]>(() => toRows(postType.fields));
    const [state, setState] = useState<ActionState>(notice ? { success: notice } : {});
    const [pending, startTransition] = useTransition();

    function save() {
        startTransition(async () => {
            setState(await updatePostTypeAction(postType.id, displayName, rows.map(toField)));
        });
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-5">
                {state.error && <Notice>{state.error}</Notice>}
                {state.success && <Notice tone="success">{state.success}</Notice>}

                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Detalhes")} />
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="displayName" className="mb-1.5 block text-[13px] font-medium">{t("Nome")}</label>
                            <input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={inputStyles} />
                        </div>
                        <div>
                            <span className="mb-1.5 block text-[13px] font-medium">{t("Identificador")}</span>
                            <p className="flex h-9 items-center rounded-md bg-surface-2 px-3 font-mono text-[13px] text-muted">{postType.name}</p>
                        </div>
                    </div>
                </Card>

                <FieldsBuilder
                    rows={rows}
                    onChange={setRows}
                    postTypes={postTypes}
                    emptyDescription="Adicione campos como resumo, autor, data do evento ou imagem destacada. Eles aparecem no editor de cada post deste tipo."
                />
            </fieldset>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-15 lg:self-start">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Salvar")} />
                    <dl className="flex flex-col gap-2.5 p-4 text-[13px]">
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Campos")}</dt>
                            <dd className="tabular-nums">{rows.length}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Schema")}</dt>
                            <dd className="tabular-nums">v{postType.schemaVersion}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="w-24 shrink-0 text-muted">{t("Criado em")}</dt>
                            <dd>{formatDate(t, postType.createdAt, true)}</dd>
                        </div>
                    </dl>
                    <p className="px-4 pb-4 text-xs text-muted">
                        {t("Alterar os campos gera uma nova versão do schema. Posts existentes são validados com os novos campos na próxima edição.")}
                    </p>
                    {(!readOnly || canDelete) && (
                        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                            {canDelete ? (
                                <span className="text-[13px]">
                                    <DeletePostTypeDialog
                                        id={postType.id}
                                        name={postType.name}
                                        displayName={postType.displayName}
                                        postCount={postCount}
                                        redirectTo="/post-types"
                                        label={t("Excluir tipo")}
                                    />
                                </span>
                            ) : (
                                <span />
                            )}
                            {!readOnly && (
                                <button type="button" onClick={save} disabled={pending} className={buttonStyles.primary}>
                                    {pending ? t("Salvando...") : t("Salvar alterações")}
                                </button>
                            )}
                        </div>
                    )}
                </Card>
            </aside>
        </div>
    );
}
