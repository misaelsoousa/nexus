import { Fragment } from "react";

/**
 * Monta um texto traduzido com elementos no meio: `rich(t("Use {code} aqui"), { code: <code>x</code> })`.
 * Os `{nome}` sem elemento correspondente ficam como texto.
 */
export function rich(text: string, parts: Record<string, React.ReactNode>) {
    return text.split(/(\{\w+\})/).map((chunk, index) => {
        const name = /^\{(\w+)\}$/.exec(chunk)?.[1];

        return name && name in parts ? <Fragment key={index}>{parts[name]}</Fragment> : chunk;
    });
}
