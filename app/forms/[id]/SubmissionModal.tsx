"use client";

import { useEffect, useState } from "react";
import { getFormSubmissionAction } from "@/app/actions";
import type { FormDetails, FormSubmission } from "@/types/Form";
import type { FieldDefinition } from "@/types/PostType";
import { FileIcon } from "../../components/Icons";
import Modal from "../../components/Modal";
import { Notice, buttonStyles, formatBytes, formatDate } from "../../components/ui";
import { formatSubmissionValue } from "./format";
import { useT } from "@/app/components/I18nProvider";

export default function SubmissionModal({
    form,
    submissionId,
    canDelete,
    deleting,
    onDelete,
    onClose,
}: {
    form: FormDetails;
    submissionId: string;
    canDelete: boolean;
    deleting: boolean;
    onDelete: () => void;
    onClose: () => void;
}) {
    const t = useT();
    const [state, setState] = useState<{ id: string; submission?: FormSubmission; error?: string } | null>(null);

    useEffect(() => {
        let active = true;

        getFormSubmissionAction(form.id, submissionId).then((response) => {
            if (active) setState({ id: submissionId, ...response });
        });

        return () => {
            active = false;
        };
    }, [form.id, submissionId]);

    const current = state?.id === submissionId ? state : null;
    const submission = current?.submission;

    return (
        <Modal title={form.displayName} onClose={onClose} className="max-w-2xl">
            <div className="flex flex-col gap-4 p-4">
                {!current && <p className="py-6 text-center text-[13px] text-muted">{t("Carregando envio...")}</p>}
                {current?.error && <Notice>{current.error}</Notice>}

                {submission && (
                    <>
                        <p className="text-xs text-muted">{t("Recebido em {date}", { date: formatDate(t, submission.createdAt) })}</p>

                        {submission.notificationError && <Notice tone="warning">{submission.notificationError}</Notice>}

                        <dl className="divide-y divide-line rounded-md border border-line text-[13px]">
                            {form.fields.map((field) =>
                                field.type === 9 ? (
                                    <div key={field.key} className="bg-surface-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                        {field.label}
                                    </div>
                                ) : (
                                    <div key={field.key} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4">
                                        <dt className="text-muted">{field.label}</dt>
                                        <dd className="min-w-0 break-words whitespace-pre-wrap">
                                            <FieldValue field={field} submission={submission} formId={form.id} />
                                        </dd>
                                    </div>
                                ),
                            )}
                        </dl>
                    </>
                )}
            </div>

            {submission && (
                <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                    {canDelete ? (
                        <button type="button" onClick={onDelete} disabled={deleting} className="text-[13px] text-danger hover:underline cursor-pointer disabled:opacity-50">
                            {deleting ? t("Excluindo...") : t("Excluir envio")}
                        </button>
                    ) : (
                        <span />
                    )}
                    <button type="button" onClick={onClose} className={buttonStyles.secondary}>
                        {t("Fechar")}
                    </button>
                </div>
            )}
        </Modal>
    );
}

function FieldValue({ field, submission, formId }: { field: FieldDefinition; submission: FormSubmission; formId: string }) {
    const t = useT();
    if (field.type === 13) {
        const files = submission.files.filter((file) => file.fieldKey === field.key);

        if (files.length === 0) return <span className="text-subtle">—</span>;

        return (
            <ul className="flex flex-col gap-1">
                {files.map((file) => (
                    <li key={file.id}>
                        <a
                            href={`/forms/${formId}/submissions/${submission.id}/files/${file.id}`}
                            className="inline-flex items-center gap-1.5 text-accent hover:underline"
                        >
                            <FileIcon className="size-4 shrink-0" />
                            {file.fileName}
                            <span className="text-xs text-muted">({formatBytes(t, file.size)})</span>
                        </a>
                    </li>
                ))}
            </ul>
        );
    }

    const text = formatSubmissionValue(t, field, submission);

    if (!text) return <span className="text-subtle">—</span>;

    const href = field.type === 10 ? `mailto:${text}` : field.type === 11 ? `tel:${text.replace(/[^\d+]/g, "")}` : field.type === 12 ? text : null;

    return href ? (
        <a href={href} target={field.type === 12 ? "_blank" : undefined} rel="noreferrer" className="text-accent hover:underline">
            {text}
        </a>
    ) : (
        <>{text}</>
    );
}
