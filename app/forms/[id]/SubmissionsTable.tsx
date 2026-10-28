"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteFormSubmissionsAction, type ActionState } from "@/app/actions";
import type { FormDetails, FormSubmission } from "@/types/Form";
import { Notice, buttonStyles, compactSelectStyles, formatDate } from "../../components/ui";
import SubmissionModal from "./SubmissionModal";
import { formatSubmissionValue, valueFields } from "./format";
import { useT } from "@/app/components/I18nProvider";

const PREVIEW_COLUMNS = 3;
const PREVIEW_CLASSES = ["", "hidden md:table-cell", "hidden xl:table-cell"];

export default function SubmissionsTable({
    form,
    submissions,
    canDelete,
    emptyMessage,
}: {
    form: FormDetails;
    submissions: FormSubmission[];
    canDelete: boolean;
    emptyMessage: string;
}) {
    const t = useT();
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState("");
    const [openId, setOpenId] = useState<string | null>(null);
    const [result, setResult] = useState<ActionState>({});
    const [pending, startTransition] = useTransition();

    const columns = valueFields(form.fields).filter((field) => field.type !== 13).slice(0, PREVIEW_COLUMNS);
    const allSelected = submissions.length > 0 && submissions.every((submission) => selected.has(submission.id));

    function toggle(id: string) {
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function remove(ids: string[]) {
        startTransition(async () => {
            const response = await deleteFormSubmissionsAction(form.id, ids);
            setResult(response);
            if (!response.error) {
                setSelected(new Set());
                setOpenId(null);
            }
        });
    }

    function applyBulk() {
        if (bulkAction !== "delete" || selected.size === 0) return;
        if (!window.confirm(selected.size === 1 ? t("Excluir 1 envio permanentemente? Os arquivos anexados também serão apagados.") : t("Excluir {count} envios permanentemente? Os arquivos anexados também serão apagados.", { count: selected.size }))) return;
        remove([...selected]);
    }

    return (
        <div className="flex flex-col gap-3">
            {result.error && <Notice>{result.error}</Notice>}
            {result.success && <Notice tone="success">{result.success}</Notice>}

            {canDelete && (
                <div className="flex flex-wrap items-center gap-2">
                    <select aria-label={t("Ações em massa")} value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} className={compactSelectStyles}>
                        <option value="">{t("Ações em massa")}</option>
                        <option value="delete">{t("Excluir permanentemente")}</option>
                    </select>
                    <button type="button" onClick={applyBulk} disabled={pending || !bulkAction || selected.size === 0} className={buttonStyles.secondary}>
                        {t("Aplicar")}
                    </button>
                </div>
            )}

            <div className="animate-rise overflow-hidden rounded-lg border border-line bg-surface">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="border-b border-line text-left">
                            {canDelete && (
                                <th className="w-10 px-3 py-2.5">
                                    <input
                                        type="checkbox"
                                        aria-label={t("Selecionar todos")}
                                        checked={allSelected}
                                        onChange={() => setSelected(allSelected ? new Set() : new Set(submissions.map((submission) => submission.id)))}
                                        className="size-4 accent-[var(--accent)]"
                                    />
                                </th>
                            )}
                            {columns.length === 0 ? (
                                <th className="px-3 py-2.5 font-medium">{t("Envio")}</th>
                            ) : (
                                columns.map((field, index) => (
                                    <th key={field.key} className={`px-3 py-2.5 font-medium ${PREVIEW_CLASSES[index]}`}>{field.label}</th>
                                ))
                            )}
                            <th className="hidden px-3 py-2.5 font-medium sm:table-cell">{t("Recebido em")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={Math.max(columns.length, 1) + (canDelete ? 2 : 1)} className="px-4 py-10 text-center text-muted">{emptyMessage}</td>
                            </tr>
                        ) : (
                            submissions.map((submission) => (
                                <tr
                                    key={submission.id}
                                    onClick={() => setOpenId(submission.id)}
                                    aria-selected={selected.has(submission.id)}
                                    className={`cursor-pointer align-top transition-colors hover:bg-surface-2/60 aria-selected:bg-accent-soft ${submission.isRead ? "" : "font-semibold"}`}
                                >
                                    {canDelete && (
                                        <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                aria-label={t("Selecionar envio")}
                                                checked={selected.has(submission.id)}
                                                onChange={() => toggle(submission.id)}
                                                className="size-4 accent-[var(--accent)]"
                                            />
                                        </td>
                                    )}
                                    {columns.length === 0 ? (
                                        <td className="px-3 py-3">
                                            <PreviewCell unread={!submission.isRead} text="Ver envio" />
                                        </td>
                                    ) : (
                                        columns.map((field, index) => (
                                            <td key={field.key} className={`max-w-0 px-3 py-3 ${PREVIEW_CLASSES[index]}`}>
                                                <PreviewCell unread={index === 0 && !submission.isRead} text={formatSubmissionValue(t, field, submission) || "—"} />
                                                {index === 0 && <p className="mt-0.5 text-xs font-normal text-muted sm:hidden">{formatDate(t, submission.createdAt)}</p>}
                                            </td>
                                        ))
                                    )}
                                    <td className="hidden whitespace-nowrap px-3 py-3 text-muted sm:table-cell">{formatDate(t, submission.createdAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {openId && (
                <SubmissionModal
                    form={form}
                    submissionId={openId}
                    canDelete={canDelete}
                    deleting={pending}
                    onDelete={() => window.confirm(t("Excluir este envio permanentemente?")) && remove([openId])}
                    onClose={() => {
                        setOpenId(null);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

function PreviewCell({ unread, text }: { unread: boolean; text: string }) {
    const t = useT();
    return (
        <span className="flex items-center gap-2">
            {unread && <span className="size-2 shrink-0 rounded-full bg-accent" title={t("Não lido")} />}
            <span className="truncate">{text}</span>
        </span>
    );
}
