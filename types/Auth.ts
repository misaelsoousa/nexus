import type { Permission } from "@/lib/permissions";

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export type AuthResponse = {
    name: string;
    email: string;
    token: string;
    expiresAt: string;
};

export type AuthStatus = {
    registrationOpen: boolean;
};

export type RoleSummary = {
    id: string;
    name: string;
    isAdmin: boolean;
};

export type CurrentUser = {
    id: string;
    name: string;
    email: string;
    role: RoleSummary | null;
    isAdmin: boolean;
    permissions: Permission[];
};
