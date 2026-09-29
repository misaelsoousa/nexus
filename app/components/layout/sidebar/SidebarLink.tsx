"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarLinkProps } from "@/types/Sidebar";

export default function SidebarLink({ href, label, icon, subItems = [], onNavigate }: SidebarLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`) || (href === "/dashboard" && pathname === "/");

  return (
    <li>
      <Link href={href} onClick={onNavigate} data-active={active || undefined} className="sidebar-link">
        <span className="sidebar-link-icon">{icon}</span>
        <span>{label}</span>
      </Link>
      {subItems.length > 0 && (
        <ul className="sidebar-subitems">
          {subItems.map((item) => (
            <li key={item.id}>
              <Link href={item.href} onClick={onNavigate} className="sidebar-subitem">{item.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
