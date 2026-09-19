export const SESSION_COOKIE = "nexus_session";

export type Session = {
    token: string;
    name: string;
    email: string;
    expiresAt: number;
};

export function readSession(token: string | undefined): Session | null {
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        const expiresAt = Number(payload.exp) * 1000;

        if (!expiresAt || expiresAt <= Date.now()) {
            return null;
        }

        return { token, name: String(payload.name ?? ""), email: String(payload.email ?? ""), expiresAt };
    } catch {
        return null;
    }
}
