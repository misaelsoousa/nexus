"use client";

import { useSearchParams } from "next/navigation";
import { PlusIcon } from "../components/Icons";
import Modal from "../components/Modal";
import { buttonStyles } from "../components/ui";
import CreateFormForm from "./CreateFormForm";
import { useT } from "@/app/components/I18nProvider";

function open() {
    window.history.pushState(null, "", "/forms?new=1");
}

function close() {
    window.history.replaceState(null, "", "/forms");
}

export default function CreateFormDialog() {
    const t = useT();
    const isOpen = useSearchParams().get("new") === "1";

    return (
        <>
            <button type="button" onClick={open} className={buttonStyles.outline}>
                <PlusIcon className="size-4" />
                {t("Adicionar novo formulário")}
            </button>

            {isOpen && (
                <Modal title={t("Adicionar novo formulário")} onClose={close}>
                    <CreateFormForm onCancel={close} />
                </Modal>
            )}
        </>
    );
}
