"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    ApiError,
    activateStorageProvider,
    cancelStorageMigration,
    createStorageProvider,
    deleteStorageProvider,
    getCurrentStorageMigration,
    startStorageMigration,
    testStorageProvider,
    updateStorageProvider,
    createLanguage,
    createPage,
    createPost,
    createPostType,
    createRole,
    createUser,
    deleteLanguage,
    deleteMedia,
    deletePage,
    deletePost,
    deletePostType,
    deleteRole,
    deleteUser,
    getErrorMessage,
    login,
    register,
    setDefaultLanguage,
    updateLanguage,
    updatePageContent,
    updatePageStructure,
    updatePost,
    updatePostType,
    updatePostTypeFields,
    updateRole,
    updateUserRole,
    uploadMedia,
    createForm,
    deleteForm,
    deleteFormSubmission,
    deleteSmtpSettings,
    getFormSubmission,
    saveSmtpSettings,
    testSmtpSettings,
    updateForm,
} from "@/lib/api";
import { PERMISSION_GROUPS, type Permission } from "@/lib/permissions";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { SESSION_COOKIE } from "@/lib/session";
import type { AuthResponse } from "@/types/Auth";
import type { PostStatus } from "@/types/Post";
import type { FieldDefinition } from "@/types/PostType";
import type { Translations } from "@/types/Language";
import type { SaveStorageProviderRequest, StorageMigration } from "@/types/Storage";
import type { Media } from "@/types/Media";
import type { FormSubmission, SaveFormRequest, SaveSmtpSettingsRequest } from "@/types/Form";

export type ActionState = { error?: string; success?: string; warning?: string; values?: Record<string, string> };

function text(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function parseJson<T extends object>(formData: FormData, key: string): T | undefined {
    try {
        const value = JSON.parse(String(formData.get(key) ?? ""));
        return value && typeof value === "object" ? value : undefined;
    } catch {
        return undefined;
    }
}

function validateFields(fields: FieldDefinition[]) {
    const keys = fields.map((field) => field.key.trim());

    if (keys.some((key) => !key) || fields.some((field) => !field.label.trim())) {
        return "Todos os campos precisam de rótulo e chave.";
    }

    if (new Set(keys).size !== keys.length) {
        return "Existem campos com a mesma chave.";
    }

    return null;
}

function safeRedirectPath(value: string) {
    return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function createPostTypeAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const displayName = text(formData, "displayName");
    const name = text(formData, "name");

    if (!displayName || !name) {
        return { error: t("Informe o nome de exibição e o identificador.") };
    }

    let id: string;

    try {
        id = (await createPostType({ name, displayName })).id;
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");
    redirect(`/post-types/${id}?created=1`);
}

export async function updatePostTypeAction(id: string, displayName: string, fields: FieldDefinition[]): Promise<ActionState> {
    const t = await getT();
    if (!displayName.trim()) {
        return { error: t("Informe o nome de exibição.") };
    }

    const invalid = validateFields(fields);

    if (invalid) {
        return { error: t(invalid) };
    }

    try {
        await updatePostType(id, { displayName: displayName.trim() });
        await updatePostTypeFields(id, fields);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Tipo de post atualizado.") };
}

export async function deletePostTypeAction(id: string, redirectTo?: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deletePostType(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    if (redirectTo) {
        redirect(redirectTo);
    }

    return { success: t("Tipo de post excluído.") };
}

export async function savePostAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const id = text(formData, "id");
    const postTypeId = text(formData, "postTypeId");
    const title = text(formData, "title");
    const slug = text(formData, "slug");
    const status = (text(formData, "intent") === "draft" ? 0 : Number(formData.get("status") ?? 0)) as PostStatus;
    const fields = parseJson<Record<string, unknown>>(formData, "fields") ?? {};
    const translations = parseJson<Translations>(formData, "translations");
    const publishedAt = status === 3 ? text(formData, "publishedAt") || null : null;

    if (!id && !postTypeId) {
        return { error: t("Selecione um tipo de post.") };
    }

    if (!title || !slug) {
        return { error: t("Título e slug são obrigatórios.") };
    }

    let createdId: string | null = null;

    try {
        if (id) {
            await updatePost(id, { title, slug, status, publishedAt, fields, translations });
        } else {
            createdId = (await createPost({ postTypeId, title, slug, status, publishedAt, fields, translations })).id;
        }
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    if (createdId) {
        redirect(`/posts/${createdId}?saved=1`);
    }

    return { success: status === 1 ? t("Post atualizado e publicado.") : status === 3 ? t("Agendamento salvo.") : t("Post atualizado.") };
}

export async function deletePostAction(id: string, redirectTo?: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deletePost(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    if (redirectTo) {
        redirect(redirectTo);
    }

    return { success: t("Post excluído.") };
}

export async function deletePostsAction(ids: string[]): Promise<ActionState> {
    const t = await getT();
    const results = await Promise.allSettled(ids.map((id) => deletePost(id)));
    const failed = results.filter((result) => result.status === "rejected").length;

    revalidatePath("/", "layout");

    if (failed > 0) {
        return { error: t("{failed} de {total} posts não puderam ser excluídos.", { failed, total: ids.length }) };
    }

    return { success: ids.length === 1 ? t("1 post excluído.") : t("{count} posts excluídos.", { count: ids.length }) };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

async function startSession({ token, expiresAt }: AuthResponse) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(expiresAt),
    });
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const email = text(formData, "email").toLowerCase();
    const password = String(formData.get("password") ?? "");

    const values = { email };

    if (!email || !password) {
        return { error: t("Informe e-mail e senha."), values };
    }

    try {
        await startSession(await login({ email, password }));
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return { error: t("E-mail ou senha inválidos."), values };
        }

        return { error: t(getErrorMessage(error)), values };
    }

    redirect(safeRedirectPath(text(formData, "next")));
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const name = text(formData, "name");
    const email = text(formData, "email").toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const values = { name, email };

    if (!name || !email || !password) {
        return { error: t("Preencha nome, e-mail e senha."), values };
    }

    if (!EMAIL_PATTERN.test(email)) {
        return { error: t("Informe um e-mail válido."), values };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: t("A senha precisa ter pelo menos {count} caracteres.", { count: MIN_PASSWORD_LENGTH }), values };
    }

    if (password !== confirmPassword) {
        return { error: t("As senhas não coincidem."), values };
    }

    try {
        await startSession(await register({ name, email, password }));
    } catch (error) {
        return { error: t(getErrorMessage(error)), values };
    }

    redirect("/");
}

export async function createUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const name = text(formData, "name");
    const email = text(formData, "email").toLowerCase();
    const password = String(formData.get("password") ?? "");
    const roleId = text(formData, "roleId") || null;
    const values = { name, email, roleId: roleId ?? "" };

    if (!name || !email || !password) {
        return { error: t("Preencha nome, e-mail e senha."), values };
    }

    if (!EMAIL_PATTERN.test(email)) {
        return { error: t("Informe um e-mail válido."), values };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: t("A senha precisa ter pelo menos {count} caracteres.", { count: MIN_PASSWORD_LENGTH }), values };
    }

    try {
        await createUser({ name, email, password, roleId });
    } catch (error) {
        return { error: t(getErrorMessage(error)), values };
    }

    revalidatePath("/users");

    return { success: t("Usuário {name} criado.", { name }) };
}

export async function updateUserRoleAction(id: string, roleId: string | null): Promise<ActionState> {
    const t = await getT();
    try {
        await updateUserRole(id, roleId);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Cargo atualizado.") };
}

export async function deleteUserAction(id: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteUser(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/users");

    return { success: t("Usuário excluído.") };
}

const KNOWN_PERMISSIONS = new Set<string>(PERMISSION_GROUPS.flatMap((group) => group.permissions.map((item) => item.key)));

export async function saveRoleAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const id = text(formData, "id");
    const name = text(formData, "name");
    const permissions = formData.getAll("permissions").map(String).filter((key) => KNOWN_PERMISSIONS.has(key)) as Permission[];

    if (!name) {
        return { error: t("Informe o nome do cargo."), values: { name } };
    }

    try {
        if (id) {
            await updateRole(id, { name, permissions });
        } else {
            await createRole({ name, permissions });
        }
    } catch (error) {
        return { error: t(getErrorMessage(error)), values: { name } };
    }

    revalidatePath("/", "layout");

    if (!id) {
        redirect("/users/roles?created=1");
    }

    return { success: t("Cargo atualizado.") };
}

export async function deleteRoleAction(id: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteRole(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/users", "layout");
    redirect("/users/roles");
}

export async function logoutAction() {
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/login");
}

export async function uploadMediaAction(formData: FormData): Promise<ActionState & { media?: Media }> {
    const t = await getT();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
        return { error: t("Nenhum arquivo enviado.") };
    }

    try {
        const media = await uploadMedia(file);
        revalidatePath("/", "layout");
        return { media };
    } catch (error) {
        return { error: `${file.name}: ${t(getErrorMessage(error))}` };
    }
}

export async function createLanguageAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const code = text(formData, "code");
    const name = text(formData, "name");
    const values = { code, name };

    if (!code || !name) {
        return { error: t("Informe o código e o nome do idioma."), values };
    }

    try {
        await createLanguage({ code, name });
    } catch (error) {
        return { error: t(getErrorMessage(error)), values };
    }

    revalidatePath("/", "layout");

    return { success: t("Idioma {name} adicionado.", { name }) };
}

export async function updateLanguageAction(currentCode: string, code: string, name: string): Promise<ActionState> {
    const t = await getT();
    if (!code.trim() || !name.trim()) {
        return { error: t("Informe o código e o nome do idioma.") };
    }

    try {
        await updateLanguage(currentCode, { code: code.trim(), name: name.trim() });
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Idioma atualizado.") };
}

export async function setDefaultLanguageAction(code: string, name: string): Promise<ActionState> {
    const t = await getT();
    try {
        await setDefaultLanguage(code);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("{name} agora é o idioma padrão.", { name }) };
}

export async function deleteLanguageAction(code: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteLanguage(code);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Idioma removido.") };
}

export async function createPageAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const displayName = text(formData, "displayName");
    const name = text(formData, "name");

    if (!displayName || !name) {
        return { error: t("Informe o nome e o identificador.") };
    }

    let id: string;

    try {
        id = (await createPage({ name, displayName })).id;
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");
    redirect(`/pages/${id}?tab=structure&created=1`);
}

export async function updatePageStructureAction(id: string, displayName: string, fields: FieldDefinition[]): Promise<ActionState> {
    const t = await getT();
    if (!displayName.trim()) {
        return { error: t("Informe o nome da página.") };
    }

    const invalid = validateFields(fields);

    if (invalid) {
        return { error: t(invalid) };
    }

    try {
        await updatePageStructure(id, { displayName: displayName.trim(), fields });
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Estrutura da página salva.") };
}

export async function updatePageContentAction(id: string, values: Record<string, unknown>, translations: Translations): Promise<ActionState> {
    const t = await getT();
    try {
        await updatePageContent(id, { values, translations });
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Conteúdo da página salvo.") };
}

export async function deletePageAction(id: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deletePage(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");
    redirect("/pages");
}

export async function testStorageProviderAction(id: string | null, body: SaveStorageProviderRequest): Promise<ActionState> {
    const t = await getT();
    try {
        const result = await testStorageProvider(id, body);

        return result.warning ? { warning: result.warning } : { success: t("Conexão OK: o arquivo de teste foi gravado, lido pela URL pública e apagado.") };
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }
}

export async function saveStorageProviderAction(id: string | null, body: SaveStorageProviderRequest): Promise<ActionState> {
    const t = await getT();
    try {
        if (id) {
            await updateStorageProvider(id, body);
        } else {
            await createStorageProvider(body);
        }
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/settings/storage");

    return { success: id ? t("Armazenamento atualizado.") : t("Armazenamento {name} salvo. Ative quando quiser começar a usar.", { name: body.name }) };
}

export async function activateStorageProviderAction(id: string, name: string): Promise<ActionState> {
    const t = await getT();
    try {
        const result = await activateStorageProvider(id);
        revalidatePath("/settings/storage");

        return { success: t("{name} está ativo. Os próximos uploads vão para ele.", { name }), warning: result.warning ?? undefined };
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }
}

export async function deleteStorageProviderAction(id: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteStorageProvider(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/settings/storage");

    return { success: t("Armazenamento excluído.") };
}

export async function startStorageMigrationAction(deleteSource: boolean): Promise<ActionState> {
    const t = await getT();
    try {
        await startStorageMigration(deleteSource);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/settings/storage");

    return { success: t("Migração iniciada. Ela continua mesmo se você sair desta tela.") };
}

export async function cancelStorageMigrationAction(): Promise<ActionState> {
    const t = await getT();
    try {
        await cancelStorageMigration();
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/settings/storage");

    return { success: t("Migração cancelada. Os arquivos já copiados ficam no novo armazenamento.") };
}

export async function getStorageMigrationAction(): Promise<StorageMigration | null> {
    return (await getCurrentStorageMigration().catch(() => undefined)) ?? null;
}

export async function deleteMediaAction(id: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteMedia(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Arquivo excluído.") };
}

export async function createFormAction(_: ActionState, formData: FormData): Promise<ActionState> {
    const t = await getT();
    const displayName = text(formData, "displayName");
    const name = text(formData, "name");

    if (!displayName || !name) {
        return { error: t("Informe o nome e o identificador.") };
    }

    let id: string;

    try {
        id = (await createForm({ name, displayName })).id;
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");
    redirect(`/forms/${id}?tab=structure&created=1`);
}

export async function updateFormAction(id: string, body: SaveFormRequest): Promise<ActionState> {
    const t = await getT();
    if (!body.displayName.trim()) {
        return { error: t("Informe o nome do formulário.") };
    }

    const invalid = validateFields(body.fields);

    if (invalid) {
        return { error: t(invalid) };
    }

    const invalidEmail = body.notifyEmails.find((email) => !EMAIL_PATTERN.test(email));

    if (invalidEmail) {
        return { error: t("O e-mail de notificação \"{email}\" é inválido.", { email: invalidEmail }) };
    }

    try {
        await updateForm(id, { ...body, displayName: body.displayName.trim() });
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");

    return { success: t("Formulário salvo.") };
}

export async function deleteFormAction(id: string): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteForm(id);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/", "layout");
    redirect("/forms");
}

export async function getFormSubmissionAction(formId: string, id: string): Promise<ActionState & { submission?: FormSubmission }> {
    const t = await getT();
    try {
        const submission = await getFormSubmission(formId, id);
        revalidatePath("/", "layout");

        return { submission };
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }
}

export async function deleteFormSubmissionsAction(formId: string, ids: string[]): Promise<ActionState> {
    const t = await getT();
    const results = await Promise.allSettled(ids.map((id) => deleteFormSubmission(formId, id)));
    const failed = results.filter((result) => result.status === "rejected").length;

    revalidatePath("/", "layout");

    if (failed > 0) {
        return { error: t("{failed} de {total} envios não puderam ser excluídos.", { failed, total: ids.length }) };
    }

    return { success: ids.length === 1 ? t("1 envio excluído.") : t("{count} envios excluídos.", { count: ids.length }) };
}

export async function saveSmtpSettingsAction(body: SaveSmtpSettingsRequest): Promise<ActionState> {
    const t = await getT();
    try {
        await saveSmtpSettings(body);
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/settings", "layout");

    return { success: t("Configuração de e-mail salva.") };
}

export async function testSmtpSettingsAction(body: SaveSmtpSettingsRequest, to: string): Promise<ActionState> {
    const t = await getT();
    if (!EMAIL_PATTERN.test(to.trim())) {
        return { error: t("Informe um e-mail válido para receber o teste.") };
    }

    try {
        await testSmtpSettings({ ...body, to: to.trim() });
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    return { success: t("E-mail de teste enviado para {email}. Confira a caixa de entrada (e o spam).", { email: to.trim() }) };
}

export async function deleteSmtpSettingsAction(): Promise<ActionState> {
    const t = await getT();
    try {
        await deleteSmtpSettings();
    } catch (error) {
        return { error: t(getErrorMessage(error)) };
    }

    revalidatePath("/settings", "layout");

    return { success: t("Configuração de e-mail removida. Os formulários deixam de enviar notificações.") };
}

export async function setLocaleAction(locale: string) {
    (await cookies()).set(LOCALE_COOKIE, normalizeLocale(locale), {
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
    });

    revalidatePath("/", "layout");
}
