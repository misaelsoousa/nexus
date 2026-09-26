"use client";

import { useRouter } from "next/navigation";

const INTERACTIVE = "a, button, input, select, textarea, label, summary, [role='button'], [data-row-ignore]";

/**
 * Linha de tabela inteira clicável. Cliques em elementos interativos internos
 * (links, botões, checkboxes…) mantêm o próprio comportamento. Ctrl/Cmd/Shift
 * ou botão do meio abrem em nova aba. Seleção de texto não dispara navegação.
 * A acessibilidade por teclado continua via o link principal dentro da linha.
 */
export default function ClickableRow({
    href,
    className = "",
    children,
    ...rest
}: { href?: string | null } & React.ComponentProps<"tr">) {
    const router = useRouter();

    if (!href) return <tr {...rest} className={className}>{children}</tr>;
    const url = href;

    function shouldIgnore(event: React.MouseEvent<HTMLTableRowElement>) {
        const target = event.target as HTMLElement;
        if (!event.currentTarget.contains(target)) return true;
        if (target.closest(INTERACTIVE)) return true;
        if (window.getSelection()?.toString()) return true;
        return false;
    }

    function handleClick(event: React.MouseEvent<HTMLTableRowElement>) {
        if (event.button !== 0 || shouldIgnore(event)) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
            window.open(url, "_blank", "noopener");
            return;
        }
        router.push(url);
    }

    function handleAuxClick(event: React.MouseEvent<HTMLTableRowElement>) {
        if (event.button !== 1 || shouldIgnore(event)) return;
        window.open(url, "_blank", "noopener");
    }

    return (
        <tr {...rest} onClick={handleClick} onAuxClick={handleAuxClick} className={`cursor-pointer ${className}`}>
            {children}
        </tr>
    );
}
