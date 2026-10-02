import Link from "next/link";
import { LogoMark } from "./Icons";
import { inputStyles } from "./ui";

export default function AuthCard({
    title,
    description,
    footer,
    children,
}: {
    title: string;
    description: string;
    footer: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="animate-rise w-full max-w-sm">
            <Link href="/" className="mb-8 flex items-center justify-center gap-2.5" aria-label="Nexus">
                <LogoMark className="size-9" />
                <span className="text-lg font-semibold tracking-tight">Nexus</span>
            </Link>
            <section className="rounded-lg bg-surface p-6 shadow-float sm:p-7">
                <header className="mb-6">
                    <h1 className="text-xl font-semibold leading-tight tracking-tight">{title}</h1>
                    <p className="mt-1 text-[13px] text-muted">{description}</p>
                </header>
                {children}
            </section>
            <p className="mt-6 text-center text-[13px] text-muted">{footer}</p>
        </div>
    );
}

export function AuthField({
    label,
    hint,
    trailing,
    ...props
}: { label: string; hint?: React.ReactNode; trailing?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <label htmlFor={props.id} className="text-[13px] font-medium">
                    {label}
                </label>
                {hint}
            </div>
            {trailing ? (
                <div className="relative">
                    <input className={`${inputStyles} pr-10`} {...props} />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">{trailing}</div>
                </div>
            ) : (
                <input className={inputStyles} {...props} />
            )}
        </div>
    );
}
