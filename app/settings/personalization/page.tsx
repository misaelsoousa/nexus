import type { Metadata } from "next";
import { getT } from "@/lib/i18n-server";
import PersonalizationSettings from "./PersonalizationSettings";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getT();

    return { title: t("Personalização") };
}

export default function PersonalizationPage() {
    return <PersonalizationSettings />;
}
