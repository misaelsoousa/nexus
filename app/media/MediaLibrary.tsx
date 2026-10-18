"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteMediaAction, uploadMediaAction } from "@/app/actions";
import { mediaUrl } from "@/lib/config";
import { MEDIA_ACCEPT, MEDIA_KINDS, MEDIA_MAX_SIZE, type Media, type MediaKind } from "@/types/Media";
import { ArrowUpRightIcon, CheckIcon, CloseIcon, CopyIcon, MediaIcon, UploadIcon } from "../components/Icons";
import { MediaThumb } from "../components/MediaThumb";
import { Card, EmptyState, buttonStyles, formatBytes, formatDate, inputStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";

type UploadItem = { name: string; status: "pending" | "done" | "error"; message?: string };

export default function MediaLibrary({
    medias,
    initialSelected,
    openUpload = false,
    canUpload,
    canDelete,
}: {
    medias: Media[];
    initialSelected?: string;
    openUpload?: boolean;
    canUpload: boolean;
    canDelete: boolean;
}) {
    const t = useT();
    const [kind, setKind] = useState<MediaKind | "all">("all");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(initialSelected ?? null);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [dragging, setDragging] = useState(false);
    const [uploading, startUpload] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    const sorted = useMemo(() => [...medias].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [medias]);
    const filtered = sorted.filter(
        (media) =>
            (kind === "all" || media.kind === kind) &&
            media.fileName.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const selected = medias.find((media) => media.id === selectedId) ?? null;

    function upload(files: FileList | File[]) {
        const list = Array.from(files);

        if (list.length === 0) {
            return;
        }

        setUploads(list.map((file) => ({ name: file.name, status: "pending" })));

        startUpload(async () => {
            for (const [index, file] of list.entries()) {
                let result: UploadItem;

                if (file.size > MEDIA_MAX_SIZE) {
                    result = { name: file.name, status: "error", message: t("Arquivo excede o tamanho máximo de 100 MB.") };
                } else {
                    const body = new FormData();
                    body.append("file", file);
                    const response = await uploadMediaAction(body);
                    result = response.error
                        ? { name: file.name, status: "error", message: response.error }
                        : { name: file.name, status: "done" };
                }

                setUploads((current) => current.map((item, i) => (i === index ? result : item)));
            }
        });
    }

    const counts = MEDIA_KINDS.map((item) => ({ ...item, count: medias.filter((media) => media.kind === item.value).length }));

    return (
        <div className="flex flex-col gap-4">
            {canUpload && (
                <div
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        upload(event.dataTransfer.files);
                    }}
                    data-dragging={dragging || undefined}
                    className="animate-rise group relative flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface px-6 py-8 text-center transition-colors data-dragging:border-accent data-dragging:bg-accent-soft"
                >
                    <div className="grid size-9 place-items-center rounded-md border border-line bg-surface-2 text-muted group-data-dragging:text-accent">
                        <UploadIcon className="size-[18px]" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{t("Arraste arquivos para cá")}</p>
                        <p className="mt-1 text-[13px] text-muted">{t("Imagens, vídeos, PDF, documentos do Office, TXT ou CSV. Até 100 MB por arquivo.")}</p>
                    </div>
                    <button type="button" autoFocus={openUpload} onClick={() => inputRef.current?.click()} disabled={uploading} className={openUpload ? buttonStyles.primary : buttonStyles.secondary}>
                        {uploading ? t("Enviando...") : t("Selecionar arquivos")}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept={MEDIA_ACCEPT}
                        className="sr-only"
                        tabIndex={-1}
                        onChange={(event) => {
                            if (event.target.files) {
                                upload(event.target.files);
                            }
                            event.target.value = "";
                        }}
                    />
                </div>
            )}

            {uploads.length > 0 && (
                <Card className="animate-rise overflow-hidden">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <span className="text-sm font-medium">{t("Envios")}</span>
                        {!uploading && (
                            <button type="button" onClick={() => setUploads([])} className={buttonStyles.ghost}>
                                {t("Limpar")}
                            </button>
                        )}
                    </div>
                    <ul className="divide-y divide-line text-sm">
                        {uploads.map((item, index) => (
                            <li key={`${item.name}-${index}`} className="flex items-center gap-3 px-4 py-2.5">
                                <span
                                    className={`grid size-6 shrink-0 place-items-center rounded-full ${
                                        item.status === "done"
                                            ? "bg-success-soft text-success"
                                            : item.status === "error"
                                              ? "bg-danger-soft text-danger"
                                              : "bg-surface-2 text-muted"
                                    }`}
                                >
                                    {item.status === "done" ? (
                                        <CheckIcon className="size-3.5" />
                                    ) : item.status === "error" ? (
                                        <CloseIcon className="size-3.5" />
                                    ) : (
                                        <span className="size-2 animate-pulse rounded-full bg-current" />
                                    )}
                                </span>
                                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                                <span className={`shrink-0 text-xs ${item.status === "error" ? "text-danger" : "text-muted"}`}>
                                    {item.status === "done" ? t("Enviado") : item.status === "error" ? item.message : t("Enviando")}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div role="tablist" aria-label={t("Filtrar por tipo")} className="flex w-max gap-0.5 rounded-md border border-line bg-surface-2 p-0.5">
                        {[{ value: "all" as const, label: t("Todos"), count: medias.length }, ...counts.map((item) => ({ ...item, label: t(item.label) }))].map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                role="tab"
                                aria-selected={kind === item.value}
                                onClick={() => setKind(item.value)}
                                className="flex h-7 items-center gap-2 whitespace-nowrap rounded px-3 text-[13px] font-medium text-muted transition-colors hover:text-fg aria-selected:bg-surface aria-selected:text-fg aria-selected:shadow-soft cursor-pointer"
                            >
                                {item.label}
                                <span className="text-xs tabular-nums text-subtle">{item.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("Buscar por nome do arquivo")}
                    aria-label={t("Buscar por nome do arquivo")}
                    className={`${inputStyles} sm:w-64`}
                />
            </div>

            <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                    {filtered.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                            {filtered.map((media) => (
                                <li key={media.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(media.id === selectedId ? null : media.id)}
                                        aria-pressed={media.id === selectedId}
                                        className="group block w-full text-left cursor-pointer"
                                    >
                                        <span className="relative block aspect-square overflow-hidden rounded-md border border-line bg-surface-2 transition-all group-hover:border-line-strong group-aria-pressed:border-accent group-aria-pressed:ring-4 group-aria-pressed:ring-accent-soft">
                                            <MediaThumb media={media} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw" />
                                        </span>
                                        <span className="mt-2 block truncate text-[13px] font-medium">{media.fileName}</span>
                                        <span className="block text-xs text-muted">{formatBytes(t, media.size)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Card>
                            <EmptyState
                                icon={<MediaIcon />}
                                title={medias.length === 0 ? t("Biblioteca vazia") : t("Nenhum arquivo encontrado")}
                                description={medias.length === 0 ? (canUpload ? t("Envie o primeiro arquivo usando a área acima.") : t("Nenhum arquivo foi enviado ainda.")) : t("Ajuste o filtro ou a busca.")}
                            />
                        </Card>
                    )}
                </div>

                {selected && <MediaDetails media={selected} canDelete={canDelete} onClose={() => setSelectedId(null)} />}
            </div>
        </div>
    );
}

function MediaDetails({ media, canDelete, onClose }: { media: Media; canDelete: boolean; onClose: () => void }) {
    const t = useT();
    const [copied, setCopied] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, startDelete] = useTransition();

    function remove() {
        if (!window.confirm(t("Excluir \"{name}\" permanentemente? Posts que usam este arquivo ficarão sem ele.", { name: media.fileName }))) {
            return;
        }

        startDelete(async () => {
            const result = await deleteMediaAction(media.id);

            if (result.error) {
                setDeleteError(result.error);
            } else {
                onClose();
            }
        });
    }
    const url = mediaUrl(media);
    const kindLabel = [t("Imagem"), t("Vídeo"), t("Documento")][media.kind] ?? t("Arquivo");

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {}
    }

    const details = [
        { label: t("Tipo"), value: `${kindLabel} · ${media.contentType}` },
        { label: t("Tamanho"), value: formatBytes(t, media.size) },
        { label: t("Enviado em"), value: formatDate(t, media.createdAt) },
        { label: t("Chave de armazenamento"), value: <span className="break-all font-mono text-xs">{media.storageKey}</span> },
    ];

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden" onClick={onClose} aria-hidden="true" />
            <aside
                aria-label={t("Detalhes do arquivo")}
                className="fixed inset-x-3 bottom-3 z-50 max-h-[85dvh] overflow-y-auto rounded-lg border border-line bg-surface shadow-float animate-rise xl:sticky xl:inset-auto xl:top-15 xl:z-auto xl:w-80 xl:shrink-0 xl:max-h-none xl:rounded-lg xl:shadow-soft"
            >
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <h2 className="truncate text-[13px] font-semibold">{t("Detalhes")}</h2>
                    <button type="button" onClick={onClose} aria-label={t("Fechar")} className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg cursor-pointer">
                        <CloseIcon className="size-4" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative aspect-video overflow-hidden rounded-md border border-line bg-surface-2">
                        {media.kind === 0 ? (
                            <Image src={url} alt={media.fileName} fill unoptimized sizes="320px" className="object-contain" />
                        ) : media.kind === 1 ? (
                            <video src={url} controls className="absolute inset-0 size-full bg-black object-contain" />
                        ) : (
                            <MediaThumb media={media} />
                        )}
                    </div>

                    <p className="mt-4 break-words font-medium">{media.fileName}</p>

                    <dl className="mt-4 flex flex-col gap-3 text-sm">
                        {details.map((item) => (
                            <div key={item.label}>
                                <dt className="text-xs text-subtle">{item.label}</dt>
                                <dd className="mt-0.5 text-muted">{item.value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-5 flex gap-2">
                        <button type="button" onClick={copy} className={`${buttonStyles.secondary} flex-1`}>
                            {copied ? <CheckIcon className="size-4 text-success" /> : <CopyIcon className="size-4" />}
                            {copied ? t("Copiado") : t("Copiar URL")}
                        </button>
                        <a href={url} target="_blank" rel="noreferrer" className={buttonStyles.secondary} aria-label={t("Abrir em nova aba")}>
                            <ArrowUpRightIcon className="size-4" />
                        </a>
                    </div>

                    {deleteError && <p role="alert" className="mt-3 text-xs text-danger">{deleteError}</p>}

                    {canDelete && (
                        <button type="button" onClick={remove} disabled={deleting} className="mt-4 text-[13px] text-danger hover:underline disabled:opacity-50 cursor-pointer">
                            {deleting ? t("Excluindo...") : t("Excluir permanentemente")}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
