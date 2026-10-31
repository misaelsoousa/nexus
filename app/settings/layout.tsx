import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { PageHeader } from "../components/ui";
import SettingsTabs from "./SettingsTabs";

export default async function SettingsLayout({ children }: LayoutProps<"/settings">) {
    const t = await getT();
    const user = await getCurrentUser();

    return (
        <>
            <PageHeader title={t("Configurações")} />
            <SettingsTabs isAdmin={Boolean(user?.isAdmin)} />
            {children}
        </>
    );
}
