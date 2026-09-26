"use client";

import { useState } from "react";
import { AuthField } from "./AuthCard";
import { EyeIcon, EyeOffIcon } from "./Icons";
import { useT } from "@/app/components/I18nProvider";

export default function PasswordField(props: Omit<React.ComponentProps<typeof AuthField>, "type" | "trailing">) {
    const t = useT();
    const [visible, setVisible] = useState(false);

    return (
        <AuthField
            {...props}
            type={visible ? "text" : "password"}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? t("Ocultar senha") : t("Mostrar senha")}
                    aria-pressed={visible}
                    className="grid size-7 cursor-pointer place-items-center rounded text-subtle transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-subtle"
                >
                    {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
            }
        />
    );
}
