import type { ReactNode } from "react";
import type { PostType } from "./PostType";
export type SidebarProps = { postTypes: PostType[] };
export type SidebarSubItem = { id: string; href: string; label: string };
export type SidebarLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  subItems?: SidebarSubItem[];
  onNavigate?: () => void;
};
