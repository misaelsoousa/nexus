"use client";

import { useState } from "react";
import type { Media } from "@/types/Media";
import type { PostSummary } from "@/types/Post";
import type { FieldDefinition } from "@/types/PostType";
import { CloseIcon, MediaIcon } from "../Icons";
import { MediaThumb } from "../MediaThumb";
import { buttonStyles, inputStyles } from "../ui";
import MediaPicker from "./MediaPicker";
import { useT } from "@/app/components/I18nProvider";

type Props = {
    field: FieldDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    medias: Media[];
    posts: PostSummary[];
    inheritable?: boolean;
    placeholder?: string;
};

const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default function FieldInput({ field, value, onChange, medias, posts, inheritable = false, placeholder }: Props) {
    const t = useT();
    const id = `field-${field.key}`;
    const required = field.required && !inheritable;
    const text = typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);

    switch (field.type) {
        case 1:
            return (
                <textarea
                    id={id}
                    rows={8}
                    value={text}
                    placeholder={placeholder}
                    required={required}
                    onChange={(event) => onChange(event.target.value)}
                    className={`${inputStyles} h-auto py-2 leading-relaxed`}
                />
            );
        case 2:
            return (
                <input
                    id={id}
                    type="number"
                    step="any"
                    value={typeof value === "number" ? value : ""}
                    placeholder={placeholder}
                    required={required}
                    onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
                    className={`${inputStyles} max-w-60`}
                />
            );
        case 3:
            if (inheritable) {
                return (
                    <select
                        id={id}
                        value={value === true ? "true" : value === false ? "false" : ""}
                        onChange={(event) => onChange(event.target.value === "" ? null : event.target.value === "true")}
                        className={`${inputStyles} max-w-60`}
                    >
                        <option value="">{t("Igual ao idioma padrão")}</option>
                        <option value="true">{t("Sim")}</option>
                        <option value="false">{t("Não")}</option>
                    </select>
                );
            }

            return (
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 text-[13px]">
                    <input id={id} type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-[var(--accent)]" />
                    {t("Sim")}
                </label>
            );
        case 4:
            return (
                <input
                    id={id}
                    type="date"
                    value={text.slice(0, 10)}
                    required={required}
                    onChange={(event) => onChange(event.target.value || null)}
                    className={`${inputStyles} max-w-60`}
                />
            );
        case 5:
            return (
                <select id={id} value={text} required={required} onChange={(event) => onChange(event.target.value || null)} className={`${inputStyles} max-w-80`}>
                    <option value="">— {t("Selecione")} —</option>
                    {(field.options?.choices ?? []).map((choice) => (
                        <option key={choice} value={choice}>{choice}</option>
                    ))}
                </select>
            );
        case 6:
            return <MediaField id={id} value={text} onChange={onChange} medias={medias} />;
        case 8:
            return (
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="color"
                        aria-label={`${field.label}: seletor`}
                        value={COLOR_PATTERN.test(text) ? text : "#000000"}
                        onChange={(event) => onChange(event.target.value)}
                        className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-line bg-surface p-1"
                    />
                    <input
                        id={id}
                        value={text}
                        required={required}
                        pattern="#[0-9a-fA-F]{6}"
                        title={t("Use o formato #rrggbb")}
                        placeholder={placeholder ?? "#000000"}
                        onChange={(event) => onChange(event.target.value.trim() || null)}
                        className={`${inputStyles} max-w-32 font-mono`}
                    />
                    {text && (
                        <button type="button" onClick={() => onChange(null)} className="text-xs text-muted hover:text-fg hover:underline cursor-pointer">
                            {t("Limpar")}
                        </button>
                    )}
                </div>
            );
        case 7: {
            const candidates = field.options?.postType
                ? posts.filter((post) => post.postTypeName === field.options?.postType)
                : posts;

            return (
                <select id={id} value={text} required={required} onChange={(event) => onChange(event.target.value || null)} className={`${inputStyles} max-w-96`}>
                    <option value="">— {t("Nenhum")} —</option>
                    {candidates.map((post) => (
                        <option key={post.id} value={post.id}>
                            {post.title} ({post.postTypeDisplayName})
                        </option>
                    ))}
                </select>
            );
        }
        case 10:
        case 11:
        case 12:
            return (
                <input
                    id={id}
                    type={INPUT_TYPES[field.type]}
                    value={text}
                    required={required}
                    placeholder={placeholder ?? PLACEHOLDERS[field.type]}
                    onChange={(event) => onChange(event.target.value.trim() || null)}
                    className={`${inputStyles} max-w-96`}
                />
            );
        case 13:
            return <p className="text-[13px] text-muted">{t("Arquivos só são enviados pelo site, em formulários.")}</p>;
        default:
            return (
                <input
                    id={id}
                    value={text}
                    required={required}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className={inputStyles}
                />
            );
    }
}

const INPUT_TYPES: Record<number, string> = { 10: "email", 11: "tel", 12: "url" };
const PLACEHOLDERS: Record<number, string> = { 10: "nome@exemplo.com", 11: "+55 11 91234-5678", 12: "https://" };

function MediaField({ id, value, onChange, medias }: { id: string; value: string; onChange: (value: unknown) => void; medias: Media[] }) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const media = medias.find((item) => item.id === value);

    return (
        <div id={id}>
            {media ? (
                <div className="flex items-center gap-3">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-line bg-surface-2">
                        <MediaThumb media={media} sizes="80px" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{media.fileName}</p>
                        <div className="mt-1 flex gap-3 text-xs">
                            <button type="button" onClick={() => setOpen(true)} className="text-accent hover:underline cursor-pointer">{t("Trocar")}</button>
                            <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-0.5 text-danger hover:underline cursor-pointer">
                                <CloseIcon className="size-3" />
                                {t("Remover")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={() => setOpen(true)} className={buttonStyles.secondary}>
                    <MediaIcon className="size-4" />
                    {value ? t("Arquivo não encontrado — escolher outro") : t("Escolher mídia")}
                </button>
            )}

            {open && (
                <MediaPicker
                    medias={medias}
                    selectedId={value}
                    onClose={() => setOpen(false)}
                    onSelect={(selected) => {
                        onChange(selected.id);
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
}
