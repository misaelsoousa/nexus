import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { cache } from "react";
import type { CurrentUser } from "@/types/Auth";
import { ApiError, getMe } from "./api";
import { can, type Permission } from "./permissions";
import { SESSION_COOKIE, readSession } from "./session";

/**
 * Usuário logado, com cargo e permissões lidos da API (uma vez por requisição).
 * Se a conta não existe mais, encerra a sessão.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
    if (!readSession((await cookies()).get(SESSION_COOKIE)?.value)) {
        return null;
    }

    try {
        return await getMe();
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            redirect("/logout");
        }

        throw error;
    }
});

export async function requireUser() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return user;
}

export async function requirePermission(...anyOf: Permission[]) {
    const user = await requireUser();

    if (!can(user, ...anyOf)) {
        forbidden();
    }

    return user;
}

export async function requireAdmin() {
    const user = await requireUser();

    if (!user.isAdmin) {
        forbidden();
    }

    return user;
}
