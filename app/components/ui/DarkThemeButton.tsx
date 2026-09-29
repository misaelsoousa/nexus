"use client";

import { SunIcon, MoonIcon } from "./Icons";

export default function DarkThemeButton() {

  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    document.cookie = `nexus-theme=${dark ? "dark" : "light"}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }

  return (
    <button 
      type="button" 
      onClick={toggleTheme} 
      aria-label="Alternar tema claro e escuro"
      className="relative grid size-10 shrink-0 place-items-center rounded-md text-foreground focus-visible:outline-2 focus-visible:outline-light-blue focus-visible:outline-offset-2 cursor-pointer transition-colors duration-300 ease-in-out motion-reduce:transition-none"
    >
      <SunIcon className="size-5 block dark:hidden" />
      <MoonIcon className="size-5 hidden dark:block" />
    </button>
  );
}
