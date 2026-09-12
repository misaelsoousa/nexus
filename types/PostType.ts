export type PostType = {
    id: string;
    name: string;
    displayName: string;
    schemaVersion: number;
    createdAt: string;
};

export type FieldType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** Onde os campos são usados: conteúdo (posts e páginas) ou formulários públicos. Espelha FieldsMapper na API. */
export type FieldScope = "content" | "form";

export type FieldOptions = {
    choices?: string[];
    postType?: string;
};

export type FieldDefinition = {
    key: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: FieldOptions | null;
};

export type PostTypeDetails = PostType & {
    fields: FieldDefinition[];
};

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: 0, label: "Texto" },
    { value: 1, label: "Texto longo" },
    { value: 2, label: "Número" },
    { value: 3, label: "Sim/Não" },
    { value: 4, label: "Data" },
    { value: 5, label: "Seleção" },
    { value: 6, label: "Mídia" },
    { value: 7, label: "Referência a post" },
    { value: 8, label: "Cor" },
    { value: 10, label: "E-mail" },
    { value: 11, label: "Telefone" },
    { value: 12, label: "Link (URL)" },
    { value: 13, label: "Arquivo (upload)" },
    { value: 9, label: "Seção (agrupador)" },
];

const SCOPE_EXCLUDED: Record<FieldScope, FieldType[]> = {
    content: [13],
    form: [6, 7],
};

export function getFieldTypes(scope: FieldScope) {
    return FIELD_TYPES.filter((item) => !SCOPE_EXCLUDED[scope].includes(item.value));
}

export function getFieldTypeLabel(type: number) {
    return FIELD_TYPES.find((item) => item.value === type)?.label ?? "Campo";
}
