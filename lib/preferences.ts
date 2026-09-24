import { useSyncExternalStore } from "react";
import { ATTRIBUTE_PREFERENCES, PREFERENCE_DEFAULTS, STORAGE_PREFIX, type ThemePreference } from "./preferences-script";

export type { AccentPreference, MotionPreference, SidebarPreference, ThemePreference } from "./preferences-script";

type Preferences = typeof PREFERENCE_DEFAULTS;

const listeners = new Set<() => void>();

function read<K extends keyof Preferences>(key: K): Preferences[K] {
    try {
        return (localStorage.getItem(STORAGE_PREFIX + key) as Preferences[K]) ?? PREFERENCE_DEFAULTS[key];
    } catch {
        return PREFERENCE_DEFAULTS[key];
    }
}

export function resolveTheme(theme: ThemePreference) {
    if (theme !== "system") {
        return theme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyPreferences() {
    const root = document.documentElement;

    root.setAttribute("data-theme", resolveTheme(read("theme")));

    for (const key of ATTRIBUTE_PREFERENCES) {
        root.setAttribute(`data-${key}`, read(key));
    }
}

function notify() {
    applyPreferences();
    listeners.forEach((listener) => listener());
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {}

    notify();
}

/** Volta todas as preferências visuais ao padrão. */
export function resetPreferences() {
    try {
        for (const key of Object.keys(PREFERENCE_DEFAULTS)) {
            localStorage.removeItem(STORAGE_PREFIX + key);
        }
    } catch {}

    notify();
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function usePreference<K extends keyof Preferences>(key: K): Preferences[K] {
    return useSyncExternalStore(
        subscribe,
        () => read(key),
        () => PREFERENCE_DEFAULTS[key],
    );
}
