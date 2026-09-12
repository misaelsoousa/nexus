import type { Permission } from "@/lib/permissions";
import type { RoleSummary } from "./Auth";

export type User = {
    id: string;
    name: string;
    email: string;
    role: RoleSummary | null;
    createdAt: string;
};

export type Role = {
    id: string;
    name: string;
    isAdmin: boolean;
    permissions: Permission[];
    userCount: number;
    createdAt: string;
};

export type CreateUserRequest = {
    name: string;
    email: string;
    password: string;
    roleId: string | null;
};

export type SaveRoleRequest = {
    name: string;
    permissions: Permission[];
};
