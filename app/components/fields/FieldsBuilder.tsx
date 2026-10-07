"use client";

import type { Dispatch, SetStateAction } from "react";
import { getFieldTypes, type FieldDefinition, type FieldScope, type FieldType, type PostType } from "@/types/PostType";
import { ArrowDownIcon, ArrowUpIcon, LayersIcon, PlusIcon, TrashIcon } from "../Icons";
import { Card, CardHeader, EmptyState, buttonStyles, inputStyles } from "../ui";
import { useT } from "@/app/components/I18nProvider";

export type FieldRow = FieldDefinition & { id: number; choicesText: string };

function toKey(value: string) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-zA-Z0-9]+(.)?/g, (_, char: string | undefined) => (char ? char.toUpperCase() : ""))
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function toRows(fields: FieldDefinition[]): FieldRow[] {
    return fields.map((field, index) => ({ ...field, id: index + 1, choicesText: (field.options?.choices ?? []).join(", ") }));
}

export function toField({ key, label, type, required, choicesText, options }: FieldRow): FieldDefinition {
    const choices = choicesText.split(",").map((choice) => choice.trim()).filter(Boolean);

    return {
        key: key.trim(),
        label: label.trim(),
        type,
        required: type !== 9 && required,
        options: type === 5 ? { choices } : type === 7 && options?.postType ? { postType: options.postType } : null,
    };
}

const iconButton =
    "grid size-7 place-items-center rounded-md text-subtle hover:bg-surface-2 hover:text-fg disabled:opacity-30 cursor-pointer";

const FIELD_HINTS: Partial<Record<FieldType, string>> = {
    10: "Só aceita um endereço de e-mail válido.",
    11: "Só aceita telefones com 8 a 15 dígitos (pode ter +, espaços, parênteses e hífens).",
    12: "Só aceita links começando com http:// ou https://.",
    13: "Aceita PDF, DOC, DOCX, ODT, RTF, TXT, JPG, PNG ou WEBP de até 10 MB. O arquivo só pode ser baixado pelo painel.",
};

export default function FieldsBuilder({
    rows,
    onChange,
    postTypes = [],
    emptyDescription,
    scope = "content",
}: {
    rows: FieldRow[];
    onChange: Dispatch<SetStateAction<FieldRow[]>>;
    postTypes?: PostType[];
    emptyDescription: string;
    scope?: FieldScope;
}) {
    const t = useT();
    const fieldTypes = getFieldTypes(scope);

    function update(id: number, patch: Partial<FieldRow>) {
        onChange((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }

    function move(index: number, offset: number) {
        onChange((current) => {
            const next = [...current];
            const [row] = next.splice(index, 1);
            next.splice(index + offset, 0, row);
            return next;
        });
    }

    function add(type: FieldType = 0) {
        onChange((current) => [
            ...current,
            { id: Math.max(0, ...current.map((row) => row.id)) + 1, key: "", label: "", type, required: false, choicesText: "" },
        ]);
    }

    const addButtons = (
        <div className="flex gap-1">
            <button type="button" onClick={() => add(9)} className={buttonStyles.ghost}>
                {t("Adicionar seção")}
            </button>
            <button type="button" onClick={() => add()} className={buttonStyles.ghost}>
                <PlusIcon className="size-4" />
                {t("Adicionar campo")}
            </button>
        </div>
    );

    return (
        <Card className="animate-rise overflow-hidden">
            <CardHeader title={t("Campos")} action={addButtons} />

            {rows.length === 0 ? (
                <EmptyState
                    icon={<LayersIcon />}
                    title={t("Nenhum campo")}
                    description={emptyDescription}
                    action={
                        <button type="button" onClick={() => add()} className={buttonStyles.secondary}>
                            <PlusIcon className="size-4" />
                            {t("Adicionar campo")}
                        </button>
                    }
                />
            ) : (
                <ol className="divide-y divide-line">
                    {rows.map((row, index) => (
                        <li key={row.id} className={`flex gap-3 p-4 ${row.type === 9 ? "bg-surface-2/50" : ""}`}>
                            <div className="flex flex-col items-center gap-0.5 pt-6">
                                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={t("Mover para cima")} className={iconButton}>
                                    <ArrowUpIcon className="size-4" />
                                </button>
                                <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} aria-label={t("Mover para baixo")} className={iconButton}>
                                    <ArrowDownIcon className="size-4" />
                                </button>
                            </div>

                            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_170px]">
                                <div>
                                    <label htmlFor={`label-${row.id}`} className="mb-1 block text-xs font-medium text-muted">
                                        {row.type === 9 ? t("Título da seção") : t("Rótulo")}
                                    </label>
                                    <input
                                        id={`label-${row.id}`}
                                        value={row.label}
                                        placeholder={row.type === 9 ? t("Hero") : t("Título principal")}
                                        onChange={(event) => {
                                            const label = event.target.value;
                                            update(row.id, row.key === toKey(row.label) ? { label, key: toKey(label) } : { label });
                                        }}
                                        className={inputStyles}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`key-${row.id}`} className="mb-1 block text-xs font-medium text-muted">{t("Chave")}</label>
                                    <input
                                        id={`key-${row.id}`}
                                        value={row.key}
                                        placeholder={row.type === 9 ? "hero" : "tituloPrincipal"}
                                        onChange={(event) => update(row.id, { key: event.target.value })}
                                        className={`${inputStyles} font-mono text-[13px]`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`type-${row.id}`} className="mb-1 block text-xs font-medium text-muted">{t("Tipo")}</label>
                                    <select
                                        id={`type-${row.id}`}
                                        value={row.type}
                                        onChange={(event) => update(row.id, { type: Number(event.target.value) as FieldType })}
                                        className={inputStyles}
                                    >
                                        {fieldTypes.map((option) => (
                                            <option key={option.value} value={option.value}>{t(option.label)}</option>
                                        ))}
                                    </select>
                                </div>

                                {row.type === 5 && (
                                    <div className="sm:col-span-2 xl:col-span-3">
                                        <label htmlFor={`choices-${row.id}`} className="mb-1 block text-xs font-medium text-muted">{t("Opções (separadas por vírgula)")}</label>
                                        <input
                                            id={`choices-${row.id}`}
                                            value={row.choicesText}
                                            placeholder={t("Notícia, Opinião, Entrevista")}
                                            onChange={(event) => update(row.id, { choicesText: event.target.value })}
                                            className={inputStyles}
                                        />
                                    </div>
                                )}

                                {row.type === 7 && (
                                    <div className="sm:col-span-2 xl:col-span-3">
                                        <label htmlFor={`ref-${row.id}`} className="mb-1 block text-xs font-medium text-muted">{t("Referenciar posts do tipo")}</label>
                                        <select
                                            id={`ref-${row.id}`}
                                            value={row.options?.postType ?? ""}
                                            onChange={(event) => update(row.id, { options: { postType: event.target.value || undefined } })}
                                            className={`${inputStyles} sm:max-w-72`}
                                        >
                                            <option value="">{t("Qualquer tipo")}</option>
                                            {postTypes.map((item) => (
                                                <option key={item.id} value={item.name}>{item.displayName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {FIELD_HINTS[row.type] && (
                                    <p className="text-xs text-muted sm:col-span-2 xl:col-span-3">{t(FIELD_HINTS[row.type] ?? "")}</p>
                                )}

                                {row.type === 9 ? (
                                    <p className="text-xs text-muted sm:col-span-2 xl:col-span-3">
                                        {scope === "form"
                                            ? t("Agrupa os campos abaixo dela. Vem na lista de campos do formulário para o site poder montar os grupos.")
                                            : t("Só organiza o formulário: agrupa os campos abaixo dela e não aparece na API.")}
                                    </p>
                                ) : (
                                    <label className="flex cursor-pointer items-center gap-2 text-[13px] sm:col-span-2 xl:col-span-3">
                                        <input
                                            type="checkbox"
                                            checked={row.required}
                                            onChange={(event) => update(row.id, { required: event.target.checked })}
                                            className="size-4 accent-[var(--accent)]"
                                        />
                                        {t("Obrigatório")}
                                    </label>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => onChange((current) => current.filter((item) => item.id !== row.id))}
                                aria-label={t("Remover campo")}
                                className="mt-5 grid size-9 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-danger-soft hover:text-danger cursor-pointer"
                            >
                                <TrashIcon className="size-[18px]" />
                            </button>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    );
}
