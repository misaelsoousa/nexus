import type { Metadata } from "next";
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
  let postTypes: PostType[] = [];
  try {
    postTypes = await getTypePosts({ next: { revalidate: 60 } });
  } catch {
    postTypes = [];
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex max-w-[1920px] mx-auto w-full">
        <Sidebar postTypes={postTypes} />
        {children}
        </main>
      </body>
    </html>
  );
}
