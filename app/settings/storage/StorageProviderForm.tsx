"use client";

import { useState, useTransition } from "react";
import { saveStorageProviderAction, testStorageProviderAction, type ActionState } from "@/app/actions";
import type { SaveStorageProviderRequest, StorageProvider, StorageProviderType } from "@/types/Storage";
import { Notice, buttonStyles, inputStyles } from "../../components/ui";
import { useT } from "@/app/components/I18nProvider";

type Service = "aws" | "r2" | "spaces" | "other";

const SERVICES: { value: Service; label: string; endpoint?: string; region?: string }[] = [
    { value: "aws", label: "Amazon S3" },
    { value: "r2", label: "Cloudflare R2", endpoint: "https://<account-id>.r2.cloudflarestorage.com", region: "auto" },
    { value: "spaces", label: "DigitalOcean Spaces", endpoint: "https://nyc3.digitaloceanspaces.com", region: "nyc3" },
    { value: "other", label: "Outro compatível (MinIO, Backblaze, Wasabi...)", endpoint: "https://s3.exemplo.com" },
];

const labelStyles = "mb-1 block text-xs font-medium text-muted";

export default function StorageProviderForm({ provider, onDone }: { provider?: StorageProvider; onDone: () => void }) {
    const t = useT();
    const settings = provider?.settings ?? {};
    const [type, setType] = useState<StorageProviderType>(provider?.type ?? 1);
    const [service, setService] = useState<Service>(settings.endpoint ? "other" : "aws");
    const [values, setValues] = useState<Record<string, string>>({
        name: provider?.name ?? "",
        bucket: settings.bucket ?? "",
        region: settings.region ?? "",
        endpoint: settings.endpoint ?? "",
        container: settings.container ?? "",
        prefix: settings.prefix ?? "",
        publicUrl: settings.publicUrl ?? "",
        accessKeyId: "",
        secretAccessKey: "",
        connectionString: "",
    });
    const [result, setResult] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    const editing = Boolean(provider);
    const hasFiles = (provider?.mediaCount ?? 0) > 0;
    const preset = SERVICES.find((item) => item.value === service);

    function field(key: string) {
        return {
            id: `storage-${key}`,
            value: values[key],
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [key]: event.target.value })),
        };
    }

    function body(): SaveStorageProviderRequest {
        const common = { type, name: values.name, prefix: values.prefix, publicUrl: values.publicUrl };

        return type === 1
            ? {
                  ...common,
                  bucket: values.bucket,
                  region: values.region,
                  endpoint: service === "aws" ? "" : values.endpoint,
                  accessKeyId: values.accessKeyId,
                  secretAccessKey: values.secretAccessKey,
              }
            : { ...common, container: values.container, connectionString: values.connectionString };
    }

    function run(action: () => Promise<ActionState>, closeOnSuccess = false) {
        startTransition(async () => {
            const response = await action();
            setResult(response);

            if (closeOnSuccess && !response.error) {
                onDone();
            }
        });
    }

    const locked = hasFiles ? t("Já há arquivos guardados aqui, então este campo não pode mudar.") : undefined;

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                run(() => saveStorageProviderAction(provider?.id ?? null, body()), true);
            }}
            className="flex max-h-[75vh] flex-col"
            autoComplete="off"
        >
            <div className="flex flex-col gap-4 overflow-y-auto p-4">
                {result.error && <Notice>{result.error}</Notice>}
                {result.warning && <Notice tone="warning">{result.warning}</Notice>}
                {result.success && <Notice tone="success">{result.success}</Notice>}

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="storage-name" className={labelStyles}>{t("Nome")}</label>
                        <input {...field("name")} required placeholder={t("Ex.: S3 produção")} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="storage-type" className={labelStyles}>{t("Tipo")}</label>
                        <select
                            id="storage-type"
                            value={type}
                            disabled={editing}
                            onChange={(event) => setType(Number(event.target.value) as StorageProviderType)}
                            className={inputStyles}
                        >
                            <option value={1}>{t("Compatível com S3")}</option>
                            <option value={2}>{t("Azure Blob Storage")}</option>
                        </select>
                    </div>
                </div>

                {type === 1 ? (
                    <>
                        <div>
                            <label htmlFor="storage-service" className={labelStyles}>{t("Serviço")}</label>
                            <select
                                id="storage-service"
                                value={service}
                                disabled={hasFiles}
                                onChange={(event) => {
                                    const next = event.target.value as Service;
                                    setService(next);
                                    const nextPreset = SERVICES.find((item) => item.value === next);
                                    if (nextPreset?.region && !values.region) setValues((current) => ({ ...current, region: nextPreset.region! }));
                                }}
                                className={inputStyles}
                            >
                                {SERVICES.map((item) => (
                                    <option key={item.value} value={item.value}>{t(item.label)}</option>
                                ))}
                            </select>
                        </div>

                        {service !== "aws" && (
                            <div>
                                <label htmlFor="storage-endpoint" className={labelStyles}>{t("Endpoint")}</label>
                                <input {...field("endpoint")} required disabled={hasFiles} title={locked} placeholder={preset?.endpoint} className={`${inputStyles} font-mono`} />
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="storage-bucket" className={labelStyles}>{t("Bucket")}</label>
                                <input {...field("bucket")} required disabled={hasFiles} title={locked} placeholder={t("meu-site-arquivos")} className={`${inputStyles} font-mono`} />
                            </div>
                            <div>
                                <label htmlFor="storage-region" className={labelStyles}>{t("Região")}</label>
                                <input
                                    {...field("region")}
                                    required={service === "aws"}
                                    disabled={hasFiles}
                                    title={locked}
                                    placeholder={preset?.region ?? "us-east-1"}
                                    className={`${inputStyles} font-mono`}
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="storage-accessKeyId" className={labelStyles}>{t("Access Key ID")}</label>
                                <input
                                    {...field("accessKeyId")}
                                    required={!editing}
                                    autoComplete="off"
                                    spellCheck={false}
                                    placeholder={editing ? settings.accessKeyId : t("AKIA...")}
                                    className={`${inputStyles} font-mono`}
                                />
                            </div>
                            <div>
                                <label htmlFor="storage-secretAccessKey" className={labelStyles}>{t("Secret Access Key")}</label>
                                <input
                                    {...field("secretAccessKey")}
                                    type="password"
                                    required={!editing}
                                    autoComplete="new-password"
                                    placeholder={editing ? "●●●●●●●● salva" : ""}
                                    className={`${inputStyles} font-mono`}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label htmlFor="storage-container" className={labelStyles}>{t("Container")}</label>
                            <input {...field("container")} required disabled={hasFiles} title={locked} placeholder={t("midia")} className={`${inputStyles} font-mono`} />
                        </div>
                        <div>
                            <label htmlFor="storage-connectionString" className={labelStyles}>{t("Connection string")}</label>
                            <input
                                {...field("connectionString")}
                                type="password"
                                required={!editing}
                                autoComplete="new-password"
                                placeholder={editing ? "●●●●●●●● salva" : t("DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...")}
                                className={`${inputStyles} font-mono`}
                            />
                            <p className="mt-1 text-xs text-muted">{t("No portal do Azure: conta de armazenamento → Chaves de acesso.")}</p>
                        </div>
                    </>
                )}

                {editing && (
                    <p className="rounded-md bg-surface-2 px-3 py-2 text-xs text-muted">
                        {t("As credenciais salvas nunca são exibidas. Deixe os campos de chave vazios para manter as atuais ou digite a chave inteira para substituir.")}
                    </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="storage-prefix" className={labelStyles}>{t("Pasta (opcional)")}</label>
                        <input {...field("prefix")} disabled={hasFiles} title={locked} placeholder={t("nexus")} className={`${inputStyles} font-mono`} />
                    </div>
                    <div>
                        <label htmlFor="storage-publicUrl" className={labelStyles}>{t("URL pública (opcional)")}</label>
                        <input {...field("publicUrl")} placeholder={t("https://cdn.meusite.com")} className={`${inputStyles} font-mono`} />
                    </div>
                </div>
                <p className="-mt-2 text-xs text-muted">
                    {type === 1
                        ? t("Os arquivos precisam de leitura pública. Use a URL pública quando houver um CDN (CloudFront, domínio do R2...) na frente do bucket.")
                        : t("Os arquivos precisam de leitura pública. Use a URL pública quando houver um CDN na frente do container.")}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/50 px-4 py-3">
                <button type="button" onClick={() => run(() => testStorageProviderAction(provider?.id ?? null, body()))} disabled={pending} className={buttonStyles.secondary}>
                    {pending ? t("Aguarde...") : t("Testar conexão")}
                </button>
                <div className="flex gap-2">
                    <button type="button" onClick={onDone} className={buttonStyles.ghost}>{t("Cancelar")}</button>
                    <button type="submit" disabled={pending} className={buttonStyles.primary}>
                        {editing ? t("Salvar alterações") : t("Salvar")}
                    </button>
                </div>
            </div>
        </form>
    );
}
