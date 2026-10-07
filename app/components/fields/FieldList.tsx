"use client";

import type { Media } from "@/types/Media";
import type { PostSummary } from "@/types/Post";
import type { FieldDefinition } from "@/types/PostType";
import FieldInput from "./FieldInput";
import { useT } from "@/app/components/I18nProvider";

type Props = {
    fields: FieldDefinition[];
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
    medias: Media[];
    posts: PostSummary[];
    /** Preenchido ao editar uma tradução: campos vazios usam os valores do idioma padrão. */
    fallback?: { language: string; values: Record<string, unknown> };
};

function preview(value: unknown) {
    return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

export default function FieldList({ fields, values, onChange, medias, posts, fallback }: Props) {
    const t = useT();
    return (
        <div className="divide-y divide-line">
            {fields.map((field) =>
                field.type === 9 ? (
                    <h3 key={field.key} className="bg-surface-2/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        {field.label}
                    </h3>
                ) : (
                    <div key={field.key} className="grid gap-2 px-4 py-4 md:grid-cols-[180px_1fr] md:gap-5">
                        <label htmlFor={`field-${field.key}`} className="text-[13px] font-medium md:pt-2">
                            {field.label}
                            {field.required && !fallback && <span className="ml-0.5 text-danger" aria-label={t("obrigatório")}>*</span>}
                        </label>
                        <div className="min-w-0">
                            <FieldInput
                                field={field}
                                value={values[field.key]}
                                onChange={(value) => onChange(field.key, value)}
                                medias={medias}
                                posts={posts}
                                inheritable={Boolean(fallback)}
                                placeholder={fallback ? preview(fallback.values[field.key]) : undefined}
                            />
                            <p className="mt-1 font-mono text-[11px] text-subtle">
                                {field.key}
                                {fallback && <span className="font-sans"> · vazio usa o valor de {fallback.language}</span>}
                            </p>
                        </div>
                    </div>
                ),
            )}
        </div>
    );
}
