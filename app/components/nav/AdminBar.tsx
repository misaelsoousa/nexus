"use client";

import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { CurrentUser } from "@/types/Auth";
import { LogoMark, LogoutIcon, MenuIcon, PlusIcon, UserIcon } from "../Icons";
import { ThemeCycleButton } from "../preferences/PreferenceControls";
import { useT } from "../I18nProvider";
import { buildNewItems } from "./items";

const barItem = "flex h-full items-center gap-1.5 px-2.5 text-[13px] text-bar-fg transition-colors hover:bg-bar-hover hover:text-white";
const dropdown = "absolute top-full z-50 hidden min-w-44 flex-col bg-bar py-1.5 shadow-float group-hover:flex group-focus-within:flex";
const dropdownItem = "flex h-8 items-center gap-2 px-3 text-[13px] text-bar-fg transition-colors hover:bg-bar-hover hover:text-white";

export default function AdminBar({
    user,
    menuOpen,
    onToggleMenu,
}: {
    user: CurrentUser | null;
    menuOpen: boolean;
    onToggleMenu: () => void;
}) {
    const t = useT();
    const newItems = buildNewItems(user, t);

    return (
        <header className="sticky top-0 z-40 flex h-10 shrink-0 items-stretch bg-bar text-bar-fg">
            <button
                type="button"
                onClick={onToggleMenu}
                aria-label={menuOpen ? t("Fechar menu") : t("Abrir menu")}
                aria-expanded={menuOpen}
                className={`${barItem} cursor-pointer lg:hidden`}
            >
                <MenuIcon className="size-5" />
            </button>

            <Link href="/" className={`${barItem} font-semibold`} aria-label={t("Nexus, ir para o painel")}>
                <LogoMark className="size-5" />
                <span className="hidden sm:inline">Nexus</span>
            </Link>

            {newItems.length > 0 && (
                <div className="group relative">
                    <Link href={newItems[0].href} className={barItem}>
                        <PlusIcon className="size-4" />
                        <span>{t("Novo")}</span>
                    </Link>
                    <div className={`${dropdown} left-0`}>
                        {newItems.map((item) => (
                            <Link key={item.href} href={item.href} className={dropdownItem}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="ml-auto flex items-stretch">
                <ThemeCycleButton className="h-full w-10 rounded-none text-bar-muted hover:bg-bar-hover hover:text-white" />

                {user && (
                    <div className="group relative">
                        <button type="button" className={`${barItem} cursor-pointer`}>
                            <span className="hidden sm:inline">{t("Olá, {name}", { name: user.name })}</span>
                            <span className="grid size-6 place-items-center rounded-sm bg-bar-hover text-bar-muted">
                                <UserIcon className="size-4" />
                            </span>
                        </button>
                        <div className={`${dropdown} right-0`}>
                            <span className="px-3 pb-1.5 pt-0.5 text-xs text-bar-muted">
                                <span className="sm:hidden">{user.name} · </span>
                                {user.role?.name ?? t("Sem cargo")}
                            </span>
                            <form action={logoutAction}>
                                <button type="submit" className={`${dropdownItem} w-full cursor-pointer`}>
                                    <LogoutIcon className="size-4" />
                                    {t("Sair")}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
