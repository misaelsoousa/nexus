import type { Translations } from "./Language";
import type { FieldDefinition } from "./PostType";

export type PageSummary = {
    id: string;
    name: string;
    displayName: string;
    fieldCount: number;
    createdAt: string;
    updatedAt: string;
};

export type PageDetails = Omit<PageSummary, "fieldCount"> & {
    fields: FieldDefinition[];
    values: Record<string, unknown>;
    translations: Translations;
};
