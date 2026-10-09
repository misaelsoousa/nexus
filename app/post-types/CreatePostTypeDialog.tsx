"use client";

import { useSearchParams } from "next/navigation";
import { PlusIcon } from "../components/Icons";
import Modal from "../components/Modal";
import { buttonStyles } from "../components/ui";
import CreatePostTypeForm from "./CreatePostTypeForm";
import { useT } from "@/app/components/I18nProvider";

function open() {
    window.history.pushState(null, "", "/post-types?new=1");
}

function close() {
    window.history.replaceState(null, "", "/post-types");
}

export default function CreatePostTypeDialog() {
    const t = useT();
    const isOpen = useSearchParams().get("new") === "1";

    return (
        <>
            <button type="button" onClick={open} className={buttonStyles.outline}>
                <PlusIcon className="size-4" />
                {t("Adicionar novo tipo")}
            </button>

            {isOpen && (
                <Modal title={t("Adicionar novo tipo")} onClose={close}>
                    <CreatePostTypeForm onCancel={close} />
                </Modal>
            )}
        </>
    );
}
