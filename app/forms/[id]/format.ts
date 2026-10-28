import type { T } from "@/lib/i18n";
import type { FormSubmission } from "@/types/Form";
import type { FieldDefinition } from "@/types/PostType";

export function formatSubmissionValue(t: T, field: FieldDefinition, submission: FormSubmission) {
    if (field.type === 13) {
        return submission.files.filter((file) => file.fieldKey === field.key).map((file) => file.fileName).join(", ");
    }

    const value = submission.values[field.key];

    if (value === undefined || value === null) return "";
    if (typeof value === "boolean") return value ? t("Sim") : t("Não");

    if (field.type === 4 && typeof value === "string") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(t.intl, { dateStyle: "medium", timeZone: "UTC" }).format(date);
    }

    return String(value);
}

/** Campos que guardam valor (sem seções), na ordem do formulário. */
export function valueFields(fields: FieldDefinition[]) {
    return fields.filter((field) => field.type !== 9);
}
