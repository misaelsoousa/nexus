"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { setPreference, usePreference } from "@/lib/preferences";
import type { CurrentUser } from "@/types/Auth";
import type { FormSummary } from "@/types/Form";
import type { PostType } from "@/types/PostType";
import { CollapseIcon } from "../Icons";
import { useT } from "../I18nProvider";
import { buildNav, isSectionActive, isSubItemActive, type NavItem } from "./items";

const LABEL = "whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none lg:collapsed:opacity-0";

export default function Sidebar({
    postTypes,
    forms,
    user,
    open,
    onClose,
}: {
    postTypes: PostType[];
    forms: FormSummary[];
    user: CurrentUser | null;
    open: boolean;
    onClose: () => void;
}) {
    const t = useT();
    const sidebar = usePreference("sidebar");
    const collapsed = sidebar === "collapsed";
    const items = buildNav(postTypes, forms, user, t);

    return (
        <>
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 top-10 z-30 bg-black/40 transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <aside
                data-open={open || undefined}
                className="fixed top-10 bottom-0 left-0 z-30 flex w-56 -translate-x-full flex-col overflow-hidden border-r border-line bg-surface transition-[translate,width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none data-open:translate-x-0 lg:sticky lg:h-[calc(100dvh-2.5rem)] lg:translate-x-0 lg:collapsed:w-14"
            >
                <nav aria-label={t("Principal")} className="flex-1 overflow-x-hidden overflow-y-auto py-2">
                    <Suspense fallback={<Menu items={items} search={new URLSearchParams()} />}>
                        <MenuWithParams items={items} />
                    </Suspense>
                </nav>

                <button
                    type="button"
                    onClick={() => setPreference("sidebar", collapsed ? "expanded" : "collapsed")}
                    className="hidden h-10 items-center gap-2.5 border-t border-line px-[18px] text-[13px] text-muted transition-colors hover:text-fg cursor-pointer lg:flex"
                    aria-label={collapsed ? t("Expandir menu") : t("Recolher menu")}
                >
                    <CollapseIcon className="size-[18px] shrink-0 transition-transform duration-300 lg:collapsed:rotate-180" />
                    <span className={LABEL}>{t("Recolher menu")}</span>
                </button>
            </aside>
        </>
    );
}

function MenuWithParams({ items }: { items: NavItem[] }) {
    const search = useSearchParams();

    return <Menu items={items} search={new URLSearchParams(search.toString())} />;
}

function Menu({ items, search }: { items: NavItem[]; search: URLSearchParams }) {
    const pathname = usePathname();

    return (
        <ul className="flex flex-col">
            {items.map(({ href, label, icon: ItemIcon, children }) => {
                const active = isSectionActive(pathname, href);

                return (
                    <li key={href}>
                        <Link
                            href={href}
                            title={label}
                            aria-current={active ? "page" : undefined}
                            className="flex h-9 items-center gap-2.5 px-[18px] text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-fg"
                        >
                            <ItemIcon className="size-[18px] shrink-0" />
                            <span className={`truncate ${LABEL}`}>{label}</span>
                        </Link>

                        {children.length > 0 && active && (
                            <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none lg:collapsed:grid-rows-[0fr]">
                                <ul className="min-h-0 overflow-hidden bg-surface-2 transition-[visibility] duration-300 lg:collapsed:invisible [&>li:first-child]:mt-1.5 [&>li:last-child]:mb-1.5">
                                    {children.map((child) => (
                                        <li key={child.href}>
                                            <Link
                                                href={child.href}
                                                aria-current={isSubItemActive(pathname, search, child.href) ? "page" : undefined}
                                                className="flex h-7 items-center pl-[46px] pr-4 text-[13px] text-muted transition-colors hover:text-accent aria-[current=page]:font-semibold aria-[current=page]:text-fg"
                                            >
                                                <span className={`truncate ${LABEL}`}>{child.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
