export type StorageProviderType = 0 | 1 | 2;

export type StorageProvider = {
    id: string;
    type: StorageProviderType;
    name: string;
    isActive: boolean;
    isBuiltIn: boolean;
    settings: Record<string, string>;
    hasSecrets: boolean;
    mediaCount: number;
    createdAt: string;
    updatedAt: string;
};

export type StorageMigrationStatus = 0 | 1 | 2;

export type StorageMigration = {
    id: string;
    targetProviderId: string;
    targetProviderName: string;
    deleteSource: boolean;
    status: StorageMigrationStatus;
    total: number;
    migrated: number;
    failed: number;
    failures: { mediaId: string; fileName: string; error: string }[];
    startedAt: string;
    finishedAt: string | null;
};

export type StorageOverview = {
    providers: StorageProvider[];
    pendingMigration: number;
    migration: StorageMigration | null;
};

export type StorageTest = {
    publicUrlReadable: boolean;
    warning: string | null;
};

export type SaveStorageProviderRequest = {
    type: StorageProviderType;
    name: string;
    bucket?: string;
    region?: string;
    endpoint?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    container?: string;
    connectionString?: string;
    prefix?: string;
    publicUrl?: string;
};

export const STORAGE_TYPE_LABELS: Record<StorageProviderType, string> = {
    0: "Servidor da API",
    1: "Compatível com S3",
    2: "Azure Blob Storage",
};

export function describeStorage(provider: StorageProvider) {
    const { settings } = provider;

    if (provider.type === 1) {
        return [settings.bucket, settings.region ?? settings.endpoint, settings.prefix && `/${settings.prefix}`].filter(Boolean).join(" · ");
    }

    if (provider.type === 2) {
        return [settings.accountName, settings.container, settings.prefix && `/${settings.prefix}`].filter(Boolean).join(" · ");
    }

    return "Pasta de arquivos da própria API";
}
