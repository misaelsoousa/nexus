"use client";

import { useLayoutEffect, useTransition } from "react";
import { setLocaleAction } from "@/app/actions";
import { LOCALES } from "@/lib/i18n";
import {
    applyPreferences,
    setPreference,
    usePreference,
    type AccentPreference,
    type MotionPreference,
    type SidebarPreference,
    type ThemePreference,
} from "@/lib/preferences";
import { useT } from "../I18nProvider";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "../Icons";

const THEMES: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
    { value: "light", label: "Claro", icon: SunIcon },
    { value: "dark", label: "Escuro", icon: MoonIcon },
    { value: "system", label: "Sistema", icon: MonitorIcon },
];

/** Amostras de cada cor de destaque (claro / escuro), iguais às variáveis do globals.css. */
export const ACCENTS: { value: AccentPreference; label: string; light: string; dark: string }[] = [
    { value: "blue", label: "Azul", light: "#2f54eb", dark: "#6884ff" },
    { value: "violet", label: "Violeta", light: "#7c3aed", dark: "#a78bfa" },
    { value: "green", label: "Verde", light: "#15803d", dark: "#4ade80" },
    { value: "teal", label: "Turquesa", light: "#0f766e", dark: "#2dd4bf" },
    { value: "orange", label: "Laranja", light: "#c2410c", dark: "#fb923c" },
    { value: "rose", label: "Rosa", light: "#be185d", dark: "#f472b6" },
    { value: "slate", label: "Grafite", light: "#3f3f46", dark: "#d4d4d8" },
];

export function PreferencesSync() {
    useLayoutEffect(() => {
        applyPreferences();

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        media.addEventListener("change", applyPreferences);

        return () => media.removeEventListener("change", applyPreferences);
    }, []);

    return null;
}

export function ThemeCycleButton({ className = "" }: { className?: string }) {
    const t = useT();
    const theme = usePreference("theme");
    const index = THEMES.findIndex((item) => item.value === theme);
    const current = THEMES[index] ?? THEMES[2];
    const next = THEMES[(index + 1) % THEMES.length];
    const CurrentIcon = current.icon;
    const label = t("Tema: {current}. Alternar para {next}", { current: t(current.label), next: t(next.label) });

    return (
        <button
            type="button"
            onClick={() => setPreference("theme", next.value)}
            title={label}
            aria-label={label}
            className={`grid place-items-center rounded-md transition-colors cursor-pointer ${className}`}
        >
            <CurrentIcon className="size-[18px]" />
        </button>
    );
}

/** Botão compacto PT/EN para as telas de login e cadastro. */
export function LocaleToggleButton({ className = "" }: { className?: string }) {
    const t = useT();
    const [pending, startTransition] = useTransition();
    const next = LOCALES.find((item) => item.value !== t.locale) ?? LOCALES[0];

    return (
        <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setLocaleAction(next.value))}
            title={next.label}
            aria-label={t("Idioma: {current}. Alternar para {next}", { current: t.locale.toUpperCase(), next: next.label })}
            className={`grid place-items-center rounded-md text-xs font-semibold uppercase transition-colors cursor-pointer disabled:opacity-60 ${className}`}
        >
            {t.locale}
        </button>
    );
}

const optionCard =
    "group rounded-lg border border-line bg-surface p-3 text-left transition-all hover:border-line-strong aria-checked:border-accent aria-checked:ring-1 aria-checked:ring-accent cursor-pointer disabled:opacity-60 disabled:pointer-events-none";

export function LocaleCards() {
    const t = useT();
    const [pending, startTransition] = useTransition();

    return (
        <div role="radiogroup" aria-label={t("Idioma do painel")} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-fit lg:grid-cols-[repeat(2,12rem)]">
            {LOCALES.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    role="radio"
                    lang={item.htmlLang}
                    aria-checked={t.locale === item.value}
                    disabled={pending}
                    onClick={() => startTransition(() => setLocaleAction(item.value))}
                    className={`${optionCard} flex items-center gap-3`}
                >
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-2 text-xs font-semibold uppercase text-muted group-aria-checked:bg-accent-soft group-aria-checked:text-accent">
                        {item.value}
                    </span>
                    <span className="flex flex-col">
                        <span className="text-[13px] font-medium">{item.label}</span>
                        <span className="text-xs text-muted">{item.htmlLang}</span>
                    </span>
                </button>
            ))}
        </div>
    );
}

export function ThemeCards() {
    const t = useT();
    const theme = usePreference("theme");

    return (
        <div role="radiogroup" aria-label={t("Tema")} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {THEMES.map(({ value, label, icon: ItemIcon }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={theme === value}
                    onClick={() => setPreference("theme", value)}
                    className={optionCard}
                >
                    <ThemePreview variant={value} />
                    <span className="mt-2.5 flex items-center gap-2 text-[13px] font-medium">
                        <ItemIcon className="size-4 text-muted group-aria-checked:text-accent" />
                        {t(label)}
                    </span>
                </button>
            ))}
        </div>
    );
}

export function AccentPicker() {
    const t = useT();
    const accent = usePreference("accent");

    return (
        <div role="radiogroup" aria-label={t("Cor de destaque")} className="flex flex-wrap gap-2">
            {ACCENTS.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    role="radio"
                    aria-checked={accent === item.value}
                    onClick={() => setPreference("accent", item.value)}
                    className="group flex h-9 items-center gap-2 rounded-full border border-line bg-surface pl-1.5 pr-3 text-[13px] transition-all hover:border-line-strong aria-checked:border-accent aria-checked:ring-1 aria-checked:ring-accent cursor-pointer"
                >
                    <span
                        className="grid size-6 place-items-center rounded-full bg-(--swatch-light) text-white dark:bg-(--swatch-dark) dark:text-black"
                        style={{ "--swatch-light": item.light, "--swatch-dark": item.dark } as React.CSSProperties}
                    >
                        <CheckIcon className="size-3.5 opacity-0 group-aria-checked:opacity-100" />
                    </span>
                    {t(item.label)}
                </button>
            ))}
        </div>
    );
}

function Segmented<V extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: V;
    options: { value: V; label: string }[];
    onChange: (value: V) => void;
}) {
    return (
        <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-line bg-surface-2 p-0.5">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={value === option.value}
                    onClick={() => onChange(option.value)}
                    className="h-7 rounded px-3 text-[13px] font-medium text-muted transition-colors hover:text-fg aria-checked:bg-surface aria-checked:text-fg aria-checked:shadow-soft cursor-pointer"
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

export function SidebarControl() {
    const t = useT();
    const sidebar = usePreference("sidebar");

    return (
        <Segmented<SidebarPreference>
            label={t("Menu lateral")}
            value={sidebar}
            onChange={(value) => setPreference("sidebar", value)}
            options={[
                { value: "expanded", label: t("Expandido") },
                { value: "collapsed", label: t("Recolhido") },
            ]}
        />
    );
}

export function MotionControl() {
    const t = useT();
    const motion = usePreference("motion");

    return (
        <Segmented<MotionPreference>
            label={t("Animações")}
            value={motion}
            onChange={(value) => setPreference("motion", value)}
            options={[
                { value: "full", label: t("Ativadas") },
                { value: "reduced", label: t("Reduzidas") },
            ]}
        />
    );
}

function ThemePreview({ variant }: { variant: ThemePreference }) {
    const light = (
        <div className="flex h-full flex-col bg-[#f0f0f1]">
            <div className="h-2.5 bg-[#1d2327]" />
            <div className="flex flex-1">
                <div className="flex w-7 flex-col gap-1 border-r border-[#e4e4e7] bg-white p-1">
                    <div className="h-1.5 rounded-sm bg-accent" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-1.5">
                    <div className="h-2 w-2/3 rounded bg-[#d4d4d8]" />
                    <div className="flex-1 rounded-sm bg-white" />
                </div>
            </div>
        </div>
    );
    const dark = (
        <div className="flex h-full flex-col bg-[#0a0a0b]">
            <div className="h-2.5 bg-[#000]" />
            <div className="flex flex-1">
                <div className="flex w-7 flex-col gap-1 border-r border-[#222226] bg-[#111113] p-1">
                    <div className="h-1.5 rounded-sm bg-accent" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-1.5">
                    <div className="h-2 w-2/3 rounded bg-[#2f2f34]" />
                    <div className="flex-1 rounded-sm bg-[#111113]" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative h-20 overflow-hidden rounded-md border border-line">
            {variant === "dark" ? dark : light}
            {variant === "system" && (
                <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">{dark}</div>
            )}
        </div>
    );
}
