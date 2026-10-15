"use client";

import { useSearchParams } from "next/navigation";
import { PlusIcon } from "../components/Icons";
import Modal from "../components/Modal";
import { buttonStyles } from "../components/ui";
import CreatePageForm from "./CreatePageForm";
import { useT } from "@/app/components/I18nProvider";

function open() {
    window.history.pushState(null, "", "/pages?new=1");
}

function close() {
    window.history.replaceState(null, "", "/pages");
}

export default function CreatePageDialog() {
    const t = useT();
    const isOpen = useSearchParams().get("new") === "1";

    return (
        <>
            <button type="button" onClick={open} className={buttonStyles.outline}>
                <PlusIcon className="size-4" />
                {t("Adicionar nova página")}
            </button>

            {isOpen && (
                <Modal title={t("Adicionar nova página")} onClose={close}>
                    <CreatePageForm onCancel={close} />
                </Modal>
            )}
        </>
    );
}
