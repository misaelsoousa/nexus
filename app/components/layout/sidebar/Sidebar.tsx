"use client";
import Link from "next/link";
import Image from "next/image";
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
} from "../../ui/Icons";
import SidebarLink from "./SidebarLink";
import type { PostType } from "@/types/PostType";

export default function Sidebar({ postTypes }: { postTypes: PostType[] }) {
    const user = {
      name: "John Doe",
      role: "Administrator"
    };

    const site = {
      name: "Example Site",
      logoUrl: siteLogo
    }

  return (
    <aside className="flex justify-between flex-col w-77.5 sticky m-1 h-[calc(100dvh-8px)] text-gray-100 p-6 bg-darker-blue rounded-3xl">
      <div className="absolute top-20 -right-2 flex items-center justify-center h-6 w-6 p-1 bg-light-blue rounded-full mb-6 hover:cursor-pointer hover:scale-105 transition-transform" aria-label="Minimize sidebar">
        <ArrowIcon />
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 overflow-hidden">
        <div className="flex flex-col items-center justify-center mb-6">
          <Image 
            src={site.logoUrl} 
            alt={`Logo de ${site.name}`} 
            width={100} 
            height={100} 
            className="max-h-24 max-w-full h-auto w-40 mb-4 object-contain" 
          />
          {/* <Link href="/" className="flex items-center gap-2.5 text-light-blue text-sm w-full">
            <ArrowLongIcon className="-rotate-45" />
            <span>{site.name}</span>
          </Link> */}
        </div>
        <ul className="flex flex-col gap-3">

          <li>
            <p className="text-xs text-gray-100 opacity-30 uppercase tracking-wider mb-2">Content</p>

            <SidebarLink href="/dashboard">
              <DashboardIcon className="icon" />
              Dashboard
            </SidebarLink>

            <SidebarLink
              href="/posts"
              subItems={postTypes.map((postType) => ({
                id: postType.id,
                label: postType.displayName,
                href: `/posts?type=${encodeURIComponent(postType.name)}`,
              }))}
            >
              <PagesIcon className="icon" />
              Posts
            </SidebarLink>

            <SidebarLink href="/media">
              <MediaIcon className="icon" />
              Media
            </SidebarLink>
          </li>

          <li>
            <p className="text-xs text-gray-100 opacity-30 uppercase tracking-wider mb-2">website</p>

            <SidebarLink href="/menus">
              <MenuIcon className="icon" />
              Menus
            </SidebarLink>

            <SidebarLink href="/themes">
              <ThemeIcon className="icon" />
                Themes
            </SidebarLink>

            <SidebarLink href="/users">
              <UserIcon className="icon" />
                Users
            </SidebarLink>

            <SidebarLink href="/settings">
              <SettingsIcon className="icon" />
                Settings
            </SidebarLink>
          </li>

        </ul>
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
  );
}
