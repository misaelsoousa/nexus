import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `false` no servidor e na hidratação; `true` depois, no navegador. */
export function useHydrated() {
    return useSyncExternalStore(subscribe, () => true, () => false);
}
