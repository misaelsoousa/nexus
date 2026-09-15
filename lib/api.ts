import { cookies } from "next/headers";
import type { PostDetails, PostListResponse, PostStatus, PostSummary, SavePostRequest } from "@/types/Post";
import type { FieldDefinition, PostType, PostTypeDetails } from "@/types/PostType";
import type { Language, Translations } from "@/types/Language";
import type { PageDetails, PageSummary } from "@/types/Page";
import type { SaveStorageProviderRequest, StorageMigration, StorageOverview, StorageProvider, StorageTest } from "@/types/Storage";
import type { Media } from "@/types/Media";
import type { AuthResponse, AuthStatus, CurrentUser, LoginRequest, RegisterRequest } from "@/types/Auth";
import type { CreateUserRequest, Role, SaveRoleRequest, User } from "@/types/User";
import type { FormDetails, FormSubmission, FormSubmissionList, FormSummary, SaveFormRequest, SaveSmtpSettingsRequest, SmtpSettings } from "@/types/Form";
import { API_BASE_URL } from "./config";
import { getLocaleInfo } from "./i18n";
import { getLocale, getT } from "./i18n-server";
import { SESSION_COOKIE } from "./session";

export class ApiError extends Error {
    status: number;
    errors: string[];

    constructor(status: number, errors: string[]) {
        super(errors.join(" "));
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

async function readErrors(response: Response) {
    const t = await getT();

    if (response.status === 401) {
        return [t("Sua sessão expirou. Entre novamente.")];
    }

    try {
        const body = await response.json();

        if (Array.isArray(body?.errors) && body.errors.length > 0) {
            return body.errors.map(String) as string[];
        }

        if (body?.errors && typeof body.errors === "object") {
            return Object.values(body.errors).flat().map(String);
        }
    } catch {}

    if (response.status === 403) {
        return [t("Você não tem permissão para realizar esta ação.")];
    }

    return [t("A API respondeu com status {status}.", { status: response.status })];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = new URL(path, API_BASE_URL);
    const isFormData = init?.body instanceof FormData;
    const token = (await cookies()).get(SESSION_COOKIE)?.value;

    let response: Response;

    try {
        response = await fetch(url, {
            cache: "no-store",
            ...init,
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                "Accept-Language": getLocaleInfo(await getLocale()).htmlLang,
                ...init?.headers,
            },
        });
    } catch {
        throw new ApiError(0, [(await getT())("Não foi possível conectar ao servidor. Tente novamente em instantes.")]);
    }

    if (!response.ok) {
        throw new ApiError(response.status, await readErrors(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export type PostQuery = { page?: number; pageSize?: number; status?: PostStatus | null; search?: string | null };

function withQuery(path: string, params?: PostQuery) {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    if (params?.status !== undefined && params?.status !== null) query.set("status", String(params.status));
    if (params?.search) query.set("search", params.search);

    const search = query.toString();

    return search ? `${path}?${search}` : path;
}

export function getErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
        return error.errors.join(" ");
    }

    return "Ocorreu um erro inesperado.";
}

export function login(body: LoginRequest) {
    return request<AuthResponse>("auth/login", { method: "POST", body: JSON.stringify(body) });
}

export function register(body: RegisterRequest) {
    return request<AuthResponse>("auth/register", { method: "POST", body: JSON.stringify(body) });
}

export function getAuthStatus() {
    return request<AuthStatus>("auth/status");
}

export function getMe() {
    return request<CurrentUser>("auth/me");
}

export function getUsers() {
    return request<User[]>("user");
}

export function createUser(body: CreateUserRequest) {
    return request<User>("user", { method: "POST", body: JSON.stringify(body) });
}

export function updateUserRole(id: string, roleId: string | null) {
    return request<void>(`user/${encodeURIComponent(id)}/role`, { method: "PUT", body: JSON.stringify({ roleId }) });
}

export function deleteUser(id: string) {
    return request<void>(`user/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getRoles() {
    return request<Role[]>("role");
}

export function createRole(body: SaveRoleRequest) {
    return request<Role>("role", { method: "POST", body: JSON.stringify(body) });
}

export function updateRole(id: string, body: SaveRoleRequest) {
    return request<void>(`role/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteRole(id: string) {
    return request<void>(`role/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getPostTypes() {
    return request<PostType[]>("posttype");
}

export function getPostType(id: string) {
    return request<PostTypeDetails>(`posttype/${encodeURIComponent(id)}`);
}

export function createPostType(body: { name: string; displayName: string }) {
    return request<PostType>("posttype", { method: "POST", body: JSON.stringify(body) });
}

export function updatePostType(id: string, body: { displayName: string }) {
    return request<void>(`posttype/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function updatePostTypeFields(id: string, fields: FieldDefinition[]) {
    return request<void>(`posttype/${encodeURIComponent(id)}/fields`, {
        method: "PUT",
        body: JSON.stringify({ fields }),
    });
}

export function deletePostType(id: string) {
    return request<void>(`posttype/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getPosts(params?: PostQuery) {
    return request<PostListResponse>(withQuery("post", params));
}

export function getPostsByType(postTypeName: string, params?: PostQuery) {
    return request<PostListResponse>(withQuery(`post/type/${encodeURIComponent(postTypeName)}`, params));
}

export function getPost(id: string) {
    return request<PostDetails>(`post/${encodeURIComponent(id)}`);
}

export function createPost(body: SavePostRequest & { postTypeId: string }) {
    return request<PostSummary>("post", { method: "POST", body: JSON.stringify(body) });
}

export function updatePost(id: string, body: SavePostRequest) {
    return request<PostSummary>(`post/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deletePost(id: string) {
    return request<void>(`post/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getLanguages() {
    return request<Language[]>("language");
}

export function createLanguage(body: { code: string; name: string }) {
    return request<Language>("language", { method: "POST", body: JSON.stringify(body) });
}

export function updateLanguage(code: string, body: { code: string; name: string }) {
    return request<void>(`language/${encodeURIComponent(code)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function setDefaultLanguage(code: string) {
    return request<void>(`language/${encodeURIComponent(code)}/default`, { method: "PUT" });
}

export function deleteLanguage(code: string) {
    return request<void>(`language/${encodeURIComponent(code)}`, { method: "DELETE" });
}

export function getPages() {
    return request<PageSummary[]>("page");
}

export function getPage(id: string) {
    return request<PageDetails>(`page/${encodeURIComponent(id)}`);
}

export function createPage(body: { name: string; displayName: string }) {
    return request<PageSummary>("page", { method: "POST", body: JSON.stringify(body) });
}

export function updatePageStructure(id: string, body: { displayName: string; fields: FieldDefinition[] }) {
    return request<void>(`page/${encodeURIComponent(id)}/structure`, { method: "PUT", body: JSON.stringify(body) });
}

export function updatePageContent(id: string, body: { values: Record<string, unknown>; translations: Translations }) {
    return request<void>(`page/${encodeURIComponent(id)}/content`, { method: "PUT", body: JSON.stringify(body) });
}

export function deletePage(id: string) {
    return request<void>(`page/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getStorageOverview() {
    return request<StorageOverview>("storage");
}

export function testStorageProvider(id: string | null, body: SaveStorageProviderRequest) {
    const path = id ? `storage/providers/${encodeURIComponent(id)}/test` : "storage/providers/test";

    return request<StorageTest>(path, { method: "POST", body: JSON.stringify(body) });
}

export function createStorageProvider(body: SaveStorageProviderRequest) {
    return request<StorageProvider>("storage/providers", { method: "POST", body: JSON.stringify(body) });
}

export function updateStorageProvider(id: string, body: SaveStorageProviderRequest) {
    return request<void>(`storage/providers/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function activateStorageProvider(id: string) {
    return request<StorageTest>(`storage/providers/${encodeURIComponent(id)}/activate`, { method: "PUT" });
}

export function deleteStorageProvider(id: string) {
    return request<void>(`storage/providers/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function startStorageMigration(deleteSource: boolean) {
    return request<StorageMigration>("storage/migrations", { method: "POST", body: JSON.stringify({ deleteSource }) });
}

export function getCurrentStorageMigration() {
    return request<StorageMigration | undefined>("storage/migrations/current");
}

export function cancelStorageMigration() {
    return request<void>("storage/migrations/current", { method: "DELETE" });
}

export function getMedias() {
    return request<Media[]>("media");
}

export function uploadMedia(file: File) {
    const body = new FormData();
    body.append("file", file);

    return request<Media>("media", { method: "POST", body });
}

export function deleteMedia(id: string) {
    return request<void>(`media/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getForms() {
    return request<FormSummary[]>("form");
}

export function getForm(id: string) {
    return request<FormDetails>(`form/${encodeURIComponent(id)}`);
}

export function createForm(body: { name: string; displayName: string }) {
    return request<FormSummary>("form", { method: "POST", body: JSON.stringify(body) });
}

export function updateForm(id: string, body: SaveFormRequest) {
    return request<void>(`form/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteForm(id: string) {
    return request<void>(`form/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getFormSubmissions(formId: string, params?: { page?: number; pageSize?: number; search?: string | null }) {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    if (params?.search) query.set("search", params.search);

    const search = query.toString();

    return request<FormSubmissionList>(`form/${encodeURIComponent(formId)}/submissions${search ? `?${search}` : ""}`);
}

export function getFormSubmission(formId: string, id: string) {
    return request<FormSubmission>(`form/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(id)}`);
}

export function deleteFormSubmission(formId: string, id: string) {
    return request<void>(`form/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Repassa um download da API (CSV ou arquivo de um envio) com o token da sessão. */
export async function fetchApiFile(path: string) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;

    return fetch(new URL(path, API_BASE_URL), {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export function getSmtpSettings() {
    return request<SmtpSettings>("settings/smtp");
}

export function saveSmtpSettings(body: SaveSmtpSettingsRequest) {
    return request<SmtpSettings>("settings/smtp", { method: "PUT", body: JSON.stringify(body) });
}

export function deleteSmtpSettings() {
    return request<void>("settings/smtp", { method: "DELETE" });
}

export function testSmtpSettings(body: SaveSmtpSettingsRequest & { to: string }) {
    return request<void>("settings/smtp/test", { method: "POST", body: JSON.stringify(body) });
}
