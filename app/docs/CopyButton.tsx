"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "../components/Icons";
import { useT } from "../components/I18nProvider";
import { buttonStyles } from "../components/ui";

export default function CopyButton({ value, label }: { value: string; label?: string }) {
    const t = useT();
    const [copied, setCopied] = useState(false);

    async function copy() {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <button type="button" onClick={copy} className={buttonStyles.ghost} aria-label={label ?? t("Copiar")} title={label ?? t("Copiar")}>
            {copied ? <CheckIcon className="size-4 text-success" /> : <CopyIcon className="size-4" />}
        </button>
    );
}
