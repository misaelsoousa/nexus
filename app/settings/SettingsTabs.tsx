"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "../components/I18nProvider";

export default function SettingsTabs({ isAdmin }: { isAdmin: boolean }) {
    const t = useT();
    const pathname = usePathname();
    const tabs = [
        { href: "/settings", label: t("Geral") },
        { href: "/settings/personalization", label: t("Personalização") },
        ...(isAdmin
            ? [
                  { href: "/settings/storage", label: t("Armazenamento") },
                  { href: "/settings/email", label: t("E-mail (SMTP)") },
              ]
            : []),
    ];

    return (
        <nav aria-label={t("Seções das configurações")} className="-mx-4 mb-5 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
            <ul className="flex gap-1">
                {tabs.map((tab) => (
                    <li key={tab.href}>
                        <Link
                            href={tab.href}
                            aria-current={pathname === tab.href ? "page" : undefined}
                            className="-mb-px flex h-9 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-[13px] font-medium text-muted transition-colors hover:text-fg aria-[current=page]:border-accent aria-[current=page]:text-fg"
                        >
                            {tab.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
