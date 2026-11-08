import type { Metadata } from "next";
import Link from "next/link";
import { getForms, getLanguages, getPages, getPostType, getPostTypes } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { OPENAPI_URL, PUBLIC_TAG, fillPath, getOpenApiSpec, getRoutes, type ApiRoute } from "@/lib/openapi";
import { can } from "@/lib/permissions";
import type { FormSummary } from "@/types/Form";
import type { Language } from "@/types/Language";
import type { PageSummary } from "@/types/Page";
import { getFieldTypeLabel, type PostType, type PostTypeDetails } from "@/types/PostType";
import { Card, CardHeader, Notice, PageHeader, firstParam } from "../components/ui";
import CopyButton from "./CopyButton";
import { getT } from "@/lib/i18n-server";
import { rich } from "@/lib/rich";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Documentação da API") };
}

type LiveResponse = { url: string; status: number; body: unknown } | { url: string; error: string };

async function callPublicRoute(url: string): Promise<LiveResponse> {
    const t = await getT();
    try {
        const response = await fetch(url, { cache: "no-store" });
        const text = await response.text();
        let body: unknown = text;

        try {
            body = JSON.parse(text);
        } catch {}

        return { url, status: response.status, body };
    } catch {
        return { url, error: t("Não foi possível conectar à API.") };
    }
}

function firstSlug(body: unknown) {
    const posts = (body as { posts?: { slug?: string }[] } | null)?.posts;

    return Array.isArray(posts) ? posts[0]?.slug : undefined;
}

export default async function DocsPage({ searchParams }: PageProps<"/docs">) {
    const t = await getT();
    const user = await requireUser();
    const params = await searchParams;
    let routes: ApiRoute[] = [];
    let specError: string | null = null;

    try {
        routes = getRoutes(await getOpenApiSpec(), PUBLIC_TAG);
    } catch (error) {
        specError = error instanceof Error ? error.message : t("Não foi possível ler a documentação da API.");
    }

    const canViewTypes = can(user, "postTypes.view");
    const postTypes: PostType[] = canViewTypes ? await getPostTypes().catch(() => []) : [];
    const selected = postTypes.find((postType) => postType.name === firstParam(params.type)) ?? postTypes[0];
    const details: PostTypeDetails | null = selected ? await getPostType(selected.id).catch(() => null) : null;
    const [languages, pages, forms] = await Promise.all([
        getLanguages().catch((): Language[] => []),
        can(user, "pages.view") ? getPages().catch((): PageSummary[] => []) : Promise.resolve([] as PageSummary[]),
        can(user, "forms.view") ? getForms().catch((): FormSummary[] => []) : Promise.resolve([] as FormSummary[]),
    ]);

    const values: Record<string, string | undefined> = {
        postTypeName: selected?.name,
        name: pages[0]?.name,
        formName: forms.find((form) => form.isActive)?.name,
    };
    const live = new Map<ApiRoute, LiveResponse>();
    const byParamCount = [...routes].sort((a, b) => a.path.split("{").length - b.path.split("{").length);

    for (const route of byParamCount) {
        const path = fillPath(route.path, values);

        if (route.method !== "GET" || path.includes("{")) {
            continue;
        }

        const result = await callPublicRoute(new URL(path, API_BASE_URL).toString());
        live.set(route, result);

        if ("body" in result) {
            values.slug ??= firstSlug(result.body);
        }
    }

    return (
        <>
            <PageHeader
                title={t("Documentação da API")}
                description={t("Rotas públicas para o site consumir o conteúdo publicado. Tudo aqui é lido da própria API: as rotas e os formatos vêm do documento OpenAPI e os exemplos reais são chamadas feitas agora, sem login.")}
            />

            <div className="flex flex-col gap-5">
                <Card className="animate-rise overflow-hidden">
                    <CardHeader title={t("Base")} />
                    <dl className="grid gap-x-6 gap-y-3 p-4 text-[13px] sm:grid-cols-[auto_1fr]">
                        <dt className="text-muted">{t("URL base")}</dt>
                        <dd className="flex items-center gap-1 font-mono break-all">
                            {API_BASE_URL}
                            <CopyButton value={API_BASE_URL} label={t("Copiar URL base")} />
                        </dd>
                        <dt className="text-muted">{t("Especificação")}</dt>
                        <dd>
                            <a href={OPENAPI_URL} target="_blank" rel="noreferrer" className="font-mono break-all text-accent hover:underline">
                                {OPENAPI_URL}
                            </a>
                        </dd>
                        {languages.length > 0 && (
                            <>
                                <dt className="text-muted">{t("Idiomas")}</dt>
                                <dd>
                                    <span className="flex flex-wrap gap-1.5">
                                        {languages.map((language) => (
                                            <code key={language.code} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                                                {language.code}
                                                {language.isDefault && <span className="text-muted"> ({t("padrão")})</span>}
                                            </code>
                                        ))}
                                    </span>
                                    <span className="mt-1 block text-xs text-muted">
                                        {rich(t("Passe {param} nas rotas de conteúdo e páginas. Sem o parâmetro, ou com um idioma desconhecido, a resposta vem no idioma padrão."), { param: <code className="font-mono">?lang={t("código")}</code> })}
                                    </span>
                                </dd>
                            </>
                        )}
                    </dl>
                </Card>

                {specError && (
                    <Notice>
                        {specError} {t("O documento OpenAPI só é publicado quando a API roda em ambiente de desenvolvimento.")}
                    </Notice>
                )}

                {canViewTypes ? (
                    postTypes.length > 0 && (
                        <Card className="animate-rise overflow-hidden">
                            <CardHeader title={t("Tipo de post dos exemplos")} />
                            <div className="flex flex-col gap-4 p-4">
                                <div className="flex flex-wrap gap-2">
                                    {postTypes.map((postType) => (
                                        <Link
                                            key={postType.id}
                                            href={`/docs?type=${encodeURIComponent(postType.name)}`}
                                            aria-current={postType.id === selected?.id ? "true" : undefined}
                                            className="inline-flex h-7 items-center rounded-md border border-line px-2.5 text-[13px] text-muted transition-colors hover:text-fg aria-[current=true]:border-accent aria-[current=true]:bg-accent-soft aria-[current=true]:text-accent"
                                        >
                                            {postType.displayName}
                                            <code className="ml-1.5 font-mono text-xs opacity-70">{postType.name}</code>
                                        </Link>
                                    ))}
                                </div>

                                {details && <FieldsTable details={details} />}
                            </div>
                        </Card>
                    )
                ) : (
                    <Notice tone="warning">{t("Seu cargo não pode ver tipos de post, então os exemplos reais não são exibidos.")}</Notice>
                )}

                {routes.map((route) => (
                    <RouteCard key={`${route.method} ${route.path}`} route={route} live={live.get(route)} />
                ))}
            </div>
        </>
    );
}

async function FieldsTable({ details }: { details: PostTypeDetails }) {
    const t = await getT();
    if (details.fields.length === 0) {
        return <p className="text-[13px] text-muted">{rich(t("Este tipo não tem campos personalizados; {fields} vem vazio."), { fields: <code className="font-mono">fields</code> })}</p>;
    }

    return (
        <div>
            <p className="mb-2 text-[13px] text-muted">
                {rich(t("Chaves de {fields} em cada post de {type}:"), { fields: <code className="font-mono">fields</code>, type: <strong className="text-fg">{details.displayName}</strong> })}
            </p>
            <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="border-b border-line bg-surface-2 text-left text-muted">
                            <th className="px-3 py-1.5 font-medium">{t("Chave")}</th>
                            <th className="px-3 py-1.5 font-medium">{t("Rótulo")}</th>
                            <th className="px-3 py-1.5 font-medium">{t("Tipo")}</th>
                            <th className="px-3 py-1.5 font-medium">{t("Obrigatório")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.fields.map((field) => (
                            <tr key={field.key} className="border-b border-line last:border-0">
                                <td className="px-3 py-1.5 font-mono">{field.key}</td>
                                <td className="px-3 py-1.5">{field.label}</td>
                                <td className="px-3 py-1.5">
                                    {t(getFieldTypeLabel(field.type))}
                                    {field.options?.choices?.length ? (
                                        <span className="text-muted"> · {field.options.choices.join(", ")}</span>
                                    ) : null}
                                    {field.options?.postType ? <span className="text-muted"> · {field.options.postType}</span> : null}
                                </td>
                                <td className="px-3 py-1.5">{field.required ? t("Sim") : t("Não")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const METHOD_STYLES: Record<string, string> = {
    GET: "bg-success-soft text-success",
    POST: "bg-accent-soft text-accent",
    PUT: "bg-warning-soft text-warning",
    DELETE: "bg-danger-soft text-danger",
};

async function RouteCard({ route, live }: { route: ApiRoute; live?: LiveResponse }) {
    const t = await getT();
    const url = new URL(route.path, API_BASE_URL).toString().replaceAll("%7B", "{").replaceAll("%7D", "}");

    return (
        <Card className="animate-rise overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2 min-h-10">
                <span className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${METHOD_STYLES[route.method] ?? "bg-surface-3 text-muted"}`}>
                    {route.method}
                </span>
                <code className="min-w-0 flex-1 truncate font-mono text-[13px]" title={url}>
                    /{route.path}
                </code>
                <CopyButton value={url} label={t("Copiar URL")} />
            </div>

            <div className="flex flex-col gap-4 p-4 text-[13px]">
                {(route.summary || route.description) && (
                    <div>
                        {route.summary && <p className="font-medium">{route.summary}</p>}
                        {route.description && <p className="text-muted">{route.description}</p>}
                    </div>
                )}

                {route.params.length > 0 && (
                    <div className="overflow-x-auto rounded-md border border-line">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-line bg-surface-2 text-left text-muted">
                                    <th className="px-3 py-1.5 font-medium">{t("Parâmetro")}</th>
                                    <th className="px-3 py-1.5 font-medium">{t("Onde")}</th>
                                    <th className="px-3 py-1.5 font-medium">{t("Tipo")}</th>
                                    <th className="px-3 py-1.5 font-medium">{t("Padrão")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {route.params.map((param) => (
                                    <tr key={`${param.in}-${param.name}`} className="border-b border-line last:border-0">
                                        <td className="px-3 py-1.5 font-mono">
                                            {param.name}
                                            {param.required && <span className="text-danger"> *</span>}
                                        </td>
                                        <td className="px-3 py-1.5">{param.in === "path" ? "caminho" : param.in === "query" ? "query string" : param.in}</td>
                                        <td className="px-3 py-1.5 font-mono">{param.type}</td>
                                        <td className="px-3 py-1.5 font-mono">{param.defaultValue === undefined ? "—" : String(param.defaultValue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {live && <LiveBlock live={live} />}

                <div className="flex flex-col gap-2">
                    {route.responses.map((response) => (
                        <details key={response.status} className="group rounded-md border border-line" open={!live && response.status.startsWith("2")}>
                            <summary className="flex cursor-pointer items-center gap-2 px-3 py-1.5 select-none">
                                <StatusCode status={Number(response.status)} />
                                <span>{response.description}</span>
                                {response.schemaName && <code className="ml-auto font-mono text-xs text-muted">{response.schemaName}</code>}
                            </summary>
                            {response.example !== null && (
                                <div className="border-t border-line">
                                    <JsonBlock value={response.example} />
                                </div>
                            )}
                        </details>
                    ))}
                </div>
            </div>
        </Card>
    );
}

async function LiveBlock({ live }: { live: LiveResponse }) {
    const t = await getT();
    return (
        <div className="rounded-md border border-line">
            <div className="flex items-center gap-2 border-b border-line px-3 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t("Resposta real")}</span>
                {"status" in live && <StatusCode status={live.status} />}
                <a href={live.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-xs text-accent hover:underline" title={live.url}>
                    {live.url}
                </a>
            </div>
            {"error" in live ? <p className="px-3 py-2 text-danger">{live.error}</p> : <JsonBlock value={live.body} />}
        </div>
    );
}

function StatusCode({ status }: { status: number }) {
    const tone = status < 300 ? "text-success" : status < 500 ? "text-warning" : "text-danger";

    return <span className={`font-mono text-xs font-semibold ${tone}`}>{status}</span>;
}

async function JsonBlock({ value }: { value: unknown }) {
    const t = await getT();
    const json = typeof value === "string" ? value : JSON.stringify(value, null, 2);

    return (
        <div className="relative bg-surface-2">
            <div className="absolute top-1 right-1">
                <CopyButton value={json} label={t("Copiar JSON")} />
            </div>
            <pre className="max-h-96 overflow-auto p-3 pr-12 font-mono text-xs leading-relaxed">{json}</pre>
        </div>
    );
}
