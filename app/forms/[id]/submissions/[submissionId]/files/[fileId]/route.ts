import type { NextRequest } from "next/server";
import { proxyApiDownload } from "@/lib/download";

export async function GET(_request: NextRequest, context: RouteContext<"/forms/[id]/submissions/[submissionId]/files/[fileId]">) {
    const { id, submissionId, fileId } = await context.params;

    return proxyApiDownload(
        `form/${encodeURIComponent(id)}/submissions/${encodeURIComponent(submissionId)}/files/${encodeURIComponent(fileId)}`,
    );
}
