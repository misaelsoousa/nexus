"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import siteLogo from "@/app/assets/img/logo.webp";
import {
  DashboardIcon,
  MediaIcon,
  SettingsIcon,
  UserIcon,
  NotificationIcon,
  ArrowLongIcon,
  ArrowIcon,
  MenuIcon,
  PagesIcon,
  ThemeIcon,
  CloseIcon,
} from "../../ui/Icons";
import SidebarLink from "./SidebarLink";
import type { SidebarProps } from "@/types/Sidebar";

export default function Sidebar({ postTypes }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMobileOpen(false);
    if (mobileOpen) openButton.current?.focus();
  }

    const user = {
      name: "Usuario padrão",
      role: "Administrator"
    };

    const site = {
      name: "teste",
      logoUrl: siteLogo
    }

  useEffect(() => {
    if (mobileOpen) closeButton.current?.focus();
  }, [mobileOpen]);

  return (
    <>
      <button
        ref={openButton}
        type="button"
        onClick={() => setMobileOpen(true)}
        className="sidebar-toggle"
      >
        <MenuIcon className="sidebar-icon" />
      </button>
      
      {mobileOpen && <div onClick={closeMenu} className="sidebar-backdrop" />}
      
      <aside
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeMenu();
        }}
      >
        <button
          ref={closeButton}
          type="button"
          onClick={closeMenu}
          className="sidebar-close sidebar-icon-button"
        >
          <CloseIcon className="sidebar-icon" />
        </button>
        <Link href="/dashboard" onClick={closeMenu} className="sidebar-brand">
          <Image
            src={site.logoUrl}
            alt="Nexus"
            width={120}
            height={72}
            className="sidebar-logo"
          />
        </Link>

        <nav className="sidebar-navigation">
          <div className="sidebar-group">
            <p className="sidebar-heading">Content</p>

            <ul className="sidebar-list">
              <SidebarLink
                href="/dashboard"
                label="Dashboard"
                icon={<DashboardIcon />}
                onNavigate={closeMenu}
              />
              <SidebarLink
                href="/posts"
                label="Posts"
                icon={<PagesIcon />}
                subItems={postTypes.map((type) => ({
                  id: type.id,
                  label: type.displayName,
                  href: `/posts?type=${encodeURIComponent(type.name)}`,
                }))}
                onNavigate={closeMenu}
              />
              <SidebarLink
                href="/media"
                label="Media"
                icon={<MediaIcon />}
                onNavigate={closeMenu}
              />
            </ul>
          </div>

          <div className="sidebar-group">
            <p className="sidebar-heading">Site</p>
            <ul className="sidebar-list">
              <SidebarLink
                href="/menus"
                label="Menus"
                icon={<MenuIcon />}
                onNavigate={closeMenu}
              />
              <SidebarLink
                href="/themes"
                label="Themes"
                icon={<ThemeIcon />}
                onNavigate={closeMenu}
              />
              <SidebarLink
                href="/users"
                label="Users"
                icon={<UserIcon />}
                onNavigate={closeMenu}
              />
              <SidebarLink
                href="/settings"
                label="Settings"
                icon={<SettingsIcon />}
                onNavigate={closeMenu}
              />
            </ul>
          </div>
        </nav>

      <div className="flex items-center gap-2 mt-6 -mr-3 p-2.5 rounded-[5px]">
        <Link
          href="/profile"
          className="flex items-center flex-1 min-w-0 gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-light-blue focus-visible:-outline-offset-3"
        >
          <div className="grid place-items-center shrink-0 size-9 rounded-full bg-blue text-xs" aria-hidden="true"></div>
          <div>
            <p className="block text-[13px] font-semibold">{user?.name}</p>
            <span className="block text-xs text-[#c0cbd4]">{user?.role}</span>
          </div>
        </Link>
        <Link
          href="/notifications"
          className="grid place-items-center size-8"
        >
          <NotificationIcon />
        </Link>
      </div>
    </aside>
    </>
  );
}
