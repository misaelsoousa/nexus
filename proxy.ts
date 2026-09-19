import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "./lib/session";

const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!session && !isPublic) {
        const url = new URL("/login", request.url);

        if (pathname !== "/") {
            url.searchParams.set("next", pathname + search);
        }

        const response = NextResponse.redirect(url);
        response.cookies.delete(SESSION_COOKIE);
        return response;
    }

    if (session && isPublic) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
