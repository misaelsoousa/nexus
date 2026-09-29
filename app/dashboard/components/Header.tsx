import { ExternalLinkIcon } from "@/app/components/ui/Icons";
import Link from "next/link";
import DarkThemeButton from "@/app/components/ui/DarkThemeButton";

import type { HeaderProps } from "@/types/Dashboard";

export default function Header({ siteName, href }: HeaderProps) {
  return (
    <header className="mb-8 space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={href} className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          {siteName}
          <ExternalLinkIcon className="size-4" aria-hidden="true" />
        </Link>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <DarkThemeButton />
        </div>
      </div>
    </header>
  );
}
