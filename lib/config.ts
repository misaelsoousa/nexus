import type { Media } from "@/types/Media";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5144/api/";

export function mediaUrl(media: Pick<Media, "url">) {
    return new URL(media.url, API_BASE_URL).toString();
}
