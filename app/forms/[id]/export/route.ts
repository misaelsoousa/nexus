import type { NextRequest } from "next/server";
import { proxyApiDownload } from "@/lib/download";

export async function GET(_request: NextRequest, context: RouteContext<"/forms/[id]/export">) {
    const { id } = await context.params;

    return proxyApiDownload(`form/${encodeURIComponent(id)}/submissions/export`);
}
