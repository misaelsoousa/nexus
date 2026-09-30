"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CurrentUser } from "@/types/Auth";
import type { FormSummary } from "@/types/Form";
import type { PostType } from "@/types/PostType";
import { LocaleToggleButton, ThemeCycleButton } from "../preferences/PreferenceControls";
import AdminBar from "./AdminBar";
import Sidebar from "./Sidebar";

const BARE_ROUTES = ["/login", "/register"];

export default function AppShell({
    postTypes,
    forms,
    user,
    children,
}: {
    postTypes: PostType[];
    forms: FormSummary[];
    user: CurrentUser | null;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const menuOpen = openedAt === pathname;

    if (BARE_ROUTES.includes(pathname)) {
        return (
            <>
                <div className="fixed top-4 right-4 flex gap-1">
                    <LocaleToggleButton className="size-9 text-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-subtle" />
                    <ThemeCycleButton className="size-9 text-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-subtle" />
                </div>
                <main className="grid min-h-dvh place-items-center px-4 py-10">{children}</main>
            </>
        );
    }

    return (
        <div className="flex min-h-dvh flex-col">
            <AdminBar user={user} onToggleMenu={() => setOpenedAt(menuOpen ? null : pathname)} menuOpen={menuOpen} />
            <div className="flex flex-1">
                <Sidebar postTypes={postTypes} forms={forms} user={user} open={menuOpen} onClose={() => setOpenedAt(null)} />
                <main className="min-w-0 flex-1 px-4 pt-5 pb-12 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
