import { fetchApiFile } from "./api";
import { getT } from "./i18n-server";

const FORWARDED_HEADERS = ["content-type", "content-disposition", "content-length"];

/** Repassa um arquivo protegido da API ao navegador, que não tem o token (ele fica no cookie httpOnly). */
export async function proxyApiDownload(path: string) {
    const t = await getT();
    let response: Response;

    try {
        response = await fetchApiFile(path);
    } catch {
        return new Response(t("Não foi possível conectar ao servidor."), { status: 502 });
    }

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = Array.isArray(body?.errors) ? body.errors.join(" ") : t("A API respondeu com status {status}.", { status: response.status });

        return new Response(message, { status: response.status, headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    const headers = new Headers({ "cache-control": "private, no-store" });

    for (const name of FORWARDED_HEADERS) {
        const value = response.headers.get(name);
        if (value) headers.set(name, value);
    }

    return new Response(response.body, { status: 200, headers });
}
