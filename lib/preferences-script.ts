export type ThemePreference = "light" | "dark" | "system";
export type SidebarPreference = "expanded" | "collapsed";
export type AccentPreference = "blue" | "violet" | "green" | "teal" | "orange" | "rose" | "slate";
export type MotionPreference = "full" | "reduced";

export const STORAGE_PREFIX = "nexus-";

export const PREFERENCE_DEFAULTS: {
    theme: ThemePreference;
    sidebar: SidebarPreference;
    accent: AccentPreference;
    motion: MotionPreference;
} = {
    theme: "system",
    sidebar: "expanded",
    accent: "blue",
    motion: "full",
};

/** Preferências que viram um atributo `data-*` no <html> com o mesmo valor salvo. */
export const ATTRIBUTE_PREFERENCES = ["sidebar", "accent", "motion"] as const;

export const preferencesScript = `(function(){try{var d=document.documentElement,D=${JSON.stringify(PREFERENCE_DEFAULTS)},g=function(k){return localStorage.getItem("${STORAGE_PREFIX}"+k)||D[k]},t=g("theme");if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t);${JSON.stringify(ATTRIBUTE_PREFERENCES)}.forEach(function(k){d.setAttribute("data-"+k,g(k))})}catch(e){}})()`;
