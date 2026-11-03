"use client";

import { resetPreferences } from "@/lib/preferences";
import { useT } from "../../components/I18nProvider";
import {
    AccentPicker,
    LocaleCards,
    MotionControl,
    SidebarControl,
    ThemeCards,
} from "../../components/preferences/PreferenceControls";
import { Card, CardHeader, buttonStyles } from "../../components/ui";

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-[13px] font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
            </div>
            {children}
        </div>
    );
}

export default function PersonalizationSettings() {
    const t = useT();

    return (
        <div className="flex flex-col gap-5">
            <Card className="animate-rise overflow-hidden">
                <CardHeader title={t("Idioma do painel")} />
                <div className="p-4">
                    <p className="mb-3 text-[13px] text-muted">
                        {t("Idioma dos menus, botões e mensagens do painel, salvo neste navegador. Não muda o idioma do conteúdo publicado.")}
                    </p>
                    <LocaleCards />
                </div>
            </Card>

            <Card className="animate-rise overflow-hidden">
                <CardHeader title={t("Tema")} />
                <div className="p-4">
                    <p className="mb-3 text-[13px] text-muted">{t("Claro, escuro ou acompanhando o sistema operacional.")}</p>
                    <ThemeCards />
                </div>
            </Card>

            <Card className="animate-rise overflow-hidden">
                <CardHeader title={t("Cor de destaque")} />
                <div className="p-4">
                    <p className="mb-3 text-[13px] text-muted">{t("Usada em botões, links, itens selecionados e no menu ativo.")}</p>
                    <AccentPicker />
                </div>
            </Card>

            <Card className="animate-rise overflow-hidden">
                <CardHeader title={t("Interface")} />
                <div className="divide-y divide-line">
                    <Row title={t("Menu lateral")} description={t("Recolhido, o menu mostra só os ícones (em telas grandes).")}>
                        <SidebarControl />
                    </Row>
                    <Row title={t("Animações")} description={t("Reduzidas desligam transições e efeitos de entrada.")}>
                        <MotionControl />
                    </Row>
                </div>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
                <span>{t("Tema, cores e interface ficam salvos neste navegador.")}</span>
                <button type="button" onClick={resetPreferences} className={buttonStyles.secondary}>
                    {t("Restaurar padrões visuais")}
                </button>
            </div>
        </div>
    );
}
