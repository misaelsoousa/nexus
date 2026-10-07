"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Media } from "@/types/Media";
import { CloseIcon } from "../Icons";
import { MediaThumb } from "../MediaThumb";
import { buttonStyles, inputStyles } from "../ui";
import { useT } from "@/app/components/I18nProvider";

export default function MediaPicker({
    medias,
    selectedId,
    onSelect,
    onClose,
}: {
    medias: Media[];
    selectedId: string;
    onSelect: (media: Media) => void;
    onClose: () => void;
}) {
    const t = useT();
    const [query, setQuery] = useState("");
    const [current, setCurrent] = useState(selectedId);
    const filtered = medias.filter((media) => media.fileName.toLowerCase().includes(query.trim().toLowerCase()));
    const chosen = medias.find((media) => media.id === current);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3 sm:p-8" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={t("Escolher mídia")}
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-float"
            >
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <h2 className="text-base font-semibold">{t("Escolher mídia")}</h2>
                    <button type="button" onClick={onClose} aria-label={t("Fechar")} className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg cursor-pointer">
                        <CloseIcon className="size-4" />
                    </button>
                </div>

                <div className="border-b border-line px-4 py-3">
                    <input
                        type="search"
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t("Buscar por nome do arquivo")}
                        aria-label={t("Buscar por nome do arquivo")}
                        className={`${inputStyles} sm:w-72`}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {filtered.length > 0 ? (
                        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                            {filtered.map((media) => (
                                <li key={media.id}>
                                    <button
                                        type="button"
                                        title={media.fileName}
                                        aria-pressed={media.id === current}
                                        onClick={() => setCurrent(media.id)}
                                        onDoubleClick={() => onSelect(media)}
                                        className="relative block aspect-square w-full overflow-hidden rounded-md border border-line bg-surface-2 transition-all hover:border-line-strong aria-pressed:border-accent aria-pressed:ring-4 aria-pressed:ring-accent-soft cursor-pointer"
                                    >
                                        <MediaThumb media={media} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-10 text-center text-[13px] text-muted">
                            {medias.length === 0 ? (
                                <>{t("Nenhum arquivo na biblioteca.")} <Link href="/media" className="text-accent hover:underline">{t("Enviar arquivos")}</Link></>
                            ) : (
                                t("Nenhum arquivo encontrado.")
                            )}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                    <span className="min-w-0 truncate text-[13px] text-muted">{chosen?.fileName ?? "Nenhum arquivo selecionado"}</span>
                    <button type="button" disabled={!chosen} onClick={() => chosen && onSelect(chosen)} className={buttonStyles.primary}>
                        {t("Usar arquivo")}
                    </button>
                </div>
            </div>
        </div>
    );
}
