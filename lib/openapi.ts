import { API_BASE_URL } from "./config";
import { getT } from "./i18n-server";

type Schema = {
    $ref?: string;
    type?: string | string[];
    format?: string;
    enum?: unknown[];
    default?: unknown;
    properties?: Record<string, Schema>;
    items?: Schema;
    additionalProperties?: Schema | boolean;
};

type Parameter = { name: string; in: string; required?: boolean; description?: string; schema?: Schema };

type Operation = {
    tags?: string[];
    summary?: string;
    description?: string;
    parameters?: Parameter[];
    responses?: Record<string, { description?: string; content?: Record<string, { schema?: Schema }> }>;
};

export type OpenApiSpec = {
    info?: { title?: string; version?: string };
    paths: Record<string, Record<string, Operation>>;
    components?: { schemas?: Record<string, Schema> };
};

export type RouteParam = { name: string; in: string; required: boolean; type: string; defaultValue?: unknown; description?: string };

export type RouteResponse = { status: string; description: string; schemaName: string | null; example: unknown };

export type ApiRoute = {
    method: string;
    path: string;
    summary?: string;
    description?: string;
    params: RouteParam[];
    responses: RouteResponse[];
};

/** Tag dos controllers que o site público pode consumir sem login. */
export const PUBLIC_TAG = "Content";

export const OPENAPI_URL = new URL("../openapi/v1.json", API_BASE_URL).toString();

export async function getOpenApiSpec(): Promise<OpenApiSpec> {
    const response = await fetch(OPENAPI_URL, { cache: "no-store" });

    if (!response.ok) {
        throw new Error((await getT())("A API respondeu com status {status} ao buscar {url}.", { status: response.status, url: OPENAPI_URL }));
    }

    return response.json();
}

const API_PREFIX = new URL(API_BASE_URL).pathname;

export function getRoutes(spec: OpenApiSpec, tag: string): ApiRoute[] {
    return Object.entries(spec.paths).flatMap(([path, operations]) =>
        Object.entries(operations)
            .filter(([, operation]) => operation.tags?.includes(tag))
            .map(([method, operation]) => ({
                method: method.toUpperCase(),
                path: path.startsWith(API_PREFIX) ? path.slice(API_PREFIX.length) : path.replace(/^\//, ""),
                summary: operation.summary,
                description: operation.description,
                params: (operation.parameters ?? []).map((param) => ({
                    name: param.name,
                    in: param.in,
                    required: Boolean(param.required),
                    type: describeType(param.schema),
                    defaultValue: param.schema?.default,
                    description: param.description,
                })),
                responses: Object.entries(operation.responses ?? {}).map(([status, response]) => {
                    const schema = response.content?.["application/json"]?.schema ?? Object.values(response.content ?? {})[0]?.schema;

                    return {
                        status,
                        description: response.description ?? "",
                        schemaName: schema?.$ref ? refName(schema.$ref) : null,
                        example: schema ? exampleFor(schema, spec) : null,
                    };
                }),
            })),
    );
}

export function fillPath(path: string, values: Record<string, string | undefined>) {
    return path.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = values[name];

        return value ? encodeURIComponent(value) : match;
    });
}

function refName(ref: string) {
    return ref.slice(ref.lastIndexOf("/") + 1);
}

function resolve(schema: Schema, spec: OpenApiSpec) {
    return schema.$ref ? (spec.components?.schemas?.[refName(schema.$ref)] ?? {}) : schema;
}

/** O .NET descreve inteiros como ["integer", "string"] e anuláveis como ["null", ...]; fica o tipo principal. */
function mainType(schema: Schema) {
    const types = (Array.isArray(schema.type) ? schema.type : [schema.type]).filter((type): type is string => Boolean(type) && type !== "null");

    return types.find((type) => type !== "string") ?? types[0] ?? (schema.properties ? "object" : undefined);
}

function describeType(schema?: Schema) {
    if (!schema) {
        return "—";
    }

    const type = mainType(schema) ?? "any";

    return schema.format && type !== "integer" ? `${type} (${schema.format})` : type;
}

function exampleFor(schema: Schema, spec: OpenApiSpec, depth = 0): unknown {
    if (depth > 6) {
        return null;
    }

    const resolved = resolve(schema, spec);

    if (resolved.enum?.length) {
        return resolved.enum[0];
    }

    switch (mainType(resolved)) {
        case "object":
            if (!resolved.properties) {
                return {};
            }

            return Object.fromEntries(
                Object.entries(resolved.properties).map(([key, value]) => [key, exampleFor(value, spec, depth + 1)]),
            );
        case "array":
            return resolved.items ? [exampleFor(resolved.items, spec, depth + 1)] : [];
        case "integer":
            return 0;
        case "number":
            return 0.0;
        case "boolean":
            return true;
        case "string":
            if (resolved.format === "uuid") return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
            if (resolved.format === "date-time") return "2026-01-01T00:00:00+00:00";
            if (resolved.format === "date") return "2026-01-01";
            return "string";
        default:
            return null;
    }
}
