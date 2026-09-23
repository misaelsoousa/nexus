"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SidebarSubItem = {
  id: string;
  href: string;
  label: string;
};

type SidebarLinkProps = {
  href: string;
  children: ReactNode;
  subItems?: SidebarSubItem[];
};

function SidebarSubItems({ items }: { items: SidebarSubItem[] }) {
  return (
    <ul className="grid gap-1 mt-1 mr-4 ml-5 border-l border-dashed pl-2 border-light-blue/10">
      {items.map((item) => (
        <li key={item.id} className="sidebar-subitem">
          <Link
            href={item.href}
            className="block p-2 rounded text-[#b7c3ce] text-[13px] hover:text-white hover:bg-white/4 focus-visible:outline-2 focus-visible:outline-light-blue focus-visible:-outline-offset-3"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function SidebarLink({ href, children, subItems = [] }: SidebarLinkProps) {
  const pathname = usePathname();
  const active = pathname === href ||
    pathname.startsWith(href + "/") ||
    (href === "/dashboard" && pathname === "/");

  return (
    <li>
      <Link
        href={href}
        className="sidebar-item"
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
      >
        <span className="sidebar-item-background" aria-hidden="true" />
        {children}
      </Link>
      {subItems.length > 0 && <SidebarSubItems items={subItems} />}
    </li>
  );
}
