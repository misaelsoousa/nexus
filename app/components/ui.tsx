import Link from "next/link";
import type { T } from "@/lib/i18n";
import { getPostStatusLabel } from "@/types/Post";
import { AlertIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export const buttonStyles = {
    primary:
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
    neutral:
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-fg px-3 text-[13px] font-medium text-surface transition-colors hover:bg-fg/85 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
    secondary:
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-fg shadow-soft transition-colors hover:bg-surface-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
    ghost:
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
    outline:
        "inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-accent bg-surface px-2.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
    danger:
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-danger shadow-soft transition-colors hover:bg-danger-soft disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
};

export const inputStyles =
    "h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg shadow-soft placeholder:text-subtle transition-colors hover:border-line-strong focus:border-subtle focus:outline-none focus:ring-2 focus:ring-fg/10";

export const compactSelectStyles = inputStyles.replace("h-9 w-full", "h-8 w-auto");

const formatters = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(locale: string, short: boolean) {
    const key = `${locale}:${short}`;
    let formatter = formatters.get(key);

    if (!formatter) {
        formatter = new Intl.DateTimeFormat(
            locale,
            short ? { day: "2-digit", month: "short", year: "numeric" } : { dateStyle: "medium", timeStyle: "short" },
        );
        formatters.set(key, formatter);
    }

    return formatter;
}

/** Data no idioma do painel (`t.intl`). */
export function formatDate(t: Pick<T, "intl">, value: string | null | undefined, short = false) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return getDateFormatter(t.intl, short).format(date);
}

export function formatBytes(t: Pick<T, "intl">, bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }

    return `${value.toLocaleString(t.intl, { maximumFractionDigits: 1 })} ${units[unit]}`;
}

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <header className="animate-rise mb-5">
            {eyebrow && <div className="mb-1.5 text-xs text-muted">{eyebrow}</div>}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="min-w-0 text-[23px] font-normal leading-tight tracking-tight">{title}</h1>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {description && <p className="mt-1.5 max-w-2xl text-[13px] text-muted">{description}</p>}
        </header>
    );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return (
        <section className={`rounded-lg border border-line bg-surface ${className}`}>{children}</section>
    );
}

export function CardHeader({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2 min-h-10">
            <h2 className="text-[13px] font-semibold">{title}</h2>
            {action}
        </div>
    );
}

const STATUS_STYLES: Record<number, string> = {
    0: "bg-warning-soft text-warning",
    1: "bg-success-soft text-success",
    2: "bg-surface-3 text-muted",
    3: "bg-accent-soft text-accent",
};

export function StatusBadge({ status, t }: { status: number; t: T }) {
    return (
        <span
            className={`inline-flex h-5 items-center gap-1.5 rounded px-1.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES[2]}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {t(getPostStatusLabel(status))}
        </span>
    );
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon?: React.ReactNode;
    title: string;
    description?: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
            {icon && (
                <div className="mb-3 grid size-10 place-items-center rounded-md border border-line bg-surface-2 text-muted">{icon}</div>
            )}
            <p className="text-sm font-medium">{title}</p>
            {description && <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

const NOTICE_STYLES = {
    danger: "bg-danger-soft text-danger",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
};

export function Notice({ tone = "danger", children }: { tone?: keyof typeof NOTICE_STYLES; children: React.ReactNode }) {
    const styles = NOTICE_STYLES[tone];

    return (
        <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-md border border-current/15 px-3 py-2.5 text-[13px] ${styles}`}>
            <AlertIcon className="mt-px size-[18px] shrink-0" />
            <div>{children}</div>
        </div>
    );
}

export function Pagination({
    page,
    totalPages,
    totalCount,
    hrefFor,
    t,
}: {
    t: T;
    page: number;
    totalPages: number;
    totalCount: number;
    hrefFor: (page: number) => string;
}) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav aria-label={t("Paginação")} className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 text-[13px]">
            <span className="text-muted">
                {t("Página {page} de {total}", { page, total: totalPages })} · {totalCount === 1 ? t("1 item") : t("{count} itens", { count: totalCount })}
            </span>
            <div className="flex gap-1">
                {page > 1 ? (
                    <Link href={hrefFor(page - 1)} className={buttonStyles.ghost} aria-label={t("Página anterior")}>
                        <ChevronLeftIcon className="size-4" />
                        <span className="hidden sm:inline">{t("Anterior")}</span>
                    </Link>
                ) : null}
                {page < totalPages ? (
                    <Link href={hrefFor(page + 1)} className={buttonStyles.ghost} aria-label={t("Próxima página")}>
                        <span className="hidden sm:inline">{t("Próxima")}</span>
                        <ChevronRightIcon className="size-4" />
                    </Link>
                ) : null}
            </div>
        </nav>
    );
}

export function firstParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}
