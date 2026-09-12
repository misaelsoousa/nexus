import type { FieldDefinition } from "./PostType";

export type FormSummary = {
    id: string;
    name: string;
    displayName: string;
    fieldCount: number;
    isActive: boolean;
    submissionCount: number;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
};

export type FormDetails = {
    id: string;
    name: string;
    displayName: string;
    isActive: boolean;
    notifyEmails: string[];
    fields: FieldDefinition[];
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
};

export type SaveFormRequest = {
    displayName: string;
    isActive: boolean;
    notifyEmails: string[];
    fields: FieldDefinition[];
};

export type FormSubmissionFile = {
    id: string;
    fieldKey: string;
    fileName: string;
    contentType: string;
    size: number;
};

export type FormSubmission = {
    id: string;
    values: Record<string, unknown>;
    files: FormSubmissionFile[];
    isRead: boolean;
    notificationError: string | null;
    createdAt: string;
};

export type FormSubmissionList = {
    submissions: FormSubmission[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};

export type SmtpSettings = {
    configured: boolean;
    host: string;
    port: number;
    useSsl: boolean;
    username: string | null;
    hasPassword: boolean;
    fromEmail: string;
    fromName: string | null;
    updatedAt: string | null;
};

export type SaveSmtpSettingsRequest = {
    host: string;
    port: number;
    useSsl: boolean;
    username: string | null;
    password: string | null;
    fromEmail: string;
    fromName: string | null;
};
