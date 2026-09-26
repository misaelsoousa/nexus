"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/lib/use-hydrated";
import { CloseIcon } from "./Icons";
import { useT } from "@/app/components/I18nProvider";

export default function Modal({
    title,
    onClose,
    className = "max-w-md",
    children,
}: {
    title: string;
    onClose: () => void;
    className?: string;
    children: React.ReactNode;
}) {
    const t = useT();
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        const overflow = document.body.style.overflow;

        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
        };
    }, [onClose]);

    const mounted = useHydrated();

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3 sm:p-8" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
                className={`flex max-h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-float ${className}`}
            >
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <button type="button" onClick={onClose} aria-label={t("Fechar")} className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg cursor-pointer">
                        <CloseIcon className="size-4" />
                    </button>
                </div>
                <div className="min-h-0 overflow-y-auto">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
