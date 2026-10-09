"use client";

import { useState, useTransition } from "react";
import { deletePostTypeAction } from "@/app/actions";
import Modal from "../components/Modal";
import { Notice, buttonStyles, inputStyles } from "../components/ui";
import { useT } from "@/app/components/I18nProvider";
import { rich } from "@/lib/rich";

export default function DeletePostTypeDialog({
    id,
    name,
    displayName,
    postCount,
    redirectTo,
    label,
}: {
    id: string;
    name: string;
    displayName: string;
    postCount: number | null;
    redirectTo?: string;
    label?: string;
}) {
    const t = useT();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const confirmed = confirmation.trim() === name;

    function open() {
        setConfirmation("");
        setError(null);
        setIsOpen(true);
    }

    function close() {
        if (!pending) setIsOpen(false);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!confirmed) return;

        setError(null);
        startTransition(async () => {
            const result = await deletePostTypeAction(id, redirectTo);
            if (result?.error) setError(result.error);
            else setIsOpen(false);
        });
    }

    return (
        <>
            <button type="button" onClick={open} className="text-danger hover:underline cursor-pointer">
                {label ?? t("Excluir")}
            </button>

            {isOpen && (
                <Modal title={t("Excluir tipo de post")} onClose={close}>
                    <form onSubmit={submit} className="flex flex-col gap-4 p-4 text-[13px]">
                        <p>
                            {rich(t("Você está prestes a excluir o tipo {name} permanentemente."), { name: <strong>{displayName}</strong> })}
                        </p>

                        <Notice>
                            {postCount === null
                                ? t("Todos os posts deste tipo também serão excluídos.")
                                : postCount === 0
                                  ? t("Este tipo não possui posts.")
                                  : postCount === 1 ? t("1 post deste tipo também será excluído.") : t("{count} posts deste tipo também serão excluídos.", { count: postCount })}{" "}
                            {t("Essa ação não pode ser desfeita.")}
                        </Notice>

                        {error && <Notice>{error}</Notice>}

                        <div>
                            <label htmlFor={`confirm-${id}`} className="mb-1.5 block font-medium">
                                {rich(t("Para confirmar, digite {name}"), { name: <span className="rounded bg-surface-2 px-1 font-mono">{name}</span> })}
                            </label>
                            <input
                                id={`confirm-${id}`}
                                value={confirmation}
                                onChange={(event) => setConfirmation(event.target.value)}
                                autoComplete="off"
                                autoFocus
                                className={inputStyles}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={close} disabled={pending} className={buttonStyles.secondary}>
                                {t("Cancelar")}
                            </button>
                            <button type="submit" disabled={!confirmed || pending} className={buttonStyles.danger}>
                                {pending ? t("Excluindo...") : t("Excluir permanentemente")}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
