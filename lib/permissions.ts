import type { CurrentUser } from "@/types/Auth";

// Espelha Domain/Security/Permissions.cs na API. Quem decide de verdade é a API;
// aqui as permissões só servem para esconder o que o usuário não pode usar.
export const PERMISSION_GROUPS = [
    {
        label: "Posts",
        permissions: [
            { key: "posts.view", label: "Ver" },
            { key: "posts.create", label: "Criar" },
            { key: "posts.edit", label: "Editar" },
            { key: "posts.delete", label: "Excluir" },
        ],
    },
    {
        label: "Mídia",
        permissions: [
            { key: "media.view", label: "Ver" },
            { key: "media.upload", label: "Enviar arquivos" },
            { key: "media.delete", label: "Excluir" },
        ],
    },
    {
        label: "Tipos de post",
        permissions: [
            { key: "postTypes.view", label: "Ver" },
            { key: "postTypes.create", label: "Criar" },
            { key: "postTypes.edit", label: "Editar" },
            { key: "postTypes.delete", label: "Excluir" },
        ],
    },
    {
        label: "Páginas",
        permissions: [
            { key: "pages.view", label: "Ver" },
            { key: "pages.edit", label: "Editar conteúdo" },
            { key: "pages.manage", label: "Gerenciar estrutura" },
        ],
    },
    {
        label: "Formulários",
        permissions: [
            { key: "forms.view", label: "Ver envios" },
            { key: "forms.manage", label: "Gerenciar formulários" },
            { key: "forms.delete", label: "Excluir envios" },
        ],
    },
] as const;

export type Permission = (typeof PERMISSION_GROUPS)[number]["permissions"][number]["key"];

export function can(user: CurrentUser | null, ...anyOf: Permission[]) {
    return Boolean(user && (user.isAdmin || anyOf.some((permission) => user.permissions.includes(permission))));
}

/** Toda ação de uma área depende de poder vê-la; a API aplica a mesma regra ao salvar o cargo. */
export function viewPermissionOf(permission: Permission) {
    return `${permission.slice(0, permission.indexOf("."))}.view` as Permission;
}
