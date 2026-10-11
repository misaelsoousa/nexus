"use client";

import { useState, useTransition } from "react";
import { deletePostAction } from "@/app/actions";
import { useT } from "@/app/components/I18nProvider";

export default function DeletePostButton({
    id,
    title,
    redirectTo,
}: {
    id: string;
    title: string;
    redirectTo?: string;
}) {
    const t = useT();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleClick() {
        if (!window.confirm(t("Excluir \"{title}\" permanentemente?", { title }))) {
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await deletePostAction(id, redirectTo);

            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onClick={handleClick}
                disabled={pending}
                className="text-[13px] text-danger underline-offset-2 hover:underline disabled:opacity-50 cursor-pointer"
            >
                {pending ? t("Excluindo...") : t("Excluir permanentemente")}
            </button>
            {error && (
                <span role="alert" className="absolute left-0 bottom-full z-10 mb-1 w-64 rounded-md bg-danger-soft px-3 py-2 text-xs text-danger shadow-soft">
                    {error}
                </span>
            )}
        </span>
    );
}
