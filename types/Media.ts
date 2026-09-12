export type MediaKind = 0 | 1 | 2;

export type Media = {
    id: string;
    fileName: string;
    storageKey: string;
    url: string;
    contentType: string;
    kind: MediaKind;
    size: number;
    createdAt: string;
};

export const MEDIA_KINDS: { value: MediaKind; label: string }[] = [
    { value: 0, label: "Imagens" },
    { value: 1, label: "Vídeos" },
    { value: 2, label: "Documentos" },
];

export const MEDIA_ACCEPT = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "video/mp4",
    "video/webm",
    "video/mpeg",
    "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
].join(",");

export const MEDIA_MAX_SIZE = 100 * 1024 * 1024;
