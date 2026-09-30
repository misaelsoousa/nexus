import type { T } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import type { CurrentUser } from "@/types/Auth";
import type { FormSummary } from "@/types/Form";
import type { PostType } from "@/types/PostType";
import { CodeIcon, DashboardIcon, InboxIcon, LayersIcon, MediaIcon, PageIcon, PostsIcon, SettingsIcon, UsersIcon } from "../Icons";

export type NavSubItem = { href: string; label: string };
export type NavItem = { href: string; label: string; icon: typeof PostsIcon; children: NavSubItem[] };

function only<T>(condition: boolean, ...items: T[]) {
    return condition ? items : [];
}

export function buildNav(postTypes: PostType[], forms: FormSummary[], user: CurrentUser | null, t: T): NavItem[] {
    return [
        { href: "/", label: t("Painel"), icon: DashboardIcon, children: [] },
        ...only<NavItem>(can(user, "posts.view"), {
            href: "/posts",
            label: t("Posts"),
            icon: PostsIcon,
            children: [
                { href: "/posts", label: t("Todos os posts") },
                ...only(can(user, "posts.create"), { href: "/posts/new", label: t("Adicionar novo") }),
                ...postTypes.map((postType) => ({
                    href: `/posts?type=${encodeURIComponent(postType.name)}`,
                    label: postType.displayName,
                })),
            ],
        }),
        ...only<NavItem>(can(user, "pages.view"), {
            href: "/pages",
            label: t("Páginas"),
            icon: PageIcon,
            children: [
                { href: "/pages", label: t("Todas as páginas") },
                ...only(can(user, "pages.manage"), { href: "/pages?new=1", label: t("Adicionar nova") }),
            ],
        }),
        ...only<NavItem>(can(user, "forms.view"), {
            href: "/forms",
            label: t("Formulários"),
            icon: InboxIcon,
            children: [
                { href: "/forms", label: t("Todos os formulários") },
                ...only(can(user, "forms.manage"), { href: "/forms?new=1", label: t("Adicionar novo") }),
                ...forms.map((form) => ({
                    href: `/forms/${form.id}`,
                    label: form.unreadCount > 0 ? `${form.displayName} (${form.unreadCount})` : form.displayName,
                })),
            ],
        }),
        ...only<NavItem>(can(user, "media.view"), {
            href: "/media",
            label: t("Mídia"),
            icon: MediaIcon,
            children: [
                { href: "/media", label: t("Biblioteca") },
                ...only(can(user, "media.upload"), { href: "/media?upload=1", label: t("Enviar arquivo") }),
            ],
        }),
        ...only<NavItem>(can(user, "postTypes.view"), {
            href: "/post-types",
            label: t("Tipos de post"),
            icon: LayersIcon,
            children: [
                { href: "/post-types", label: t("Todos os tipos") },
                ...only(can(user, "postTypes.create"), { href: "/post-types?new=1", label: t("Adicionar novo") }),
            ],
        }),
        ...only<NavItem>(Boolean(user?.isAdmin), {
            href: "/users",
            label: t("Usuários"),
            icon: UsersIcon,
            children: [
                { href: "/users", label: t("Todos os usuários") },
                { href: "/users?new=1", label: t("Adicionar novo") },
                { href: "/users/roles", label: t("Cargos") },
            ],
        }),
        { href: "/docs", label: t("Documentação"), icon: CodeIcon, children: [] },
        {
            href: "/settings",
            label: t("Configurações"),
            icon: SettingsIcon,
            children: [
                { href: "/settings", label: t("Geral") },
                { href: "/settings/personalization", label: t("Personalização") },
                ...only(Boolean(user?.isAdmin),
                    { href: "/settings/storage", label: t("Armazenamento") },
                    { href: "/settings/email", label: t("E-mail (SMTP)") },
                ),
            ],
        },
    ];
}

export function buildNewItems(user: CurrentUser | null, t: T): NavSubItem[] {
    return [
        ...only(can(user, "posts.create"), { href: "/posts/new", label: t("Post") }),
        ...only(can(user, "pages.manage"), { href: "/pages?new=1", label: t("Página") }),
        ...only(can(user, "media.upload"), { href: "/media?upload=1", label: t("Mídia") }),
        ...only(can(user, "postTypes.create"), { href: "/post-types?new=1", label: t("Tipo de post") }),
        ...only(can(user, "forms.manage"), { href: "/forms?new=1", label: t("Formulário") }),
        ...only(Boolean(user?.isAdmin), { href: "/users?new=1", label: t("Usuário") }),
    ];
}

export function isSectionActive(pathname: string, href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function isSubItemActive(pathname: string, search: URLSearchParams, href: string) {
    const url = new URL(href, "http://nexus.local");

    return url.pathname === pathname &&
        ["type", "upload", "new"].every((key) => search.get(key) === url.searchParams.get(key));
}
