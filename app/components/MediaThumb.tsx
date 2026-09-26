import Image from "next/image";
import { mediaUrl } from "@/lib/config";
import type { Media } from "@/types/Media";
import { FileIcon, VideoIcon } from "./Icons";

export function MediaThumb({ media, sizes = "160px" }: { media: Media; sizes?: string }) {
    if (media.kind === 0) {
        return <Image src={mediaUrl(media)} alt={media.fileName} fill unoptimized sizes={sizes} className="object-cover" />;
    }

    const KindIcon = media.kind === 1 ? VideoIcon : FileIcon;
    const extension = media.fileName.includes(".") ? media.fileName.split(".").pop()?.toUpperCase() : null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
            <KindIcon className="size-6" />
            {extension && <span className="text-[10px] font-semibold tracking-wider">{extension}</span>}
        </div>
    );
}
