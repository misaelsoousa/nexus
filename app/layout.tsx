import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/layout/sidebar/Sidebar";
import { getTypePosts } from "@/lib/api";
import type { PostType } from "@/types/PostType";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus",
  description: "Nexus CMS",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const dark = (await cookies()).get("nexus-theme")?.value === "dark";
  let postTypes: PostType[] = [];
  try {
    postTypes = await getTypePosts({ next: { revalidate: 60 } });
  } catch {
    postTypes = [];
  }

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${dark ? "dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex min-h-dvh w-full items-start">
          <Sidebar postTypes={postTypes} />
          <section className="min-w-0 flex-1 px-4 pb-8 pt-20 sm:px-6 md:px-8 md:py-6 lg:px-10">
            {children}
          </section>
        </main>
      </body>
    </html>
  );
}
