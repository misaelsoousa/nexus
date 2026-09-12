export type Language = {
    code: string;
    name: string;
    isDefault: boolean;
};

export type Translation = {
    inherit: boolean;
    title?: string | null;
    fields: Record<string, unknown>;
};

export type Translations = Record<string, Translation>;

export const EMPTY_TRANSLATION: Translation = { inherit: true, title: null, fields: {} };
