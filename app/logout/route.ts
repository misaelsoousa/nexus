import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Usado quando a sessão ainda é válida no cookie, mas a conta deixou de existir na API.
export function GET(request: NextRequest) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
}
