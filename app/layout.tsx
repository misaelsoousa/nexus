import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { unstable_rethrow } from "next/navigation";
import "./globals.css";
import AppShell from "./components/nav/AppShell";
import { I18nProvider } from "./components/I18nProvider";
import { PreferencesSync } from "./components/preferences/PreferenceControls";
import { getForms, getPostTypes } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getLocaleInfo } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { can } from "@/lib/permissions";
import { preferencesScript } from "@/lib/preferences-script";
import type { CurrentUser } from "@/types/Auth";
import type { FormSummary } from "@/types/Form";
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
  title: {
    default: "Nexus",
    template: "%s · Nexus",
  },
  description: "Nexus CMS",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  let user: CurrentUser | null = null;
  let postTypes: PostType[] = [];

  try {
    user = await getCurrentUser();
  } catch (error) {
    unstable_rethrow(error);
  }

  if (can(user, "posts.view")) {
    try {
      postTypes = await getPostTypes();
    } catch {
      postTypes = [];
    }
  }

  const forms = can(user, "forms.view") ? await getForms().catch((): FormSummary[] => []) : [];

  return (
    <html
      lang={getLocaleInfo(locale).htmlLang}
      data-theme="light"
      data-sidebar="expanded"
      data-accent="blue"
      data-motion="full"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body className="min-h-full">
        <PreferencesSync />
        <I18nProvider locale={locale}>
          <AppShell postTypes={postTypes} forms={forms} user={user}>
            {children}
          </AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
